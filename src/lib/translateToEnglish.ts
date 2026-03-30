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
    console.log(`Translating from ${sourceLang} to English...`);
    const { data, error } = await supabase.functions.invoke(
      "translate",
      { body: { text, sourceLang } }
    );

    if (error) {
      console.warn("Translation failed — saving original text", error);
      return text;
    }

    const translated = data?.translatedText || text;
    console.log(`Translation result: "${text}" → "${translated}"`);
    return translated;
  } catch (err) {
    console.warn("Translation failed — saving original text", err);
    return text;
  }
}
