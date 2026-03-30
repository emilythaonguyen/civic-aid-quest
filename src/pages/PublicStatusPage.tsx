import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck } from "lucide-react";
import RoleSwitcher from "@/components/RoleSwitcher";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CategoryStat {
  category: string;
  open: number;
  resolved: number;
}

const OPEN_COLOR = "hsl(var(--primary))";
const RESOLVED_COLOR = "hsl(142, 60%, 45%)";


export default function PublicStatusPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      // Query ALL requests — no date filter
      const { data, error: fetchError } = await supabase
        .from("requests")
        .select("type, status");

      if (fetchError) throw fetchError;

      const rows = data ?? [];

      // Aggregate by category
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
      setError("Unable to load status data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalOpen = stats.reduce((s, c) => s + c.open, 0);
  const totalResolved = stats.reduce((s, c) => s + c.resolved, 0);
  const totalThisWeek = totalOpen + totalResolved;

  const { start } = getWeekRange();
  const weekLabel = new Date(start).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary">Civic Tracker</h1>
            <Badge variant="outline" className="text-xs">Public</Badge>
            <Button className="bg-white text-black border border-input hover:bg-gray-100" size="sm" onClick={() => navigate("/portal")}>
              Return to Portal
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.user_metadata?.full_name || user?.email}</span>
            <RoleSwitcher />
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/citizen-login"); }}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Service Request Status</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Week of {weekLabel} · Public read-only view · No login required
          </p>
          <Badge variant="secondary" className="text-xs mt-2">S2-06 · F16</Badge>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{totalThisWeek}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total This Week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">{totalOpen}</p>
                  <p className="text-xs text-muted-foreground mt-1">Open / In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold" style={{ color: RESOLVED_COLOR }}>
                    {totalResolved}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Resolved / Closed</p>
                </CardContent>
              </Card>
            </div>

            {/* Grouped Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Open vs Resolved by Category</CardTitle>
                <CardDescription>
                  Counts for the current week — no personal information included
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    No requests recorded this week yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={stats}
                      margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Bar dataKey="open" name="Open / In Progress" fill={OPEN_COLOR} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" name="Resolved / Closed" fill={RESOLVED_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Category breakdown table */}
            {stats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Breakdown by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Category</th>
                          <th className="pb-2 font-medium text-right">Open</th>
                          <th className="pb-2 font-medium text-right">Resolved</th>
                          <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((row) => (
                          <tr key={row.category} className="border-b last:border-0">
                            <td className="py-2 font-medium">{row.category}</td>
                            <td className="py-2 text-right text-primary">{row.open}</td>
                            <td className="py-2 text-right" style={{ color: RESOLVED_COLOR }}>
                              {row.resolved}
                            </td>
                            <td className="py-2 text-right text-muted-foreground">
                              {row.open + row.resolved}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy notice footer */}
            <div className="rounded-md bg-muted/50 border border-border px-4 py-3 flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                This page displays aggregate counts only. No names, email addresses, physical
                addresses, phone numbers, or any other personal information are shown or returned
                in API responses (S2-06 · F16 — Zero-PII Public Dashboard).
              </span>
            </div>

            {lastUpdated && (
              <p className="text-xs text-center text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
