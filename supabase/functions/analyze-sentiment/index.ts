import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { survey_id, responses, questions } = await req.json();

    if (!survey_id || !responses || !questions) {
      return new Response(
        JSON.stringify({ error: "Missing survey_id, responses, or questions" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a readable summary of the survey responses for AI analysis
    const surveyText = questions
      .map((q: { text: string; id: string; type: string }) => {
        const answer = responses[q.id];
        return `Q: ${q.text}\nA: ${answer ?? "No response"}`;
      })
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
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
                  sentiment_score: {
                    type: "integer",
                    description: "Score from 0-100 (0=very negative, 50=neutral, 100=very positive)",
                  },
                  sentiment_label: {
                    type: "string",
                    enum: ["positive", "neutral", "negative"],
                    description: "Overall sentiment label",
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Confidence in the analysis",
                  },
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
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call in AI response");
    }

    const sentiment = JSON.parse(toolCall.function.arguments);

    // Update the survey row with sentiment data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateErr } = await supabase
      .from("surveys")
      .update({
        sentiment_score: sentiment.sentiment_score,
        sentiment_label: sentiment.sentiment_label,
        confidence: sentiment.confidence,
      })
      .eq("id", survey_id);

    if (updateErr) {
      console.error("Failed to update survey:", updateErr);
      throw new Error("Failed to save sentiment data");
    }

    return new Response(JSON.stringify(sentiment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-sentiment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
