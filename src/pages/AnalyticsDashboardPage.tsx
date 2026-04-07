import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BarChart3, Clock, FileText, TrendingUp, Search, AlertTriangle } from "lucide-react";
import StaffHeader from "@/components/StaffHeader";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface CategoryCount {
  category: string;
  count: number;
}

interface AnalyticsData {
  volumeByCategory: CategoryCount[];
  avgResolutionHours: number | null;
  totalOpen: number;
  totalInReview: number;
  totalEscalated: number;
  totalClosed: number;
  totalRequests: number;
}

const COLORS_LIGHT = [
  "hsl(222, 47%, 11%)",
  "hsl(220, 70%, 55%)",
  "hsl(142, 60%, 45%)",
  "hsl(38, 90%, 55%)",
  "hsl(0, 70%, 55%)",
];

const COLORS_DARK = [
  "hsl(0, 0%, 95%)",
  "hsl(220, 70%, 55%)",
  "hsl(142, 60%, 45%)",
  "hsl(38, 90%, 55%)",
  "hsl(0, 70%, 55%)",
];

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
      .then(({ data }) => { if (data?.full_name) setStaffName(data.full_name); });
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch all requests (only non-PII aggregate fields)
      const { data: requests, error: reqError } = await supabase
        .from("requests")
        .select("type, status, created_at, resolved_at");

      if (reqError) throw reqError;

      const rows = requests ?? [];

      // Volume by category
      const categoryMap: Record<string, number> = {};
      rows.forEach((r) => {
        const cat = r.type || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
      const volumeByCategory: CategoryCount[] = Object.entries(categoryMap).map(
        ([category, count]) => ({ category, count })
      );

      // Average resolution time for closed tickets (in hours)
      const closedWithTimestamps = rows.filter(
        (r) =>
          (r.status === "Closed" || r.status === "Resolved") &&
          r.created_at &&
          r.resolved_at
      );
      let avgResolutionHours: number | null = null;
      if (closedWithTimestamps.length > 0) {
        const totalMs = closedWithTimestamps.reduce((sum, r) => {
          const diff =
            new Date(r.resolved_at).getTime() - new Date(r.created_at).getTime();
          return sum + diff;
        }, 0);
        avgResolutionHours = Math.round(
          totalMs / closedWithTimestamps.length / (1000 * 60 * 60)
        );
      }

      const totalOpen = rows.filter((r) => r.status === "Open").length;
      const totalInReview = rows.filter((r) => r.status === "In Review" || r.status === "In Progress").length;
      const totalEscalated = rows.filter((r) => r.status === "Escalated").length;
      const totalClosed = rows.filter(
        (r) => r.status === "Closed" || r.status === "Resolved"
      ).length;

      setAnalytics({
        volumeByCategory,
        avgResolutionHours,
        totalOpen,
        totalInReview,
        totalEscalated,
        totalClosed,
        totalRequests: rows.length,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatResolutionTime = (hours: number | null) => {
    if (hours === null) return "N/A";
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remaining = hours % 24;
    return remaining > 0 ? `${days}d ${remaining}h` : `${days}d`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <StaffHeader staffName={staffName} activePage="Analytics" />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Service request volume and resolution metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
            </Button>
          </div>
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
        ) : analytics ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{analytics.totalRequests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-secondary">
                      <BarChart3 className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Open</p>
                      <p className="text-2xl font-bold">{analytics.totalOpen}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-950/40">
                      <Search className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">In Review</p>
                      <p className="text-2xl font-bold">{analytics.totalInReview}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-destructive/10">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Escalated</p>
                      <p className="text-2xl font-bold">{analytics.totalEscalated}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-accent">
                      <TrendingUp className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-2xl font-bold">{analytics.totalClosed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg. Resolution</p>
                      <p className="text-2xl font-bold">
                        {formatResolutionTime(analytics.avgResolutionHours)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Volume by Category</CardTitle>
                <CardDescription>Proportional share and count of each request type</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.volumeByCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                    No data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={analytics.volumeByCategory}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="45%"
                        outerRadius={100}
                        stroke="hsl(var(--background))"
                        label={({ category, count, percent, x, y, textAnchor }) => {
                          const color = getComputedStyle(document.documentElement)
                            .getPropertyValue("--foreground").trim();
                          return (
                            <text x={x} y={y} textAnchor={textAnchor} fill={color ? `hsl(${color})` : "#fff"} fontSize={12}>
                              {`${category}: ${count} (${(percent * 100).toFixed(0)}%)`}
                            </text>
                          );
                        }}
                        labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        isAnimationActive={true}
                        activeIndex={-1}
                        activeShape={null}
                        style={{ cursor: 'default', outline: 'none' }}
                      >
                        {analytics.volumeByCategory.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1e293b" : "#ffffff",
                          color: isDark ? "#f1f5f9" : "#0f172a",
                          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: 12,
                        }}
                        itemStyle={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                        labelStyle={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "hsl(var(--foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
