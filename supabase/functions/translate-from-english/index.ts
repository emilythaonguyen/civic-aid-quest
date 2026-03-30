import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { texts, targetLang } = await req.json();

    // texts: string[] — array of English strings to translate
    // targetLang: string — target language code (es, fr, etc.)

    if (!targetLang || targetLang === "en" || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ translatedTexts: texts || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not set — returning original texts");
      return new Response(
        JSON.stringify({ translatedTexts: texts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langNames: Record<string, string> = {
      es: "Spanish", fr: "French", pt: "Portuguese", vi: "Vietnamese",
      zh: "Chinese Simplified", ko: "Korean", ar: "Arabic",
      ht: "Haitian Creole", de: "German",
    };

    const langName = langNames[targetLang] || targetLang;

    const numbered = texts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a translation engine. Translate each numbered line from English to ${langName}. Return ONLY a JSON array of strings with the translations in the same order. No explanation, no markdown, no code fences.`,
            },
            { role: "user", content: numbered },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ translatedTexts: texts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content?.trim() || "";

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length === texts.length) {
        return new Response(
          JSON.stringify({ translatedTexts: parsed }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      console.warn("Failed to parse translation response as JSON array:", content);
    }

    // Fallback: return originals
    return new Response(
      JSON.stringify({ translatedTexts: texts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Translation function error:", err);
    return new Response(
      JSON.stringify({ translatedTexts: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
