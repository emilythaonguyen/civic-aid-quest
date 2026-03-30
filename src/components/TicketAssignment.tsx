import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface StaffOption {
  id: string;
  full_name: string;
}

const UNASSIGNED = "__unassigned__";

export default function TicketAssignment({ ticketId, userId }: { ticketId: string; userId: string }) {
  const { role } = useAuth();
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [selectedStaff, setSelectedStaff] = useState(UNASSIGNED);
  const [currentAssignment, setCurrentAssignment] = useState(UNASSIGNED);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const assignmentPromise = supabase
          .from("assignments")
          .select("assigned_to")
          .eq("request_id", ticketId)
          .is("unassigned_at", null)
          .limit(1);

        if (role === "manager") {
          const [workloadRes, assignRes] = await Promise.all([
            supabase.rpc("get_staff_workload"),
            assignmentPromise,
          ]);

          // Only include users with role='staff' (exclude managers)
          const staffOnly = (workloadRes.data ?? [])
            .filter((r: any) => r.staff_id !== userId)
            .map((r: any) => ({
              id: r.staff_id,
              full_name: r.full_name ?? "Unknown",
            }));

          setStaffList(staffOnly);

          if (assignRes.data && assignRes.data.length > 0) {
            const assignedTo = (assignRes.data[0] as any).assigned_to;
            setSelectedStaff(assignedTo);
            setCurrentAssignment(assignedTo);
          }
        } else {
          const [staffRes, assignRes] = await Promise.all([
            supabase.from("profiles").select("id, full_name").eq("id", userId).single(),
            assignmentPromise,
          ]);

          setStaffList(
            staffRes.data
              ? [{ id: staffRes.data.id, full_name: staffRes.data.full_name ?? "Unknown" }]
              : []
          );

          if (assignRes.data && assignRes.data.length > 0) {
            const assignedTo = (assignRes.data[0] as any).assigned_to;
            setSelectedStaff(assignedTo);
            setCurrentAssignment(assignedTo);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketId, role, userId]);

  const handleSave = async () => {
    if (selectedStaff === currentAssignment) return;
    setSaving(true);
    setMsg(null);

    try {
      // Close any active assignment
      const { error: closeErr } = await supabase
        .from("assignments")
        .update({ unassigned_at: new Date().toISOString() })
        .eq("request_id", ticketId)
        .is("unassigned_at", null);

      if (closeErr) throw closeErr;

      // Insert new assignment if not unassigning
      if (selectedStaff !== UNASSIGNED) {
        const { error: insertErr } = await supabase
          .from("assignments")
          .insert({
            request_id: ticketId,
            assigned_to: selectedStaff,
            assigned_by: userId,
          });

        if (insertErr) throw insertErr;
      }

      setCurrentAssignment(selectedStaff);
      setMsg({ type: "success", text: "Assignment saved." });
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Failed to save assignment. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Assigned To</h3>
      <div className="flex items-center gap-3">
        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
          <SelectTrigger className="w-[220px] h-9 text-sm">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {staffList.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || selectedStaff === currentAssignment}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Assignment"}
        </Button>
      </div>
      {msg && (
        <div
          className={`flex items-center gap-2 text-sm ${
            msg.type === "success" ? "text-green-700" : "text-destructive"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {msg.text}
        </div>
      )}
    </div>
  );
}
