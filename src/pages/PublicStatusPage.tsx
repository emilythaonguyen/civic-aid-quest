import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

import LanguageSelector from "@/components/LanguageSelector";
import { translations, isValidLanguage, type Language } from "@/i18n/citizenTranslations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategoryStat {
  category: string;
  open: number;
  resolved: number;
}

const OPEN_COLOR = "#3B82F6";
const RESOLVED_COLOR_DARK = "#4ADE80";
const RESOLVED_COLOR_LIGHT = "#16A34A";

function getStoredLanguage(): Language {
  const stored = localStorage.getItem("citizen-lang");
  return isValidLanguage(stored) ? stored : "en";
}

export default function PublicStatusPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [inReviewCount, setInReviewCount] = useState(0);
  const [escalatedCount, setEscalatedCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const t = translations[language];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("citizen-lang", lang);
  };

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      const [{ data, error: fetchError }, { count, error: countError }, { count: irCount, error: irError }, { count: escCount, error: escError }] = await Promise.all([
        supabase.from("requests").select("type, status"),
        supabase.from("requests").select("*", { count: "exact", head: true }),
        supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", "in_review"),
        supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", "escalated"),
      ]);

      if (fetchError) throw fetchError;
      if (countError) throw countError;
      if (irError) throw irError;
      if (escError) throw escError;

      setTotalCount(count ?? 0);
      setInReviewCount(irCount ?? 0);
      setEscalatedCount(escCount ?? 0);

      const rows = data ?? [];

      const map: Record<string, { open: number; resolved: number }> = {};
      rows.forEach((r) => {
        const cat = r.type || "Other";
        if (!map[cat]) map[cat] = { open: 0, resolved: 0 };
        const s = (r.status ?? "").toLowerCase();
        if (s === "open" || s === "in progress") {
          map[cat].open += 1;
        } else if (s === "closed" || s === "resolved") {
          map[cat].resolved += 1;
        }
      });

      const result: CategoryStat[] = Object.entries(map).map(
        ([category, counts]) => ({ category, ...counts })
      );

      setStats(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(t.loadStatusError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalOpen = stats.reduce((s, c) => s + c.open, 0);
  const totalResolved = stats.reduce((s, c) => s + c.resolved, 0);

  const resolvedColor = isDark ? RESOLVED_COLOR_DARK : RESOLVED_COLOR_LIGHT;

  const cardStyle = isDark
    ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
    : { background: "#FFFFFF", border: "1px solid #E2E8F0" };

  return (
    <div
      className="min-h-screen relative"
      dir={language === "ar" || language === "he" ? "rtl" : "ltr"}
      style={{ backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }}
    >
      {/* Grid pattern overlay — dark only */}
      {isDark && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <header
          className="px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
          }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.citizenConnect}</h1>
            <Button
              size="sm"
              variant="outline"
              className={isDark
                ? "border-white/20 text-white hover:bg-white/10 bg-transparent"
                : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"
              }
              onClick={() => navigate("/status")}
            >
              {t.publicStatus}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={isDark
                ? "border-white/20 text-white hover:bg-white/10 bg-transparent"
                : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"
              }
              onClick={() => navigate("/portal")}
            >
              {t.myPortal}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle className={isDark ? "text-white hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"} lightLabel={t.lightModeLabel} darkLabel={t.darkModeLabel} />
            <LanguageSelector language={language} onChange={handleLanguageChange} className={isDark ? "text-white hover:text-black hover:bg-white/10" : "text-[#0F172A] hover:bg-gray-100"} />
            <span className="text-sm" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{user?.user_metadata?.full_name || user?.email}</span>
            
            <Button
              variant="outline"
              size="sm"
              className={isDark
                ? "border-white/20 text-white hover:bg-white/10 bg-transparent"
                : "border-[#CBD5E1] text-[#0F172A] hover:bg-gray-50 bg-transparent"
              }
              onClick={async () => { await signOut(); navigate("/"); }}
            >
              {t.signOut}
            </Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.serviceRequestStatus}</h2>
            <p className="text-sm mt-1" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.statusSubtitle}</p>
            <span
              className="inline-block text-xs mt-2 px-2.5 py-1 rounded-md"
              style={isDark
                ? { backgroundColor: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8" }
                : { backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569" }
              }
            >
              S2-06 · F16
            </span>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#94A3B8" }} />
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
               <div className="grid grid-cols-5 gap-4">
                <div className="rounded-xl pt-6 text-center pb-6" style={cardStyle}>
                  <p className="text-3xl font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{totalCount}</p>
                  <p className="text-xs mt-1" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.totalRequests}</p>
                </div>
                <div className="rounded-xl pt-6 text-center pb-6" style={cardStyle}>
                  <p className="text-3xl font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{totalOpen}</p>
                  <p className="text-xs mt-1" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.openInProgress}</p>
                </div>
                <div className="rounded-xl pt-6 text-center pb-6" style={cardStyle}>
                  <p className="text-3xl font-bold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{inReviewCount}</p>
                  <p className="text-xs mt-1" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.inReview}</p>
                </div>
                <div className="rounded-xl pt-6 text-center pb-6" style={cardStyle}>
                  <p className="text-3xl font-bold" style={{ color: "#F59E0B" }}>{escalatedCount}</p>
                  <p className="text-xs mt-1" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.escalated}</p>
                </div>
                <div className="rounded-xl pt-6 text-center pb-6" style={cardStyle}>
                  <p className="text-3xl font-bold" style={{ color: resolvedColor }}>{totalResolved}</p>
                  <p className="text-xs mt-1" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.resolvedClosed}</p>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="rounded-xl" style={cardStyle}>
                <div className="px-6 pt-6 pb-2">
                  <h3 className="text-base font-semibold" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>{t.chartTitle}</h3>
                  <p className="text-sm mt-1" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{t.chartDescription}</p>
                </div>
                <div className="px-6 pb-6">
                  {stats.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-sm" style={{ color: "#94A3B8" }}>
                      {t.noRequestsRecorded}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={stats}
                        margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"} />
                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          angle={-30}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
                            borderRadius: "6px",
                            fontSize: 12,
                            color: isDark ? "#fff" : "#0F172A",
                          }}
                          labelStyle={{ color: isDark ? "#fff" : "#0F172A" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8, color: isDark ? "#CBD5E1" : "#64748B" }} />
                        <Bar dataKey="open" name={t.openLabel} fill={OPEN_COLOR} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" name={t.resolvedLabel} fill={resolvedColor} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Privacy notice footer */}
              <div className="rounded-md px-4 py-3 flex items-start gap-3 text-xs" style={{ ...cardStyle, color: isDark ? "#94A3B8" : "#475569" }}>
                <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t.privacyNotice}</span>
              </div>

              {lastUpdated && (
                <p className="text-xs text-center" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                  {t.lastUpdated} {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
