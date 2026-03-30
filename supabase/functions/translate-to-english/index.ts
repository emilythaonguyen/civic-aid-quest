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
    const { location, description, sourceLang } = await req.json();

    if (!sourceLang || sourceLang === "en") {
      return new Response(
        JSON.stringify({ translatedLocation: location || "", translatedDescription: description || "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY not set — returning original text");
      return new Response(
        JSON.stringify({ translatedLocation: location || "", translatedDescription: description || "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Translate the following two fields to English. Return ONLY a JSON object with two keys: "location" and "description". No explanation, no preamble, no markdown formatting, no code fences.\n\nLocation: "${location || ""}"\nDescription: "${description || ""}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return new Response(
        JSON.stringify({ translatedLocation: location || "", translatedDescription: description || "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const content = result.content?.[0]?.text?.trim() || "";

    let translatedLocation = location || "";
    let translatedDescription = description || "";

    try {
      const parsed = JSON.parse(content);
      translatedLocation = parsed.location || translatedLocation;
      translatedDescription = parsed.description || translatedDescription;
    } catch {
      console.warn("Failed to parse Claude response as JSON, returning originals:", content);
    }

    return new Response(
      JSON.stringify({ translatedLocation, translatedDescription }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Translation function error:", err);
    return new Response(
      JSON.stringify({ error: "Translation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
