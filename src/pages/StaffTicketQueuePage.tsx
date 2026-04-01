import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TicketTable from "@/components/TicketTable";
import type { TicketRow } from "@/components/TicketTable";
import { Loader2, X } from "lucide-react";
import StaffHeader from "@/components/StaffHeader";

const CATEGORY_OPTIONS = ["All", "Pothole", "Graffiti", "Dumping", "Broken Streetlight", "Other"] as const;

export default function StaffTicketQueuePage() {
  const { user, role, signOut, loading: authLoading } = useAuth();
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  const [staffName, setStaffName] = useState("");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState("My Tickets");
  const [locationFilter, setLocationFilter] = useState("");
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/staff-login", { replace: true });
      return;
    }
    if (role === "citizen") {
      navigate("/portal", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!staffId) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", staffId)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setStaffName(data.full_name);
      });
  }, [staffId]);

  useEffect(() => {
    if (!user || (role !== "staff" && role !== "manager") || !staffId) return;
    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
        // Get request IDs assigned to this staff member
        const { data: assignments, error: aErr } = await supabase
          .from("assignments")
          .select("request_id")
          .eq("assigned_to", staffId)
          .is("unassigned_at", null);
        if (aErr) throw aErr;

        const assignedIdsArr = (assignments ?? []).map((a: any) => a.request_id);
        const assignedIdsSet = new Set(assignedIdsArr);

        // Get ALL currently-assigned request IDs (to find unassigned ones)
        const { data: allAssignments, error: allAErr } = await supabase
          .from("assignments")
          .select("request_id")
          .is("unassigned_at", null);
        if (allAErr) throw allAErr;

        const allAssignedIds = new Set((allAssignments ?? []).map((a: any) => a.request_id));

        // Fetch all requests, then filter to assigned-to-staff + unassigned
        const { data, error: fetchErr } = await supabase
          .from("requests")
          .select(`
            id,
            type,
            status,
            triage_priority,
            location,
            created_at,
            profiles!user_id (
              full_name
            )
          `)
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;

        const mapped: TicketRow[] = (data ?? [])
          .filter((r: any) => assignedIdsSet.has(r.id) || !allAssignedIds.has(r.id))
          .map((r: any) => ({
            id: r.id,
            citizen_name: r.profiles?.full_name ?? "Unknown",
            category: r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : "Other",
            status: r.status ?? "Open",
            priority: r.triage_priority ?? null,
            location: r.location ?? "",
            created_at: r.created_at,
          }));
        setAssignedIds(assignedIdsSet);
        setTickets(mapped);
      } catch (err) {
        console.error(err);
        setError("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user, role, staffId]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
      if (assignmentFilter === "My Tickets" && !assignedIds.has(t.id)) return false;
      if (assignmentFilter === "Unassigned" && assignedIds.has(t.id)) return false;
      if (locationFilter && !t.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      return true;
    });
  }, [tickets, categoryFilter, assignmentFilter, assignedIds, locationFilter]);

  const clearFilters = () => {
    setCategoryFilter("All");
    setAssignmentFilter("All");
    setLocationFilter("");
  };

  const hasActiveFilters = categoryFilter !== "All" || assignmentFilter !== "All" || locationFilter !== "";

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StaffHeader staffName={staffName} activePage="My Tickets" />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <h2 className="text-xl font-bold text-foreground">
          {staffName ? `${staffName}'s Tickets` : "Staff Tickets"}
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Assignment</label>
            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="My Tickets">My Tickets</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
           </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Location</label>
            <Input
              placeholder="Filter by location…"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-[200px] h-9 text-sm"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-9">
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          )}
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
        ) : tickets.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
            No tickets are currently assigned to {staffName || "this staff member"}.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
            No tickets match your current filters.
          </div>
        ) : (
          <div className="space-y-6">
            <TicketTable title="Escalated" tickets={filtered.filter(t => t.status === "Escalated")} />
            <TicketTable title="Open" tickets={filtered.filter(t => t.status === "Open")} />
            <TicketTable title="In Review" tickets={filtered.filter(t => t.status === "In Review")} />
            <TicketTable title="Resolved" tickets={filtered.filter(t => t.status === "Resolved")} />
          </div>
        )}
      </main>
    </div>
  );
}
