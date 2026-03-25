import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, CheckCircle2 } from "lucide-react";

interface SurveyQuestion {
  id: string;
  text: string;
  type?: string;
}

export default function SurveyPage() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("id");

  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!surveyId) {
      setError("No survey ID provided.");
      setLoading(false);
      return;
    }

    const fetchSurvey = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("surveys")
          .select("questions, submitted_at")
          .eq("id", surveyId)
          .single();

        if (fetchErr) throw fetchErr;
        if (!data) throw new Error("Survey not found");

        if (data.submitted_at) {
          setSubmitted(true);
        } else {
          const q = (data.questions as SurveyQuestion[]) ?? [];
          setQuestions(q);
        }
      } catch {
        setError("Unable to load survey. The link may be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);

    try {
      const { error: updateErr } = await supabase
        .from("surveys")
        .update({
          rating,
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10 space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Thank you!</h2>
            <p className="text-muted-foreground text-sm">
              Your feedback has been recorded. We appreciate you taking the time to respond.
            </p>
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

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Service Satisfaction Survey</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please rate your experience and share any additional feedback.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Overall satisfaction
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-colors"
                  aria-label={`Rate ${n} out of 5`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      n <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">Select a rating to continue</p>
            )}
          </div>

          {/* Dynamic questions */}
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="text-sm font-medium text-foreground">{q.text}</label>
              <Textarea
                value={responses[q.id] ?? ""}
                onChange={(e) =>
                  setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder="Your response…"
                className="min-h-[80px] text-sm"
              />
            </div>
          ))}

          {/* Fallback open-ended if no questions */}
          {questions.length === 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Additional comments
              </label>
              <Textarea
                value={responses["general"] ?? ""}
                onChange={(e) =>
                  setResponses((prev) => ({ ...prev, general: e.target.value }))
                }
                placeholder="Share any additional feedback…"
                className="min-h-[100px] text-sm"
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit Survey"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
