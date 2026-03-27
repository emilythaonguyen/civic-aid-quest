import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseQuestions(raw: unknown): { id: string; text: string; type: string }[] {
  try {
    let parsed: unknown = raw;
    if (typeof parsed === "string") {
      const unfenced = parsed.trim().startsWith("```")
        ? parsed.trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
        : parsed.trim();
      parsed = JSON.parse(unfenced);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
    }
    if (parsed && typeof parsed === "object" && "questionnaire" in (parsed as Record<string, unknown>)) {
      const inner = (parsed as Record<string, unknown>).questionnaire;
      if (typeof inner === "string") {
        try { parsed = JSON.parse(inner); } catch { /* empty */ }
      } else {
        parsed = inner;
      }
    }
    const obj = parsed as Record<string, unknown>;
    const rawQs = Array.isArray(obj?.questions) ? obj.questions
      : Array.isArray(obj?.question_list) ? obj.question_list : [];

    return rawQs
      .map((q: unknown, i: number) => {
        if (!q || typeof q !== "object") return null;
        const c = q as Record<string, unknown>;
        const id = typeof c.id === "string" ? c.id : String(c.id ?? `q_${i + 1}`);
        const text = typeof c.text === "string" ? c.text : typeof c.question === "string" ? c.question : "";
        const type = c.type === "rating_1_5" || c.type === "yes_no" || c.type === "open_text" ? c.type : null;
        if (!text || !type) return null;
        return { id, text, type };
      })
      .filter(Boolean) as { id: string; text: string; type: string }[];
  } catch {
    return [];
  }
}

async function analyzeSentiment(
  surveyId: string,
  responses: Record<string, unknown>,
  questions: { id: string; text: string; type: string }[],
  apiKey: string,
  supabase: ReturnType<typeof createClient>,
): Promise<{ success: boolean; label?: string; error?: string }> {
  const surveyText = questions
    .map((q) => `Q: ${q.text}\nA: ${responses[q.id] ?? "No response"}`)
    .join("\n\n");

  const systemPrompt = `You are a sentiment analysis engine. Analyze the following survey responses from a citizen about a government service request. You must call the analyze_sentiment function with your analysis.

Guidelines:
- sentiment_score: integer 0-100 (0 = very negative, 50 = neutral, 100 = very positive)
- sentiment_label: exactly one of "positive", "neutral", or "negative"
- confidence: exactly one of "high", "medium", or "low"

Consider ratings, yes/no answers, and open text tone together.`;

  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: surveyText },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_sentiment",
            description: "Return sentiment analysis results for the survey",
            parameters: {
              type: "object",
              properties: {
                sentiment_score: { type: "integer" },
                sentiment_label: { type: "string", enum: ["positive", "neutral", "negative"] },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["sentiment_score", "sentiment_label", "confidence"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "analyze_sentiment" } },
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    return { success: false, error: `AI error ${aiResponse.status}: ${errText.slice(0, 200)}` };
  }

  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    // Fallback: try to extract from message content
    const content = aiData.choices?.[0]?.message?.content;
    if (content) {
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.sentiment_label && parsed.sentiment_score !== undefined) {
            const { error: updateErr } = await supabase.from("surveys").update({
              sentiment_score: parsed.sentiment_score,
              sentiment_label: parsed.sentiment_label,
              confidence: parsed.confidence ?? "medium",
            }).eq("id", surveyId);
            if (updateErr) return { success: false, error: `DB error: ${updateErr.message}` };
            return { success: true, label: parsed.sentiment_label };
          }
        }
      } catch { /* ignore */ }
    }
    return { success: false, error: "No tool call or parseable content in AI response" };
  }

  let sentiment;
  try {
    sentiment = JSON.parse(toolCall.function.arguments);
  } catch {
    return { success: false, error: "Failed to parse tool call arguments" };
  }

  const { error: updateErr } = await supabase.from("surveys").update({
    sentiment_score: sentiment.sentiment_score,
    sentiment_label: sentiment.sentiment_label,
    confidence: sentiment.confidence,
  }).eq("id", surveyId);

  if (updateErr) return { success: false, error: `DB error: ${updateErr.message}` };
  return { success: true, label: sentiment.sentiment_label };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all submitted surveys missing sentiment
    const { data: surveys, error: fetchErr } = await supabase
      .from("surveys")
      .select("id, responses, questionnaire")
      .not("submitted_at", "is", null)
      .is("sentiment_label", null);

    if (fetchErr) throw fetchErr;

    const results: { id: string; success: boolean; label?: string; error?: string }[] = [];

    for (const s of surveys ?? []) {
      const responses = (s.responses as Record<string, unknown>) ?? {};
      const questions = parseQuestions(s.questionnaire);

      if (!questions.length || !Object.keys(responses).length) {
        results.push({ id: s.id, success: false, error: "No questions or responses" });
        continue;
      }

      const result = await analyzeSentiment(s.id, responses, questions, LOVABLE_API_KEY, supabase);
      results.push({ id: s.id, ...result });

      // Rate limit safety
      if (surveys && surveys.indexOf(s) < surveys.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("backfill-sentiment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
