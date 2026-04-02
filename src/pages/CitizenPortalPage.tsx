import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ExternalLink } from "lucide-react";
import RequestStatusHistory from "@/components/RequestStatusHistory";
import RequestPizzaTracker from "@/components/RequestPizzaTracker";
import SubmitRequestForm from "@/components/SubmitRequestForm";
import EditRequestDialog from "@/components/EditRequestDialog";
import ThemeToggle from "@/components/ThemeToggle";

import LanguageSelector from "@/components/LanguageSelector";
import { translations, isValidLanguage, type Language } from "@/i18n/citizenTranslations";
import { format } from "date-fns";

interface Attachment {
  file_url: string;
  file_name: string;
}

interface ServiceRequest {
  id: string;
  type: string;
  location: string;
  description: string;
  original_location: string | null;
  original_description: string | null;
  status: string;
  created_at: string;
  attachments: Attachment[];
}

const DARK_STATUS_STYLES: Record<string, string> = {
  Open: "bg-white/10 text-white/70 border-white/10",
  "In Review": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Resolved: "bg-green-500/15 text-green-400 border-green-500/20",
};

const LIGHT_STATUS_STYLES: Record<string, string> = {
  Open: "bg-gray-100 text-gray-600 border-gray-200",
  "In Review": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-green-50 text-green-700 border-green-200",
};

function getStoredLanguage(): Language {
  const stored = localStorage.getItem("citizen-lang");
  return isValidLanguage(stored) ? stored : "en";
}

export default function CitizenPortalPage() {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
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

  const statusClass = (status: string) => {
    const styles = isDark ? DARK_STATUS_STYLES : LIGHT_STATUS_STYLES;
    return styles[status] ?? styles["Open"];
  };

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [completedSurveys, setCompletedSurveys] = useState<Set<string>>(new Set());
  const [surveyIdMap, setSurveyIdMap] = useState<Record<string, string>>({});
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(false);
    const { data, error } = await supabase
      .from("requests")
      .select("id, type, location, description, original_location, original_description, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch requests:", error);
      setFetchError(true);
    } else {
      // Fetch attachments for all requests
      const ids = (data ?? []).map((r) => r.id);
      let attachmentMap: Record<string, Attachment[]> = {};
      if (ids.length > 0) {
        const { data: attachData } = await supabase
          .from("attachments")
          .select("request_id, file_url, file_name")
          .in("request_id", ids);
        if (attachData) {
          for (const a of attachData) {
            if (!attachmentMap[a.request_id]) attachmentMap[a.request_id] = [];
            attachmentMap[a.request_id].push({ file_url: a.file_url, file_name: a.file_name });
          }
        }
      }
      setRequests((data ?? []).map((r) => ({ ...r, attachments: attachmentMap[r.id] ?? [] })));
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
    navigate("/");
  };

  return (
    <div
      className="relative min-h-screen"
      dir={language === "ar" || language === "he" ? "rtl" : "ltr"}
      style={{ backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }}
    >
      {/* Grid overlay — dark only */}
      {isDark && (
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.06] z-0"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Header */}
      <header
        className="relative z-10 px-4 sm:px-6 py-3 sm:py-4"
        style={{
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
        }}
      >
        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.citizenConnect}</h1>
            <Button size="sm" variant="outline" className={isDark ? "border-white/20 text-white hover:bg-white/10 bg-transparent" : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"} onClick={() => navigate("/status")}>{t.publicStatus}</Button>
            <Button size="sm" variant="outline" className={isDark ? "border-white/20 text-white hover:bg-white/10 bg-transparent" : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"} onClick={() => navigate("/portal")}>{t.myPortal}</Button>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle className={isDark ? "text-white hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"} lightLabel={t.lightModeLabel} darkLabel={t.darkModeLabel} />
            <LanguageSelector language={language} onChange={handleLanguageChange} className={isDark ? "text-white hover:text-black hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"} />
            <span className="text-sm" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{user?.user_metadata?.full_name || user?.email}</span>
            <Button variant="outline" size="sm" className={isDark ? "border-white/20 text-white hover:bg-white/10 bg-transparent" : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"} onClick={handleSignOut}>{t.signOut}</Button>
          </div>
        </div>
        {/* Mobile: 3 rows */}
        <div className="flex sm:hidden flex-col gap-2">
          <h1 className="text-lg font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.citizenConnect}</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle className={isDark ? "text-white hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"} lightLabel={t.lightModeLabel} darkLabel={t.darkModeLabel} />
            <LanguageSelector language={language} onChange={handleLanguageChange} className={isDark ? "text-white hover:text-black hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"} />
            <span className="text-xs" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{user?.user_metadata?.full_name || user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className={isDark ? "border-white/20 text-white hover:bg-white/10 bg-transparent text-xs" : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent text-xs"} onClick={() => navigate("/status")}>{t.publicStatus}</Button>
            <Button size="sm" variant="outline" className={isDark ? "border-white/20 text-white hover:bg-white/10 bg-transparent text-xs" : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent text-xs"} onClick={() => navigate("/portal")}>{t.myPortal}</Button>
            <Button variant="outline" size="sm" className={isDark ? "border-white/20 text-white hover:bg-white/10 bg-transparent text-xs" : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent text-xs"} onClick={handleSignOut}>{t.signOut}</Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <section className="text-center space-y-2">
          <h2 className="text-2xl font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.pageTitle}</h2>
          <p style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.pageSubtitle}</p>
        </section>

        {/* Submit Request Form */}
        <section>
          <SubmitRequestForm onSubmitSuccess={fetchRequests} embedded language={language} dark={isDark} />
        </section>

        {/* My Requests */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-center" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.myRequests}</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#94A3B8" }} />
            </div>
          ) : fetchError ? (
            <p className="text-center text-sm text-red-400">{t.loadError}</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "#94A3B8" }}>{t.noRequests}</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl p-4 space-y-3"
                  style={isDark
                    ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }
                    : { background: "#FFFFFF", border: "1px solid #E2E8F0" }
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs" style={{ color: "#2563EB" }}>
                          #{req.id.slice(0, 8)}
                        </span>
                        <Badge variant="outline" className={statusClass(req.status)}>
                          {req.status}
                        </Badge>
                        <span className="text-xs whitespace-nowrap" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                          {format(new Date(req.created_at), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <p className="font-medium text-sm" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{formatType(req.type)}</p>
                      <p className="text-xs" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{req.original_location || req.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {req.status === "Open" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={isDark
                            ? "border-white/20 text-white hover:bg-white/10 bg-transparent"
                            : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"
                          }
                          onClick={() => setEditingRequest(req)}
                        >
                          {t.editRequest}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className={isDark
                          ? "border-white/20 text-white hover:bg-white/10 bg-transparent"
                          : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"
                        }
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
                            className={isDark
                              ? "border-white/20 text-white hover:bg-white/10 bg-transparent disabled:opacity-40"
                              : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent disabled:opacity-40"
                            }
                            disabled={surveyDisabled}
                            onClick={() => !surveyDisabled && navigate(`/survey?id=${surveyId}`)}
                          >
                            {t.survey}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                  <RequestPizzaTracker status={req.status} language={language} dark={isDark} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent className={isDark
          ? "max-w-md max-h-[90vh] overflow-y-auto bg-[hsl(220_45%_16%)] border-white/10 text-white"
          : "max-w-md max-h-[90vh] overflow-y-auto bg-white border-[#E2E8F0] text-[#0F172A]"
        }>
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.requestDetails}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-2">
              <RequestPizzaTracker status={selectedRequest.status} language={language} dark={isDark} />
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{t.requestId}</p>
                <p className="font-mono text-sm break-all" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{selectedRequest.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{t.status}</p>
                <Badge variant="outline" className={statusClass(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{t.requestType}</p>
                <p className="text-sm" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{formatType(selectedRequest.type)}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{t.location}</p>
                <p className="text-sm" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{selectedRequest.original_location || selectedRequest.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{t.description}</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{selectedRequest.original_description || selectedRequest.description}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{t.dateSubmitted}</p>
                <p className="text-sm" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>
                  {format(new Date(selectedRequest.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{t.attachment}</p>
                {selectedRequest.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRequest.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm hover:underline mr-3"
                        style={{ color: "#38BDF8" }}
                      >
                        📎 {att.file_name || `${t.viewAttachedFile} ${i + 1}`} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "#94A3B8" }}>{t.noAttachment}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "#94A3B8" }}>{t.statusHistory}</p>
                <RequestStatusHistory requestId={selectedRequest.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      {editingRequest && (
        <EditRequestDialog
          request={{ id: editingRequest.id, attachmentCount: editingRequest.attachments.length }}
          open={!!editingRequest}
          onOpenChange={(open) => { if (!open) setEditingRequest(null); }}
          onSaved={fetchRequests}
          language={language}
        />
      )}
    </div>
  );
}
