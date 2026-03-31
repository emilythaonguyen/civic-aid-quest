import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, CheckCircle2, ArrowLeft, LogOut } from "lucide-react";
import { translations, isValidLanguage, type Language } from "@/i18n/citizenTranslations";
import { translateFields } from "@/lib/translateToEnglish";

// Map English default question text → translation key for static lookup
const QUESTION_TEXT_MAP: Record<string, keyof typeof import("@/i18n/citizenTranslations").translations.en> = {
  "Thank you for using our service. Please take a moment to share your experience.": "surveyIntroDefault",
  "How would you rate the overall quality of service you received?": "surveyQ1",
  "Was your issue resolved in a timely manner?": "surveyQ2",
  "How would you rate the communication you received throughout the process?": "surveyQ3",
  "Would you recommend this service to others?": "surveyQ4",
  "Please share any additional feedback or suggestions for improvement.": "surveyQ5",
};

interface SurveyQuestion {
  id: string;
  text: string;
  type: "rating_1_5" | "yes_no" | "open_text";
}

interface Questionnaire {
  survey_intro: string;
  questions: SurveyQuestion[];
}

const parseQuestionnaire = (raw: unknown): Questionnaire => {
  const parsePossibleJson = (value: unknown): unknown => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    const unfenced = trimmed.startsWith("```")
      ? trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
      : trimmed;

    try {
      const once = JSON.parse(unfenced);
      if (typeof once === "string") {
        try {
          return JSON.parse(once);
        } catch {
          return once;
        }
      }
      return once;
    } catch {
      return value;
    }
  };

  let parsed: unknown = parsePossibleJson(raw);

  if (parsed && typeof parsed === "object" && "questionnaire" in (parsed as Record<string, unknown>)) {
    parsed = parsePossibleJson((parsed as Record<string, unknown>).questionnaire);
  }

  const asObject = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;

  const rawQuestions = Array.isArray(asObject?.questions)
    ? asObject.questions
    : Array.isArray(asObject?.question_list)
      ? asObject.question_list
      : Array.isArray(parsed)
        ? parsed
        : [];

  const questions: SurveyQuestion[] = rawQuestions
    .map((question, index) => {
      if (!question || typeof question !== "object") return null;
      const candidate = question as Record<string, unknown>;

      const id =
        typeof candidate.id === "string"
          ? candidate.id
          : typeof candidate.id === "number"
            ? String(candidate.id)
            : `q_${index + 1}`;

      const text =
        typeof candidate.text === "string"
          ? candidate.text
          : typeof candidate.question === "string"
            ? candidate.question
            : "";

      const type =
        candidate.type === "rating_1_5" ||
        candidate.type === "yes_no" ||
        candidate.type === "open_text"
          ? candidate.type
          : null;

      if (!text || !type) return null;

      return { id, text, type };
    })
    .filter((question): question is SurveyQuestion => Boolean(question));

  return {
    survey_intro:
      typeof asObject?.survey_intro === "string"
        ? asObject.survey_intro
        : typeof asObject?.intro === "string"
          ? asObject.intro
          : "",
    questions,
  };
};

function getStoredLanguage(): Language {
  const stored = localStorage.getItem("citizen-lang");
  return isValidLanguage(stored) ? stored : "en";
}

const RTL_LANGUAGES: Language[] = ["ar"];

function translateQuestionnaire(q: Questionnaire, lang: Language): Questionnaire {
  const t = translations[lang] as any;

  const translateText = (text: string): string => {
    const key = QUESTION_TEXT_MAP[text];
    if (key && t[key]) return t[key];
    return text;
  };

  return {
    survey_intro: q.survey_intro ? translateText(q.survey_intro) : "",
    questions: q.questions.map((question) => ({
      ...question,
      text: translateText(question.text),
    })),
  };
}

export default function SurveyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("request_id");
  const directSurveyId = searchParams.get("id");

  const [language] = useState<Language>(getStoredLanguage);
  const t = translations[language];
  const isRtl = RTL_LANGUAGES.includes(language);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const SurveyHeader = () => (
    <header className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: "#0F172A", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <Button variant="ghost" size="sm" className="text-[#94A3B8] hover:text-white hover:bg-white/10" onClick={() => navigate("/portal")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> {t.surveyBackToPortal}
      </Button>
      <Button size="sm" className="border border-white/20 bg-transparent text-white hover:bg-white/10" onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-1" /> {t.surveySignOut}
      </Button>
    </header>
  );

  const [surveyId, setSurveyId] = useState<string | null>(directSurveyId);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(!!(requestId || directSurveyId));
  const [error, setError] = useState("");
  const [noSurvey, setNoSurvey] = useState(false);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!requestId && !directSurveyId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        let resolvedId = directSurveyId;

         if (!resolvedId && requestId) {
          const { data: surveyRow, error: lookupErr } = await supabase
            .from("surveys")
            .select("id")
            .eq("request_id", requestId)
            .maybeSingle();

          if (lookupErr) throw lookupErr;

          if (!surveyRow) {
            // Auto-create a default survey for this resolved request
            const defaultQuestionnaire = {
              survey_intro: "Thank you for using our service. Please take a moment to share your experience.",
              questions: [
                { id: "q_1", text: "How would you rate the overall quality of service you received?", type: "rating_1_5" },
                { id: "q_2", text: "Was your issue resolved in a timely manner?", type: "yes_no" },
                { id: "q_3", text: "How would you rate the communication you received throughout the process?", type: "rating_1_5" },
                { id: "q_4", text: "Would you recommend this service to others?", type: "yes_no" },
                { id: "q_5", text: "Please share any additional feedback or suggestions for improvement.", type: "open_text" },
              ],
            };

            const { data: newSurvey, error: createErr } = await supabase
              .from("surveys")
              .insert({ request_id: requestId, questionnaire: defaultQuestionnaire })
              .select("id")
              .single();

            if (createErr) throw createErr;
            resolvedId = newSurvey.id;
          } else {
            resolvedId = surveyRow.id;
          }
          setSurveyId(resolvedId);
        }

        const { data, error: fetchErr } = await supabase
          .from("surveys")
          .select("*")
          .eq("id", resolvedId!)
          .maybeSingle();

        if (fetchErr) throw fetchErr;
        if (!data) throw new Error("Survey not found");

        if (data.submitted_at) {
          setSubmitted(true);
        } else {
          let parsed = parseQuestionnaire(data.questionnaire);

          // Translate questionnaire content if language is not English
          if (language !== "en") {
            parsed = translateQuestionnaire(parsed, language);
          }

          setQuestionnaire(parsed);
        }
      } catch {
        setError(t.surveyLoadError);
      } finally {
        setLoading(false);
      }
    })();
  }, [requestId, directSurveyId]);

  const setResponse = (id: string, value: string | number) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const allAnswered =
    (questionnaire?.questions.length ?? 0) > 0 &&
    (questionnaire?.questions.every((q) => {
      const val = responses[q.id];
      if (q.type === "rating_1_5") return typeof val === "number" && val > 0;
      if (q.type === "yes_no") return val === "yes" || val === "no";
      return typeof val === "string" && val.trim().length > 0;
    }) ?? false);

  const handleSubmit = async () => {
    if (!questionnaire || questionnaire.questions.length === 0) return;
    setSubmitting(true);

    const ratingQuestion = questionnaire.questions.find((q) => q.type === "rating_1_5");
    const ratingValue = ratingQuestion ? Number(responses[ratingQuestion.id] ?? 0) : 0;

    try {
      const originalResponses = { ...responses };
      let finalResponses = { ...responses };

      if (language !== "en") {
        // Step 1: Save original responses first (no responses column yet — won't trigger n8n)
        const { error: origErr } = await supabase
          .from("surveys")
          .update({
            rating: Number.isFinite(ratingValue) ? ratingValue : 0,
            original_responses: originalResponses,
          })
          .eq("id", surveyId);
        if (origErr) throw origErr;

        // Step 2: Translate open-text fields to English — await fully
        const openTextQuestions = questionnaire.questions.filter((q) => q.type === "open_text");
        for (const q of openTextQuestions) {
          const originalText = finalResponses[q.id];
          if (typeof originalText === "string" && originalText.trim().length > 0) {
            const { translatedDescription } = await translateFields("", originalText, language);
            finalResponses[q.id] = translatedDescription;
          }
        }

        // Step 3: Write English text to responses + submitted_at (triggers n8n)
        const { error: updateErr } = await supabase
          .from("surveys")
          .update({
            responses: finalResponses,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", surveyId);
        if (updateErr) throw updateErr;
      } else {
        // English: single update is fine
        const { error: updateErr } = await supabase
          .from("surveys")
          .update({
            rating: Number.isFinite(ratingValue) ? ratingValue : 0,
            responses: finalResponses,
            original_responses: null,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", surveyId);
        if (updateErr) throw updateErr;
      }
      setSubmitted(true);
    } catch {
      setError(t.surveySubmitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const darkPageClass = "min-h-screen relative" as const;
  const darkPageStyle = { backgroundColor: "#0F172A", backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" } as const;
  const darkCardStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, backdropFilter: "blur(12px)" } as const;

  if (loading) {
    return (
      <div className={darkPageClass} style={darkPageStyle} dir={isRtl ? "rtl" : undefined}>
        <SurveyHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#94A3B8]" />
        </div>
      </div>
    );
  }
  if (noSurvey) {
    return (
      <div className={darkPageClass} style={darkPageStyle} dir={isRtl ? "rtl" : undefined}>
        <SurveyHeader />
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={darkCardStyle}>
            <CardContent className="pt-10 pb-10 space-y-2">
              <h2 className="text-lg font-semibold text-white">{t.surveyNoSurvey}</h2>
              <p className="text-sm text-[#94A3B8]">{t.surveyNoSurveyMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={darkPageClass} style={darkPageStyle} dir={isRtl ? "rtl" : undefined}>
        <SurveyHeader />
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={darkCardStyle}>
            <CardContent className="pt-10 pb-10 space-y-4">
              <CheckCircle2 className="h-14 w-14 text-[#38BDF8] mx-auto" />
              <h2 className="text-xl font-semibold text-white">{t.surveyCompleted}</h2>
              <p className="text-[#94A3B8] text-sm">{t.surveyCompletedMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!surveyId && !requestId) {
    return (
      <div className={darkPageClass} style={darkPageStyle} dir={isRtl ? "rtl" : undefined}>
        <SurveyHeader />
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={darkCardStyle}>
            <CardContent className="pt-10 pb-10">
              <p className="text-[#94A3B8]">{t.surveyNoLink}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={darkPageClass} style={darkPageStyle} dir={isRtl ? "rtl" : undefined}>
        <SurveyHeader />
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={darkCardStyle}>
            <CardContent className="pt-10 pb-10">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className={darkPageClass} style={darkPageStyle} dir={isRtl ? "rtl" : undefined}>
        <SurveyHeader />
        <div className="flex items-center justify-center px-4 py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#94A3B8]" />
        </div>
      </div>
    );
  }

  return (
    <div className={darkPageClass} style={darkPageStyle} dir={isRtl ? "rtl" : undefined}>
      <SurveyHeader />
      <div className="py-10 px-4">
      <Card className="max-w-lg mx-auto bg-transparent shadow-none" style={darkCardStyle}>
        <CardHeader>
          <CardTitle className="text-lg text-white">{t.surveyTitle}</CardTitle>
          {questionnaire.survey_intro && (
            <p className="text-sm text-[#94A3B8]">{questionnaire.survey_intro}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {questionnaire.questions.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">{t.surveyNoQuestions}</p>
          ) : (
            questionnaire.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <label className="text-sm font-medium text-white">{q.text}</label>

                {q.type === "rating_1_5" && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setResponse(q.id, n)}
                        onMouseEnter={() => setHoverRatings((prev) => ({ ...prev, [q.id]: n }))}
                        onMouseLeave={() => setHoverRatings((prev) => ({ ...prev, [q.id]: 0 }))}
                        className="p-1 transition-colors"
                        aria-label={`Rate ${n} out of 5`}
                      >
                        <Star
                          className={`h-8 w-8 ${
                            n <= ((hoverRatings[q.id] || 0) || ((responses[q.id] as number) || 0))
                              ? "fill-amber-400 text-amber-400"
                              : "text-[#334155]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "yes_no" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResponse(q.id, "yes")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        responses[q.id] === "yes"
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#1E293B] text-white border border-white/15 hover:bg-[#263548]"
                      }`}
                    >
                      {t.surveyYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponse(q.id, "no")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        responses[q.id] === "no"
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#1E293B] text-white border border-white/15 hover:bg-[#263548]"
                      }`}
                    >
                      {t.surveyNo}
                    </button>
                  </div>
                )}

                {q.type === "open_text" && (
                  <Textarea
                    value={(responses[q.id] as string) ?? ""}
                    onChange={(e) => setResponse(q.id, e.target.value)}
                    placeholder={t.surveyPlaceholder}
                    className="min-h-[80px] text-sm bg-[#1E293B] text-white border-white/15 placeholder:text-[#475569] focus-visible:ring-[#2563EB]"
                  />
                )}
              </div>
            ))
          )}

          <Button
            className="w-full bg-[#2563EB] text-white hover:bg-[#3B82F6]"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.surveySubmit}
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
