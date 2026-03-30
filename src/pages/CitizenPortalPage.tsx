import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ExternalLink } from "lucide-react";
import RequestStatusHistory from "@/components/RequestStatusHistory";
import RequestPizzaTracker from "@/components/RequestPizzaTracker";
import SubmitRequestForm from "@/components/SubmitRequestForm";
import RoleSwitcher from "@/components/RoleSwitcher";
import LanguageSelector from "@/components/LanguageSelector";
import { translations, isValidLanguage, type Language } from "@/i18n/citizenTranslations";
import { format } from "date-fns";

interface ServiceRequest {
  id: string;
  type: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
  attachment_url: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-muted text-muted-foreground",
  "In Review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

function statusClass(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES["Open"];
}

function getStoredLanguage(): Language {
  const stored = localStorage.getItem("citizen-lang");
  return isValidLanguage(stored) ? stored : "en";
}

export default function CitizenPortalPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const t = translations[language];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("citizen-lang", lang);
  };

  const formatType = (type: string) => {
    const key = type as keyof typeof t;
    if (key in t) return t[key];
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
  };

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [completedSurveys, setCompletedSurveys] = useState<Set<string>>(new Set());
  const [surveyIdMap, setSurveyIdMap] = useState<Record<string, string>>({});

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(false);
    const { data, error } = await supabase
      .from("requests")
      .select("id, type, location, description, status, created_at, attachment_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch requests:", error);
      setFetchError(true);
    } else {
      setRequests(data ?? []);
      if (data && data.length > 0) {
        const ids = data.map((r) => r.id);
        const { data: surveys } = await supabase
          .from("surveys")
          .select("id, request_id, submitted_at")
          .in("request_id", ids);

        const idMap: Record<string, string> = {};
        const completed = new Set<string>();
        for (const s of surveys ?? []) {
          if (!idMap[s.request_id]) idMap[s.request_id] = s.id;
          if (s.submitted_at) completed.add(s.request_id);
        }
        setSurveyIdMap(idMap);
        setCompletedSurveys(completed);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-requests")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requests", filter: `user_id=eq.${user.id}` },
        () => fetchRequests()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchRequests]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/citizen-login");
  };

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">{t.citizenConnect}</h1>
          <Button className="bg-white text-black border border-input hover:bg-gray-100" size="sm" onClick={() => navigate("/status")}>
            {t.publicStatus}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector language={language} onChange={handleLanguageChange} />
          <span className="text-sm text-muted-foreground">{user?.user_metadata?.full_name || user?.email}</span>
          <RoleSwitcher />
          <Button variant="outline" size="sm" onClick={handleSignOut}>{t.signOut}</Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <section className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{t.pageTitle}</h2>
          <p className="text-muted-foreground">{t.pageSubtitle}</p>
        </section>

        {/* Submit Request Form */}
        <section>
          <SubmitRequestForm onSubmitSuccess={fetchRequests} embedded language={language} />
        </section>

        {/* My Requests */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground text-center">{t.myRequests}</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fetchError ? (
            <p className="text-center text-sm text-destructive">{t.loadError}</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">{t.noRequests}</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="py-4 px-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{req.id.slice(0, 8)}
                          </span>
                          <Badge variant="outline" className={statusClass(req.status)}>
                            {req.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(req.created_at), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <p className="font-medium text-sm text-foreground">{formatType(req.type)}</p>
                        <p className="text-xs text-muted-foreground">{req.location}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>
                          {t.view}
                        </Button>
                        {(() => {
                          const surveyId = surveyIdMap[req.id];
                          const surveyDisabled = req.status !== "Resolved" || !surveyId || completedSurveys.has(req.id);
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={surveyDisabled}
                              onClick={() => !surveyDisabled && navigate(`/survey?id=${surveyId}`)}
                            >
                              {t.survey}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                    <RequestPizzaTracker status={req.status} language={language} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.requestDetails}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-2">
              <RequestPizzaTracker status={selectedRequest.status} />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.requestId}</p>
                <p className="font-mono text-sm break-all">{selectedRequest.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.status}</p>
                <Badge variant="outline" className={statusClass(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.requestType}</p>
                <p className="text-sm">{formatType(selectedRequest.type)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.location}</p>
                <p className="text-sm">{selectedRequest.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.description}</p>
                <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.dateSubmitted}</p>
                <p className="text-sm">
                  {format(new Date(selectedRequest.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.attachment}</p>
                {selectedRequest.attachment_url ? (
                  <a
                    href={selectedRequest.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {t.viewAttachedFile} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.noAttachment}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t.statusHistory}</p>
                <RequestStatusHistory requestId={selectedRequest.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
