import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, LogOut, X } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = ["All", "Open", "In Review", "Resolved", "Escalated"] as const;
const CATEGORY_OPTIONS = ["All", "Road", "Lighting", "Sanitation", "Parks", "Other"] as const;
const PRIORITY_OPTIONS = ["All", "High", "Medium", "Low"] as const;

function priorityColor(priority: string | null) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800 border-red-200";
    case "Medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

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

interface TicketRow {
  id: string;
  citizen_name: string;
  category: string;
  status: string;
  priority: string | null;
  location: string;
  created_at: string;
}

export default function StaffDashboardListPage() {
  const { user, signOut, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [staffName, setStaffName] = useState("");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");

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

  // Fetch tickets
  useEffect(() => {
    if (!user || role !== "staff") return;
    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
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

        const mapped: TicketRow[] = (data ?? []).map((r: any) => ({
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
    return tickets.filter((t) => {
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
      if (priorityFilter !== "All" && (t.priority ?? "") !== priorityFilter) return false;
      if (
        locationFilter &&
        !t.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
        return false;
      return true;
    });
  }, [tickets, statusFilter, categoryFilter, priorityFilter, locationFilter]);

  const clearFilters = () => {
    setStatusFilter("All");
    setCategoryFilter("All");
    setPriorityFilter("All");
    setLocationFilter("");
  };

  const hasActiveFilters =
    statusFilter !== "All" || categoryFilter !== "All" || priorityFilter !== "All" || locationFilter !== "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

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
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-primary">
            Civic Service Tracker — Staff Portal
          </h1>
          <nav className="flex items-center gap-2">
            <Button size="sm" variant="default" disabled>
              Dashboard
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/staff/workload">Workload</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {staffName || user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
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
          </div>

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
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
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

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
            No tickets match your current filters.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Ticket ID</TableHead>
                  <TableHead>Citizen Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[130px]">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/staff/tickets/${t.id}`)}
                  >
                    <TableCell className="font-mono text-xs">
                      {t.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>{t.citizen_name}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColor(t.priority)}`}
                      >
                        {t.priority ?? "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>{t.location}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(t.created_at), "MMM d, yyyy")}
                    </TableCell>
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
