import { supabase } from "@/integrations/supabase/client";

/**
 * Translates location and description fields to English in a single call
 * using the translate-to-english Edge Function (Claude API).
 * Returns originals if language is "en" or if translation fails.
 */
export async function translateFields(
  location: string,
  description: string,
  sourceLang: string
): Promise<{ translatedLocation: string; translatedDescription: string }> {
  if (sourceLang === "en") {
    return { translatedLocation: location, translatedDescription: description };
  }

  try {
    console.log(`Translating from ${sourceLang} to English...`);
    const { data, error } = await supabase.functions.invoke(
      "translate-to-english",
      { body: { location, description, sourceLang } }
    );

    if (error) {
      console.warn("Translation failed — saving original text", error);
      return { translatedLocation: location, translatedDescription: description };
    }

    const translatedLocation = data?.translatedLocation || location;
    const translatedDescription = data?.translatedDescription || description;
    console.log(`Translation result: location "${location}" → "${translatedLocation}", description "${description}" → "${translatedDescription}"`);
    return { translatedLocation, translatedDescription };
  } catch (err) {
    console.warn("Translation failed — saving original text", err);
    return { translatedLocation: location, translatedDescription: description };
  }
}
