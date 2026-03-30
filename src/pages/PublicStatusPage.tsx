import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck } from "lucide-react";
import RoleSwitcher from "@/components/RoleSwitcher";
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

const OPEN_COLOR = "#1E293B";
const RESOLVED_COLOR = "#4ADE80";

function getStoredLanguage(): Language {
  const stored = localStorage.getItem("citizen-lang");
  return isValidLanguage(stored) ? stored : "en";
}

export default function PublicStatusPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<CategoryStat[]>([]);
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
      const { data, error: fetchError } = await supabase
        .from("requests")
        .select("type, status");

      if (fetchError) throw fetchError;

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
  const total = totalOpen + totalResolved;

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0F172A' }} dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header style={{ backgroundColor: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{t.civicTracker}</h1>
              <Button size="sm" className="bg-transparent text-white hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                {t.public}
              </Button>
              <Button size="sm" className="bg-transparent text-white hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => navigate("/portal")}>
                {t.returnToPortal}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector language={language} onChange={handleLanguageChange} className="text-[#94A3B8] hover:text-white" />
              <span className="text-sm text-[#94A3B8]">{user?.user_metadata?.full_name || user?.email}</span>
              <RoleSwitcher />
              <Button size="sm" className="bg-transparent text-[#94A3B8] hover:text-white hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }} onClick={async () => { await signOut(); navigate("/citizen-login"); }}>{t.signOut}</Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-white">{t.serviceRequestStatus}</h2>
            <p className="text-sm text-[#94A3B8] mt-1">{t.statusSubtitle}</p>
            <span className="inline-block text-xs mt-2 px-2.5 py-1 rounded-md text-[#94A3B8]" style={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}>S2-06 · F16</span>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#94A3B8]" />
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl pt-6 text-center pb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-3xl font-bold text-white">{total}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{t.totalRequests}</p>
                </div>
                <div className="rounded-xl pt-6 text-center pb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-3xl font-bold text-white">{totalOpen}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{t.openInProgress}</p>
                </div>
                <div className="rounded-xl pt-6 text-center pb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-3xl font-bold text-[#4ADE80]">{totalResolved}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{t.resolvedClosed}</p>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="px-6 pt-6 pb-2">
                  <h3 className="text-base font-semibold text-white">{t.chartTitle}</h3>
                  <p className="text-sm text-[#94A3B8] mt-1">{t.chartDescription}</p>
                </div>
                <div className="px-6 pb-6">
                  {stats.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-[#94A3B8] text-sm">
                      {t.noRequestsRecorded}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={stats}
                        margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
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
                            backgroundColor: "#1E293B",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "6px",
                            fontSize: 12,
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8, color: "#CBD5E1" }} />
                        <Bar dataKey="open" name={t.openLabel} fill={OPEN_COLOR} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" name={t.resolvedLabel} fill={RESOLVED_COLOR} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Privacy notice footer */}
              <div className="rounded-md px-4 py-3 flex items-start gap-3 text-xs text-[#94A3B8]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t.privacyNotice}</span>
              </div>

              {lastUpdated && (
                <p className="text-xs text-center text-[#94A3B8]">
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
