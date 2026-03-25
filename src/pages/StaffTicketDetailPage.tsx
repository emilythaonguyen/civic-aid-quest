import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = ["Open", "In Review", "Resolved", "Escalated"] as const;

function statusColor(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "In Review":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "Escalated":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

interface TicketDetail {
  id: string;
  citizen_name: string;
  category: string;
  status: string;
  location: string;
  description: string;
  created_at: string;
}

interface HistoryEntry {
  id: string;
  old_status: string;
  new_status: string;
  created_at: string;
  changed_by_name: string;
}

export default function StaffTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Access control
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

  // Fetch ticket + history
  useEffect(() => {
    if (!user || role !== "staff" || !id) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch ticket
        const { data: tData, error: tErr } = await supabase
          .from("requests")
          .select(`
            id, type, status, location, description, created_at,
            profiles!user_id ( full_name )
          `)
          .eq("id", id)
          .single();

        if (tErr) throw tErr;

        const citizenName = (tData as any).profiles?.full_name ?? "Unknown";

        const t: TicketDetail = {
          id: tData.id,
          citizen_name: citizenName,
          category: tData.type ? tData.type.charAt(0).toUpperCase() + tData.type.slice(1) : "Other",
          status: tData.status ?? "Open",
          location: tData.location ?? "",
          description: tData.description ?? "",
          created_at: tData.created_at,
        };
        setTicket(t);
        setNewStatus(t.status);

        // Fetch status history
        const { data: hData, error: hErr } = await supabase
          .from("status_history")
          .select("id, old_status, new_status, created_at, changed_by")
          .eq("request_id", id)
          .order("created_at", { ascending: true });

        if (hErr) throw hErr;

        // Fetch staff names for history
        const changedByIds = [...new Set((hData ?? []).map((h: any) => h.changed_by).filter(Boolean))];
        let staffNameMap: Record<string, string> = {};
        if (changedByIds.length > 0) {
          const { data: staffProfiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", changedByIds);
          (staffProfiles ?? []).forEach((p: any) => {
            if (p.full_name) staffNameMap[p.id] = p.full_name;
          });
        }

        setHistory(
          (hData ?? []).map((h: any) => ({
            id: h.id,
            old_status: h.old_status ?? "",
            new_status: h.new_status ?? "",
            created_at: h.created_at,
            changed_by_name: staffNameMap[h.changed_by] ?? "Unknown",
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, role, id]);

  const handleSaveStatus = async () => {
    if (!ticket || !user || newStatus === ticket.status) return;
    setSaving(true);
    setSaveMsg(null);

    const oldStatus = ticket.status;

    try {
      // Update request status
      const { error: updateErr } = await supabase
        .from("requests")
        .update({ status: newStatus })
        .eq("id", ticket.id);

      if (updateErr) throw updateErr;

      // Insert status_history row with old_status and new_status
      const { error: histErr } = await supabase.from("status_history").insert({
        request_id: ticket.id,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: user.id,
      });

      if (histErr) throw histErr;

      // Update local state
      setTicket({ ...ticket, status: newStatus });
      setHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          old_status: oldStatus,
          new_status: newStatus,
          created_at: new Date().toISOString(),
          changed_by_name: "You",
        },
      ]);
      setSaveMsg({ type: "success", text: "Status updated." });
    } catch (err) {
      console.error(err);
      setSaveMsg({ type: "error", text: "Failed to update status. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <Link
          to="/staff/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error || "Ticket not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <h1 className="text-lg font-bold text-primary">
          Civic Service Tracker — Staff Portal
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Back link */}
        <Link
          to="/staff/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Detail section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Ticket Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Ticket ID</span>
              <p className="font-mono mt-0.5">{ticket.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Submitted by</span>
              <p className="mt-0.5">{ticket.citizen_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Category</span>
              <p className="mt-0.5">{ticket.category}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Location</span>
              <p className="mt-0.5">{ticket.location || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Submitted</span>
              <p className="mt-0.5">
                {format(new Date(ticket.created_at), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Current Status</span>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(ticket.status)}`}
                >
                  {ticket.status}
                </span>
              </p>
            </div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Description</span>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap rounded-md border bg-muted/30 p-3">
              {ticket.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Status update */}
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Update Status</h3>
          <div className="flex items-center gap-3">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleSaveStatus}
              disabled={saving || newStatus === ticket.status}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Status"}
            </Button>
          </div>
          {saveMsg && (
            <div
              className={`flex items-center gap-2 text-sm ${
                saveMsg.type === "success"
                  ? "text-green-700"
                  : "text-destructive"
              }`}
            >
              {saveMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {saveMsg.text}
            </div>
          )}
        </div>

        {/* Status history */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Status History</h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-wrap items-center gap-2 text-sm border-l-2 border-border pl-3 py-1"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(h.old_status)}`}
                  >
                    {h.old_status}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(h.new_status)}`}
                  >
                    {h.new_status}
                  </span>
                  <span className="text-muted-foreground">
                    — {format(new Date(h.created_at), "MMM d, yyyy · h:mm a")}
                  </span>
                  <span className="text-muted-foreground">
                    — Changed by: {h.changed_by_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
