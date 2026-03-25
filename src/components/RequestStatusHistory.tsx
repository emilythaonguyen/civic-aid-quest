import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface HistoryEntry {
  id: string;
  new_status: string;
  created_at: string;
  note: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-muted text-muted-foreground",
  "In Review": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-green-100 text-green-800",
  Escalated: "bg-red-100 text-red-800",
};

function statusClass(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES["Open"];
}

export default function RequestStatusHistory({ requestId }: { requestId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("status_history")
      .select("id, new_status, created_at, note")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    if (!error) {
      setHistory(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();

    // Realtime subscription
    const channel = supabase
      .channel(`status-history-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "status_history",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setHistory((prev) => [
            ...prev,
            {
              id: row.id,
              new_status: row.new_status ?? row.status ?? "Unknown",
              created_at: row.created_at,
              note: row.note ?? null,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  // Find the latest resolved entry
  const resolvedEntry = [...history].reverse().find(
    (h) => h.new_status === "Resolved"
  );

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Resolved timestamp */}
      {resolvedEntry && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Resolved</p>
            <p className="text-xs text-green-700">
              {format(new Date(resolvedEntry.created_at), "MMM dd, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-2">
        {history.map((h) => (
          <div
            key={h.id}
            className="flex items-start gap-3 border-l-2 border-border pl-3 py-1"
          >
            <Badge variant="outline" className={`text-xs shrink-0 ${statusClass(h.new_status)}`}>
              {h.new_status}
            </Badge>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {format(new Date(h.created_at), "MMM dd, yyyy · h:mm a")}
              </p>
              {h.note && (
                <p className="text-sm text-foreground mt-0.5">{h.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
