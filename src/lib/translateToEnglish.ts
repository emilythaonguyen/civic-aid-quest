import { supabase } from "@/integrations/supabase/client";

/**
 * Translates text to English using the Lovable AI-powered edge function.
 * Returns the original text if language is "en" or if translation fails.
 */
export async function translateToEnglish(
  text: string,
  sourceLang: string
): Promise<string> {
  if (!text.trim() || sourceLang === "en") {
    return text;
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      "translate-to-english",
      { body: { text, sourceLang } }
    );

    if (error) {
      console.warn("Translation failed — saving original text", error);
      return text;
    }

    return data?.translatedText || text;
  } catch (err) {
    console.warn("Translation failed — saving original text", err);
    return text;
  }
}
