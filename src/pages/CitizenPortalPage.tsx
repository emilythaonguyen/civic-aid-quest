import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  original_location: string | null;
  original_description: string | null;
  status: string;
  created_at: string;
  attachment_url: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-white/10 text-white/70 border-white/10",
  "In Review": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Resolved: "bg-green-500/15 text-green-400 border-green-500/20",
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
      .select("id, type, location, description, original_location, original_description, status, created_at, attachment_url")
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
    <div className="relative min-h-screen bg-[hsl(var(--hero-bg))]" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.06] z-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[hsl(var(--hero-bg))] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{t.citizenConnect}</h1>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            onClick={() => navigate("/status")}
          >
            {t.publicStatus}
          </Button>
        </div>
        <div className="flex items-center gap-4">
           <LanguageSelector language={language} onChange={handleLanguageChange} className="text-[hsl(var(--hero-muted))] hover:text-white" />
           <span className="text-sm text-[hsl(var(--hero-muted))]">{user?.user_metadata?.full_name || user?.email}</span>
          <RoleSwitcher />
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            onClick={handleSignOut}
          >
            {t.signOut}
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <section className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">{t.pageTitle}</h2>
          <p className="text-[hsl(var(--hero-muted))]">{t.pageSubtitle}</p>
        </section>

        {/* Submit Request Form */}
        <section>
          <SubmitRequestForm onSubmitSuccess={fetchRequests} embedded language={language} dark />
        </section>

        {/* My Requests */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white text-center">{t.myRequests}</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--hero-muted))]" />
            </div>
          ) : fetchError ? (
            <p className="text-center text-sm text-red-400">{t.loadError}</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-sm text-[hsl(var(--hero-muted))]">{t.noRequests}</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[hsl(var(--hero-accent))]">
                          #{req.id.slice(0, 8)}
                        </span>
                        <Badge variant="outline" className={statusClass(req.status)}>
                          {req.status}
                        </Badge>
                        <span className="text-xs text-[hsl(var(--hero-muted))] whitespace-nowrap">
                          {format(new Date(req.created_at), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-white">{formatType(req.type)}</p>
                      <p className="text-xs text-[hsl(var(--hero-muted))]">{req.original_location || req.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                        onClick={() => setSelectedRequest(req)}
                      >
                        {t.view}
                      </Button>
                      {(() => {
                        const surveyId = surveyIdMap[req.id];
                        const surveyDisabled = req.status !== "Resolved" || !surveyId || completedSurveys.has(req.id);
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10 bg-transparent disabled:opacity-40"
                            disabled={surveyDisabled}
                            onClick={() => !surveyDisabled && navigate(`/survey?id=${surveyId}`)}
                          >
                            {t.survey}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                  <RequestPizzaTracker status={req.status} language={language} dark />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[hsl(220_45%_16%)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{t.requestDetails}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-2">
              <RequestPizzaTracker status={selectedRequest.status} language={language} dark />
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-1">{t.requestId}</p>
                <p className="font-mono text-sm break-all text-white">{selectedRequest.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-1">{t.status}</p>
                <Badge variant="outline" className={statusClass(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-1">{t.requestType}</p>
                <p className="text-sm text-white">{formatType(selectedRequest.type)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-1">{t.location}</p>
                <p className="text-sm text-white">{selectedRequest.original_location || selectedRequest.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-1">{t.description}</p>
                <p className="text-sm whitespace-pre-wrap text-white">{selectedRequest.original_description || selectedRequest.description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-1">{t.dateSubmitted}</p>
                <p className="text-sm text-white">
                  {format(new Date(selectedRequest.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-1">{t.attachment}</p>
                {selectedRequest.attachment_url ? (
                  <a
                    href={selectedRequest.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[hsl(var(--hero-accent))] hover:underline"
                  >
                    {t.viewAttachedFile} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-sm text-[hsl(var(--hero-muted))]">{t.noAttachment}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--hero-muted))] mb-2">{t.statusHistory}</p>
                <RequestStatusHistory requestId={selectedRequest.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
