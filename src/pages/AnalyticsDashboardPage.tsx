import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BarChart3, Clock, FileText, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  totalClosed: number;
  totalRequests: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(220, 70%, 55%)",
  "hsl(142, 60%, 45%)",
  "hsl(38, 90%, 55%)",
  "hsl(0, 70%, 55%)",
];

export default function AnalyticsDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch all requests (only non-PII aggregate fields)
      const { data: requests, error: reqError } = await supabase
        .from("requests")
        .select("request_type, status, created_at, resolved_at");

      if (reqError) throw reqError;

      const rows = requests ?? [];

      // Volume by category
      const categoryMap: Record<string, number> = {};
      rows.forEach((r) => {
        const cat = r.request_type || "Other";
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

      const totalOpen = rows.filter(
        (r) => r.status === "Open" || r.status === "In Progress"
      ).length;
      const totalClosed = rows.filter(
        (r) => r.status === "Closed" || r.status === "Resolved"
      ).length;

      setAnalytics({
        volumeByCategory,
        avgResolutionHours,
        totalOpen,
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

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
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">Civic Tracker</h1>
          <Badge variant="outline" className="text-xs">Staff</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Service request volume and resolution metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">S2-05 · F7</Badge>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="p-2 rounded-md bg-yellow-500/10">
                      <BarChart3 className="h-4 w-4 text-yellow-600" />
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
                    <div className="p-2 rounded-md bg-green-500/10">
                      <TrendingUp className="h-4 w-4 text-green-600" />
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
                    <div className="p-2 rounded-md bg-blue-500/10">
                      <Clock className="h-4 w-4 text-blue-600" />
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Request Volume by Category</CardTitle>
                  <CardDescription>Total submissions per request type</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.volumeByCategory.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                      No data yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={analytics.volumeByCategory}
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
                        <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
                          {analytics.volumeByCategory.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Category Distribution</CardTitle>
                  <CardDescription>Proportional share of request types</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.volumeByCategory.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                      No data yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={analytics.volumeByCategory}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="45%"
                          outerRadius={90}
                          label={({ category, percent }) =>
                            `${category} (${(percent * 100).toFixed(0)}%)`
                          }
                          labelLine={true}
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
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                            fontSize: 12,
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Average Resolution Time Detail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Resolution Time</CardTitle>
                <CardDescription>
                  Calculated across all closed / resolved tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-foreground">
                      {formatResolutionTime(analytics.avgResolutionHours)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analytics.totalClosed > 0
                        ? `Based on ${analytics.totalClosed} closed ticket${analytics.totalClosed !== 1 ? "s" : ""}`
                        : "No closed tickets yet — resolve tickets to see this metric"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
