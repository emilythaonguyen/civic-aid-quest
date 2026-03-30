import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Star, ClipboardList, User, MapPin, Tag, Calendar, ChevronDown, Brain } from "lucide-react";
import StaffHeader from "@/components/StaffHeader";
import { format } from "date-fns";

interface SurveyQuestion {
  id: string;
  text: string;
  type: "rating_1_5" | "yes_no" | "open_text";
}

interface SurveyResult {
  id: string;
  submitted_at: string;
  rating: number | null;
  responses: Record<string, string | number> | null;
  questionnaire: unknown;
  sentiment_score: number | null;
  sentiment_label: string | null;
  confidence: string | null;
  request: {
    id: string;
    type: string;
    status: string;
    location: string;
    created_at: string;
    citizen_name: string | null;
  } | null;
}

const parseQuestions = (raw: unknown): SurveyQuestion[] => {
  try {
    let parsed: unknown = raw;
    if (typeof parsed === "string") {
      const unfenced = parsed.trim().startsWith("```")
        ? parsed.trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
        : parsed.trim();
      parsed = JSON.parse(unfenced);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
    }

    if (parsed && typeof parsed === "object" && "questionnaire" in (parsed as Record<string, unknown>)) {
      const inner = (parsed as Record<string, unknown>).questionnaire;
      if (typeof inner === "string") {
        try { parsed = JSON.parse(inner); } catch { /* empty */ }
      } else {
        parsed = inner;
      }
    }

    const obj = parsed as Record<string, unknown>;
    const rawQs = Array.isArray(obj?.questions)
      ? obj.questions
      : Array.isArray(obj?.question_list)
        ? obj.question_list
        : [];

    return rawQs
      .map((q, i) => {
        if (!q || typeof q !== "object") return null;
        const c = q as Record<string, unknown>;
        const id = typeof c.id === "string" ? c.id : String(c.id ?? `q_${i + 1}`);
        const text = typeof c.text === "string" ? c.text : typeof c.question === "string" ? c.question : "";
        const type = c.type === "rating_1_5" || c.type === "yes_no" || c.type === "open_text" ? c.type : null;
        if (!text || !type) return null;
        return { id, text, type } as SurveyQuestion;
      })
      .filter((q): q is SurveyQuestion => Boolean(q));
  } catch {
    return [];
  }
};

const statusColors: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800",
  "In Review": "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-orange-100 text-orange-800",
  Resolved: "bg-green-100 text-green-800",
  Escalated: "bg-red-100 text-red-800",
};

export default function SurveyResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
      .then(({ data }) => { if (data?.full_name) setStaffName(data.full_name); });
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const { data: surveys, error: err } = await supabase
          .from("surveys")
          .select("id, submitted_at, rating, responses, questionnaire, request_id, sentiment_score, sentiment_label, confidence")
          .not("submitted_at", "is", null)
          .order("submitted_at", { ascending: false });

        if (err) throw err;
        if (!surveys || surveys.length === 0) {
          setResults([]);
          return;
        }

        // Fetch associated requests
        const requestIds = surveys.map((s) => s.request_id).filter(Boolean) as string[];
        let requestMap: Record<string, { id: string; type: string; status: string; location: string; created_at: string; user_id: string | null; citizen_name: string | null }> = {};

        if (requestIds.length > 0) {
          const { data: requests } = await supabase
            .from("requests")
            .select("id, type, status, location, created_at, user_id")
            .in("id", requestIds);

          if (requests) {
            // Fetch citizen names
            const userIds = requests.map((r) => r.user_id).filter(Boolean) as string[];
            let profileMap: Record<string, string> = {};
            if (userIds.length > 0) {
              const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", userIds);
              if (profiles) {
                profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name ?? "Unknown"]));
              }
            }
          requestMap = Object.fromEntries(
              requests.map((r) => [
                r.id,
                {
                  id: r.id,
                  type: r.type,
                  status: r.status,
                  location: r.location,
                  created_at: r.created_at,
                  user_id: r.user_id,
                  citizen_name: r.user_id ? (profileMap[r.user_id] ?? null) : null,
                },
              ])
            );
          }
        }

        const mapped: SurveyResult[] = surveys.map((s) => ({
          id: s.id,
          submitted_at: s.submitted_at!,
          rating: s.rating ?? null,
          responses: s.responses as Record<string, string | number> | null,
          questionnaire: s.questionnaire,
          sentiment_score: (s as any).sentiment_score ?? null,
          sentiment_label: (s as any).sentiment_label ?? null,
          confidence: (s as any).confidence ?? null,
          request: s.request_id && requestMap[s.request_id]
            ? {
                id: requestMap[s.request_id].id,
                type: requestMap[s.request_id].type,
                status: requestMap[s.request_id].status,
                location: requestMap[s.request_id].location,
                created_at: requestMap[s.request_id].created_at,
                citizen_name: requestMap[s.request_id].citizen_name ?? null,
              }
            : null,
        }));

        setResults(mapped);
      } catch {
        setError("Failed to load survey results.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <StaffHeader staffName={staffName} activePage="Survey Results" />

      <div className="px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Survey Results
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submitted feedback from resolved service requests
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {results.length} {results.length === 1 ? "response" : "responses"}
          </Badge>
        </div>

        {error && (
          <Card>
            <CardContent className="py-8 text-center text-destructive">{error}</CardContent>
          </Card>
        )}

        {!error && results.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No completed surveys yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Aggregate Stats */}
        {!error && results.length > 0 && (() => {
          const allQuestions = results.map(r => parseQuestions(r.questionnaire));
          const allResponses = results.map(r => r.responses ?? {});

          // Q1: avg rating (first rating_1_5 question)
          let ratingSum = 0, ratingCount = 0;
          // Q2: % yes for first yes_no question
          let q2Yes = 0, q2Total = 0;
          // Q3: count of open_text responses
          let q3Count = 0;
          // Q4: % yes for second yes_no question
          let q4Yes = 0, q4Total = 0;
          let yesNoIndex = 0;

          results.forEach((_, i) => {
            const qs = allQuestions[i];
            const resp = allResponses[i];
            let localYesNo = 0;
            qs.forEach(q => {
              const answer = resp[q.id];
              if (q.type === "rating_1_5" && typeof answer === "number") {
                ratingSum += answer;
                ratingCount++;
              } else if (q.type === "yes_no") {
                if (localYesNo === 0) {
                  q2Total++;
                  if (answer === "yes") q2Yes++;
                } else {
                  q4Total++;
                  if (answer === "yes") q4Yes++;
                }
                localYesNo++;
              } else if (q.type === "open_text" && answer != null && String(answer).trim() !== "") {
                q3Count++;
              }
            });
          });

          const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : "N/A";
          const q2Pct = q2Total > 0 ? Math.round((q2Yes / q2Total) * 100) : 0;
          const q4Pct = q4Total > 0 ? Math.round((q4Yes / q4Total) * 100) : 0;

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 whitespace-nowrap">Overall Experience</p>
                  <p className="text-2xl font-bold text-foreground">{avgRating} / 5 ⭐</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 whitespace-nowrap">Resolved to Satisfaction</p>
                  <p className="text-2xl font-bold text-foreground">{q2Pct}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 whitespace-nowrap">Improvement Suggestions</p>
                  <p className="text-2xl font-bold text-foreground">{q3Count}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 whitespace-nowrap">Would Recommend</p>
                  <p className="text-2xl font-bold text-foreground">{q4Pct}%</p>
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Sentiment Analysis Stats */}
        {!error && results.length > 0 && (() => {
          const withSentiment = results.filter(r => r.sentiment_score != null && r.sentiment_label != null);
          if (withSentiment.length === 0) {
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">Sentiment analysis data is not yet available. Results will appear here once the AI workflow processes survey responses.</p>
                </CardContent>
              </Card>
            );
          }

          const avgScore = Math.round(withSentiment.reduce((sum, r) => sum + (r.sentiment_score ?? 0), 0) / withSentiment.length);
          const positive = withSentiment.filter(r => r.sentiment_label?.toLowerCase() === "positive").length;
          const neutral = withSentiment.filter(r => r.sentiment_label?.toLowerCase() === "neutral").length;
          const negative = withSentiment.filter(r => r.sentiment_label?.toLowerCase() === "negative").length;
          const positivePct = Math.round((positive / withSentiment.length) * 100);
          const neutralPct = Math.round((neutral / withSentiment.length) * 100);
          const negativePct = Math.round((negative / withSentiment.length) * 100);

          return (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Sentiment Analysis
                </CardTitle>
                
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Avg Score</p>
                    <p className="text-2xl font-bold text-foreground">{avgScore}</p>
                    <p className="text-xs text-muted-foreground">out of 10</p>
                  </div>
                  <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Positive</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{positivePct}%</p>
                    <p className="text-xs text-muted-foreground">{positive} {positive === 1 ? "response" : "responses"}</p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-4 text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Neutral</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{neutralPct}%</p>
                    <p className="text-xs text-muted-foreground">{neutral} {neutral === 1 ? "response" : "responses"}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Negative</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{negativePct}%</p>
                    <p className="text-xs text-muted-foreground">{negative} {negative === 1 ? "response" : "responses"}</p>
                  </div>
                </div>
                {/* Distribution bar */}
              </CardContent>
            </Card>
          );
        })()}

        {results.map((result) => {
          const questions = parseQuestions(result.questionnaire);
          const responses = result.responses ?? {};

          return (
            <Collapsible key={result.id} asChild>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 border-b border-border cursor-pointer group">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground capitalize">
                          {result.request?.type ?? "Service Request"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(result.submitted_at), "MMM d, yyyy")}
                        </div>
                        {result.rating != null && result.rating > 0 && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`h-3.5 w-3.5 ${
                                  n <= result.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-4 space-y-5">
                    {/* Ticket info */}
                    {result.request && (
                      <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Service Request
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
                          <div className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="capitalize text-foreground">{result.request.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                statusColors[result.request.status] ?? "bg-muted text-muted-foreground"
                              }`}
                            >
                              {result.request.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground truncate">{result.request.location}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            Submitted {format(new Date(result.request.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="pt-1">
                          <Link
                            to={`/staff/ticket/${result.request.id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View ticket →
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Q&A */}
                    {questions.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Survey Responses
                        </p>
                        {questions.map((q, idx) => {
                          const answer = responses[q.id];
                          return (
                            <div key={q.id} className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {idx + 1}. {q.text}
                              </p>
                              <div className="pl-4">
                                {q.type === "rating_1_5" && typeof answer === "number" && (
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <Star
                                        key={n}
                                        className={`h-5 w-5 ${
                                          n <= answer ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-sm text-muted-foreground ml-1">{answer}/5</span>
                                  </div>
                                )}
                                {q.type === "yes_no" && (
                                  <Badge variant={answer === "yes" ? "default" : "secondary"} className="capitalize">
                                    {String(answer)}
                                  </Badge>
                                )}
                                {q.type === "open_text" && (
                                  <p className="text-sm text-foreground bg-muted/40 rounded px-3 py-2 italic">
                                    "{String(answer)}"
                                  </p>
                                )}
                                {answer == null && (
                                  <span className="text-sm text-muted-foreground italic">No response</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No question details available.</p>
                    )}

                    {/* Individual Sentiment Analysis */}
                    {result.sentiment_label != null && result.sentiment_score != null && (
                      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Brain className="h-3.5 w-3.5 text-primary" />
                          Sentiment Analysis
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Label</p>
                            <Badge
                              variant="secondary"
                              className={
                                result.sentiment_label.toLowerCase() === "positive"
                                  ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                                  : result.sentiment_label.toLowerCase() === "negative"
                                    ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
                              }
                            >
                              {result.sentiment_label}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Score</p>
                            <p className="text-lg font-bold text-foreground">{result.sentiment_score}<span className="text-xs font-normal text-muted-foreground"> / 10</span></p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                            <p className="text-lg font-bold text-foreground capitalize">{result.confidence ?? "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
      </div>
    </div>
  );
}
