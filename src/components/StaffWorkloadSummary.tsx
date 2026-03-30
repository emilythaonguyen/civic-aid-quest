import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface WorkloadRow {
  staff_id: string;
  full_name: string;
  active_assignments: number;
  open_count: number;
  in_review_count: number;
  resolved_count: number;
  escalated_count: number;
}

interface Props {
  /** Called when user clicks a staff member row — parent can use this to filter tickets */
  onSelectStaff?: (staffId: string | null) => void;
  selectedStaffId?: string | null;
}

export default function StaffWorkloadSummary({ onSelectStaff, selectedStaffId }: Props) {
  const { user, role } = useAuth();
  const [rows, setRows] = useState<WorkloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || role !== "manager") return;
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

  if (role !== "manager") return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Staff Workload</h3>
        {selectedStaffId && onSelectStaff && (
          <button
            onClick={() => onSelectStaff(null)}
            className="text-xs text-primary hover:underline"
          >
            Clear staff filter
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No staff members found.</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Staff Member</TableHead>
                <TableHead className="text-xs text-center">Active</TableHead>
                <TableHead className="text-xs text-center">Open</TableHead>
                <TableHead className="text-xs text-center">In Review</TableHead>
                <TableHead className="text-xs text-center">Escalated</TableHead>
                <TableHead className="text-xs text-center">Resolved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.staff_id}
                  className={`cursor-pointer transition-colors ${
                    selectedStaffId === r.staff_id
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => onSelectStaff?.(selectedStaffId === r.staff_id ? null : r.staff_id)}
                >
                  <TableCell className="text-sm font-medium">
                    {r.full_name}
                  </TableCell>
                  <TableCell className="text-sm text-center">{r.active_assignments}</TableCell>
                  <TableCell className="text-sm text-center">{r.open_count}</TableCell>
                  <TableCell className="text-sm text-center">{r.in_review_count}</TableCell>
                  <TableCell className={`text-sm text-center ${r.escalated_count > 0 ? "text-destructive font-semibold" : ""}`}>
                    {r.escalated_count}
                  </TableCell>
                  <TableCell className="text-sm text-center">{r.resolved_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
