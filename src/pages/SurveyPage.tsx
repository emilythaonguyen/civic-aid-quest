import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, CheckCircle2 } from "lucide-react";

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

export default function SurveyPage() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("request_id");
  const directSurveyId = searchParams.get("id");

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
            setNoSurvey(true);
            setLoading(false);
            return;
          }
          resolvedId = surveyRow.id;
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
          setQuestionnaire(parseQuestionnaire(data.questionnaire));
        }
      } catch {
        setError("Unable to load survey. The link may be invalid, expired, or inaccessible.");
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
      const { error: updateErr } = await supabase
        .from("surveys")
        .update({
          rating: Number.isFinite(ratingValue) ? ratingValue : 0,
          responses,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", surveyId);

      if (updateErr) throw updateErr;
      setSubmitted(true);
    } catch {
      setError("Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (noSurvey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10 space-y-2">
            <h2 className="text-lg font-semibold text-foreground">No Survey Available</h2>
            <p className="text-sm text-muted-foreground">
              A satisfaction survey has not been generated for this request yet. Surveys are typically created once a request is resolved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10 space-y-4">
            <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Thank you!</h2>
            <p className="text-muted-foreground text-sm">
              Your feedback has been recorded. We appreciate you taking the time to respond.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!surveyId && !requestId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10">
            <p className="text-muted-foreground">No survey linked. Please access this page from your request portal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Service Satisfaction Survey</CardTitle>
          {questionnaire.survey_intro && (
            <p className="text-sm text-muted-foreground">{questionnaire.survey_intro}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {questionnaire.questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No questions are configured in this survey yet. Please contact support.
            </p>
          ) : (
            questionnaire.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <label className="text-sm font-medium text-foreground">{q.text}</label>

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
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "yes_no" && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={responses[q.id] === "yes" ? "default" : "outline"}
                      onClick={() => setResponse(q.id, "yes")}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={responses[q.id] === "no" ? "default" : "outline"}
                      onClick={() => setResponse(q.id, "no")}
                    >
                      No
                    </Button>
                  </div>
                )}

                {q.type === "open_text" && (
                  <Textarea
                    value={(responses[q.id] as string) ?? ""}
                    onChange={(e) => setResponse(q.id, e.target.value)}
                    placeholder="Your response…"
                    className="min-h-[80px] text-sm"
                  />
                )}
              </div>
            ))
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={!allAnswered || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Survey"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
