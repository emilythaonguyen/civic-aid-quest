import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StaffHeader from "@/components/StaffHeader";
import StaffWorkloadSummary from "@/components/StaffWorkloadSummary";
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



const CATEGORY_OPTIONS = ["All", "Road", "Lighting", "Sanitation", "Parks", "Other"] as const;


export default function StaffDashboardListPage() {
  const { user, signOut, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [staffName, setStaffName] = useState("");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [workloadStaffFilter, setWorkloadStaffFilter] = useState<string | null>(null);
  const [dateSort, setDateSort] = useState<"default" | "newest" | "oldest">("default");

  // Assignment data
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // ticketId -> staffId
  const [staffMembers, setStaffMembers] = useState<{ id: string; name: string }[]>([]);

  // Access control
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

  // Fetch staff name
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setStaffName(data.full_name);
      });
  }, [user]);

  // Fetch staff members
  useEffect(() => {
    if (!user || role !== "manager") return;
    supabase
      .rpc("get_staff_workload")
      .then(({ data }) => {
        if (data) {
          setStaffMembers(
            (data ?? []).map((r: any) => ({
              id: r.staff_id,
              name: r.full_name ?? "Unknown",
            }))
          );
        }
      });
  }, [user, role]);

  // Fetch tickets & assignments
  useEffect(() => {
    if (!user || (role !== "staff" && role !== "manager")) return;
    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
        const [ticketRes, assignRes] = await Promise.all([
          supabase
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
            .order("created_at", { ascending: false }),
          supabase.from("assignments").select("request_id, assigned_to").is("unassigned_at", null),
        ]);

        if (ticketRes.error) throw ticketRes.error;

        const assignMap: Record<string, string> = {};
        (assignRes.data ?? []).forEach((a: any) => {
          assignMap[a.request_id] = a.assigned_to;
        });
        setAssignments(assignMap);

        const mapped: TicketRow[] = (ticketRes.data ?? []).map((r: any) => ({
          id: r.id,
          citizen_name: r.profiles?.full_name ?? "Unknown",
          category: r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : "Other",
          status: r.status ?? "Open",
          priority: r.triage_priority ?? null,
          location: r.location ?? "",
          created_at: r.created_at,
        }));
        setTickets(mapped);
      } catch (err) {
        console.error(err);
        setError("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user, role]);

  const filtered = useMemo(() => {
    const result = tickets.filter((t) => {
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
      if (assignmentFilter === "Unassigned" && assignments[t.id]) return false;
      if (
        assignmentFilter !== "All" &&
        assignmentFilter !== "Unassigned" &&
        assignments[t.id] !== assignmentFilter
      ) return false;
      if (workloadStaffFilter && assignments[t.id] !== workloadStaffFilter) return false;
      if (
        locationFilter &&
        !t.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
        return false;
      return true;
    });
    if (dateSort === "default") return result;
    return result.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return dateSort === "newest" ? db - da : da - db;
    });
  }, [tickets, categoryFilter, assignmentFilter, assignments, locationFilter, workloadStaffFilter, dateSort]);

  const clearFilters = () => {
    setCategoryFilter("All");
    setAssignmentFilter("All");
    setLocationFilter("");
    setWorkloadStaffFilter(null);
    setDateSort("default");
  };

  const hasActiveFilters =
    categoryFilter !== "All" || assignmentFilter !== "All" || locationFilter !== "" || workloadStaffFilter !== null || dateSort !== "default";

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <StaffHeader staffName={staffName} activePage="Dashboard" />

      <main className="px-6 py-6 space-y-4">
        {/* Workload summary (manager only) */}
        {role === "manager" && (
          <>
            <StaffWorkloadSummary
              onSelectStaff={setWorkloadStaffFilter}
              selectedStaffId={workloadStaffFilter}
            />
          </>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Assignment</label>
            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger className="w-[170px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                {staffMembers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <Select value={dateSort} onValueChange={(v) => setDateSort(v as "default" | "newest" | "oldest")}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
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

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tables by status */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
            No tickets match your current filters.
          </div>
        ) : (
          <div className="space-y-6">
            <TicketTable title="Escalated" tickets={filtered.filter(t => t.status === "Escalated")} skipPrioritySort={dateSort !== "default"} />
            <TicketTable title="Open" tickets={filtered.filter(t => t.status === "Open")} skipPrioritySort={dateSort !== "default"} />
            <TicketTable title="In Review" tickets={filtered.filter(t => t.status === "In Review")} skipPrioritySort={dateSort !== "default"} />
            <TicketTable title="Resolved" tickets={filtered.filter(t => t.status === "Resolved")} skipPrioritySort={dateSort !== "default"} />
          </div>
        )}
      </main>
    </div>
  );
}
