import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, CheckCircle2, ArrowLeft, LogOut } from "lucide-react";
import { translations, isValidLanguage, type Language } from "@/i18n/citizenTranslations";
import { translateFields } from "@/lib/translateToEnglish";
import ThemeToggle from "@/components/ThemeToggle";

// Map English default question text → translation key for static lookup
const QUESTION_TEXT_MAP: Record<string, keyof typeof import("@/i18n/citizenTranslations").translations.en> = {
  "Thank you for using our service. Please take a moment to share your experience.": "surveyIntroDefault",
  "Thank you for using our civic services portal. We'd love to hear about your experience to help us serve you better.": "surveyIntroDefault",
  "How would you rate the overall quality of service you received?": "surveyQ1",
  "How would you rate your overall experience with our service today?": "surveyQ1",
  "Was your issue resolved in a timely manner?": "surveyQ2",
  "Was your request resolved in a timely manner?": "surveyQ2",
  "Was your issue resolved to your satisfaction?": "surveyQ2",
  "Was your request resolved in a reasonable timeframe?": "surveyQ2",
  "How would you rate the communication you received throughout the process?": "surveyQ3",
  "What could we have done better to improve your experience?": "surveyQ5",
  "What could we do to improve our service for future requests?": "surveyQ5",
  "Would you recommend this service to others?": "surveyQ4",
  "Would you recommend our services to friends or family?": "surveyQ4",
  "Would you recommend our civic services portal to others?": "surveyQ4",
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
        try { return JSON.parse(once); } catch { return once; }
      }
      return once;
    } catch { return value; }
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
      : Array.isArray(parsed) ? parsed : [];

  const questions: SurveyQuestion[] = rawQuestions
    .map((question, index) => {
      if (!question || typeof question !== "object") return null;
      const candidate = question as Record<string, unknown>;
      const id = typeof candidate.id === "string" ? candidate.id : typeof candidate.id === "number" ? String(candidate.id) : `q_${index + 1}`;
      const text = typeof candidate.text === "string" ? candidate.text : typeof candidate.question === "string" ? candidate.question : "";
      const type = candidate.type === "rating_1_5" || candidate.type === "yes_no" || candidate.type === "open_text" ? candidate.type : null;
      if (!text || !type) return null;
      return { id, text, type };
    })
    .filter((question): question is SurveyQuestion => Boolean(question));

  return {
    survey_intro: typeof asObject?.survey_intro === "string" ? asObject.survey_intro : typeof asObject?.intro === "string" ? asObject.intro : "",
    questions,
  };
};

function getStoredLanguage(): Language {
  const stored = localStorage.getItem("citizen-lang");
  return isValidLanguage(stored) ? stored : "en";
}

const RTL_LANGUAGES: Language[] = ["ar", "he"];

function translateQuestionnaire(q: Questionnaire, lang: Language): Questionnaire {
  const t = translations[lang] as any;
  const translateText = (text: string): string => {
    const key = QUESTION_TEXT_MAP[text];
    if (key && t[key]) return t[key];
    return text;
  };
  return {
    survey_intro: q.survey_intro ? translateText(q.survey_intro) : "",
    questions: q.questions.map((question) => ({ ...question, text: translateText(question.text) })),
  };
}

export default function SurveyPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
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

  const headerStyle = isDark
    ? { backgroundColor: "#0F172A", borderBottom: "1px solid rgba(255,255,255,0.1)" }
    : { backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" };

  const SurveyHeader = () => (
    <header className="px-6 py-3 flex items-center justify-between" style={headerStyle}>
      <Button
        variant="ghost"
        size="sm"
        className={isDark ? "text-[#94A3B8] hover:text-white hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"}
        onClick={() => navigate("/portal")}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> {t.surveyBackToPortal}
      </Button>
      <div className="flex items-center gap-2">
        <ThemeToggle className={isDark ? "text-white hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"} lightLabel={t.lightModeLabel} darkLabel={t.darkModeLabel} />
        <Button
          size="sm"
          className={isDark
            ? "border border-white/20 bg-transparent text-white hover:bg-white/10"
            : "border border-[#CBD5E1] bg-transparent text-[#0F172A] hover:bg-gray-50"
          }
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-1" /> {t.surveySignOut}
        </Button>
      </div>
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
    if (!requestId && !directSurveyId) { setLoading(false); return; }
    (async () => {
      try {
        let resolvedId = directSurveyId;
        if (!resolvedId && requestId) {
          const { data: surveyRow, error: lookupErr } = await supabase
            .from("surveys").select("id").eq("request_id", requestId).maybeSingle();
          if (lookupErr) throw lookupErr;
          if (!surveyRow) {
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
              .from("surveys").insert({ request_id: requestId, questionnaire: defaultQuestionnaire }).select("id").single();
            if (createErr) throw createErr;
            resolvedId = newSurvey.id;
          } else {
            resolvedId = surveyRow.id;
          }
          setSurveyId(resolvedId);
        }
        const { data, error: fetchErr } = await supabase
          .from("surveys").select("*").eq("id", resolvedId!).maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!data) throw new Error("Survey not found");
        if (data.submitted_at) {
          setSubmitted(true);
        } else {
          let parsed = parseQuestionnaire(data.questionnaire);
          if (language !== "en") parsed = translateQuestionnaire(parsed, language);
          setQuestionnaire(parsed);
        }
      } catch { setError(t.surveyLoadError); }
      finally { setLoading(false); }
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
        const { error: origErr } = await supabase.from("surveys").update({
          rating: Number.isFinite(ratingValue) ? ratingValue : 0,
          original_responses: originalResponses,
        }).eq("id", surveyId);
        if (origErr) throw origErr;
        const openTextQuestions = questionnaire.questions.filter((q) => q.type === "open_text");
        for (const q of openTextQuestions) {
          const originalText = finalResponses[q.id];
          if (typeof originalText === "string" && originalText.trim().length > 0) {
            const { translatedDescription } = await translateFields("", originalText, language);
            finalResponses[q.id] = translatedDescription;
          }
        }
        const { error: updateErr } = await supabase.from("surveys").update({
          responses: finalResponses,
          submitted_at: new Date().toISOString(),
        }).eq("id", surveyId);
        if (updateErr) throw updateErr;
      } else {
        const { error: updateErr } = await supabase.from("surveys").update({
          rating: Number.isFinite(ratingValue) ? ratingValue : 0,
          responses: finalResponses,
          original_responses: null,
          submitted_at: new Date().toISOString(),
        }).eq("id", surveyId);
        if (updateErr) throw updateErr;
      }
      setSubmitted(true);
    } catch { setError(t.surveySubmitFailed); }
    finally { setSubmitting(false); }
  };

  const pageStyle = isDark
    ? { backgroundColor: "#0F172A", backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }
    : { backgroundColor: "#FFFFFF" };

  const cardStyle = isDark
    ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, backdropFilter: "blur(12px)" }
    : { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 };

  const titleColor = isDark ? "#FFFFFF" : "#0F172A";
  const subtitleColor = isDark ? "#94A3B8" : "#475569";

  // Wrapper for state screens (loading, no survey, submitted, error, no link)
  const StateWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen relative" style={pageStyle} dir={isRtl ? "rtl" : undefined}>
      <SurveyHeader />
      {children}
    </div>
  );

  if (loading) {
    return (
      <StateWrapper>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#94A3B8" }} />
        </div>
      </StateWrapper>
    );
  }

  if (noSurvey) {
    return (
      <StateWrapper>
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={cardStyle}>
            <CardContent className="pt-10 pb-10 space-y-2">
              <h2 className="text-lg font-semibold" style={{ color: titleColor }}>{t.surveyNoSurvey}</h2>
              <p className="text-sm" style={{ color: subtitleColor }}>{t.surveyNoSurveyMessage}</p>
            </CardContent>
          </Card>
        </div>
      </StateWrapper>
    );
  }

  if (submitted) {
    return (
      <StateWrapper>
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={cardStyle}>
            <CardContent className="pt-10 pb-10 space-y-4">
              <CheckCircle2 className="h-14 w-14 text-[#38BDF8] mx-auto" />
              <h2 className="text-xl font-semibold" style={{ color: titleColor }}>{t.surveyCompleted}</h2>
              <p className="text-sm" style={{ color: subtitleColor }}>{t.surveyCompletedMessage}</p>
            </CardContent>
          </Card>
        </div>
      </StateWrapper>
    );
  }

  if (!surveyId && !requestId) {
    return (
      <StateWrapper>
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={cardStyle}>
            <CardContent className="pt-10 pb-10">
              <p style={{ color: subtitleColor }}>{t.surveyNoLink}</p>
            </CardContent>
          </Card>
        </div>
      </StateWrapper>
    );
  }

  if (error) {
    return (
      <StateWrapper>
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="max-w-md w-full text-center bg-transparent shadow-none" style={cardStyle}>
            <CardContent className="pt-10 pb-10">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </StateWrapper>
    );
  }

  if (!questionnaire) {
    return (
      <StateWrapper>
        <div className="flex items-center justify-center px-4 py-32">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#94A3B8" }} />
        </div>
      </StateWrapper>
    );
  }

  return (
    <div className="min-h-screen relative" style={pageStyle} dir={isRtl ? "rtl" : undefined}>
      <SurveyHeader />
      <div className="py-10 px-4">
        <Card className="max-w-lg mx-auto bg-transparent shadow-none" style={cardStyle}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: titleColor }}>{t.surveyTitle}</CardTitle>
            {questionnaire.survey_intro && (
              <p className="text-sm" style={{ color: subtitleColor }}>{questionnaire.survey_intro}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {questionnaire.questions.length === 0 ? (
              <p className="text-sm" style={{ color: subtitleColor }}>{t.surveyNoQuestions}</p>
            ) : (
              questionnaire.questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: titleColor }}>{q.text}</label>

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
                                : isDark ? "text-[#334155]" : "text-[#CBD5E1]"
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
                            : isDark
                              ? "bg-[#1E293B] text-white border border-white/15 hover:bg-[#263548]"
                              : "bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-gray-50"
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
                            : isDark
                              ? "bg-[#1E293B] text-white border border-white/15 hover:bg-[#263548]"
                              : "bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-gray-50"
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
                      className="min-h-[80px] text-sm focus-visible:ring-[#2563EB]"
                      style={isDark
                        ? { backgroundColor: "#1E293B", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.15)" }
                        : { backgroundColor: "#FFFFFF", color: "#0F172A", borderColor: "#CBD5E1" }
                      }
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
