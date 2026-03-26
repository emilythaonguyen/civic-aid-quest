import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import RoleSwitcher from "@/components/RoleSwitcher";

interface WorkloadRow {
  staff_id: string;
  full_name: string;
  active_assignments: number;
  open_count: number;
  in_review_count: number;
  resolved_count: number;
  escalated_count: number;
}

export default function StaffWorkloadPage() {
  const { user, signOut, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<WorkloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (role === "citizen") {
      navigate("/portal", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!user || role !== "staff") return;
    const fetchWorkload = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error: rpcErr } = await supabase.rpc("get_staff_workload");
        if (rpcErr) throw rpcErr;
        setRows(
          (data ?? []).map((r: any) => ({
            staff_id: r.staff_id,
            full_name: r.full_name ?? "Unknown",
            active_assignments: Number(r.active_assignments) || 0,
            open_count: Number(r.open_count) || 0,
            in_review_count: Number(r.in_review_count) || 0,
            resolved_count: Number(r.resolved_count) || 0,
            escalated_count: Number(r.escalated_count) || 0,
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load workload data.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkload();
  }, [user, role]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-primary">
            Civic Service Tracker — Staff Portal
          </h1>
          <nav className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/staff/dashboard">Dashboard</Link>
            </Button>
            <Button size="sm" variant="default" disabled>
              Workload
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/survey-results">Survey Results</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/analytics">Analytics</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <RoleSwitcher />
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Staff Workload Summary</h2>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No staff members found.
          </p>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead className="text-center">Active Tickets</TableHead>
                  <TableHead className="text-center">Open</TableHead>
                  <TableHead className="text-center">In Review</TableHead>
                  <TableHead className="text-center">Escalated</TableHead>
                  <TableHead className="text-center">Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.staff_id}>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell className="text-center">{r.active_assignments}</TableCell>
                    <TableCell className="text-center">{r.open_count}</TableCell>
                    <TableCell className="text-center">{r.in_review_count}</TableCell>
                    <TableCell className={`text-center ${r.escalated_count > 0 ? "text-red-600 font-semibold" : ""}`}>
                      {r.escalated_count}
                    </TableCell>
                    <TableCell className="text-center">{r.resolved_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
