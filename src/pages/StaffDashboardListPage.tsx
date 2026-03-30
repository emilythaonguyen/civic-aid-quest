import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StaffHeader from "@/components/StaffHeader";
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
  
  const [locationFilter, setLocationFilter] = useState("");

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

  // Fetch tickets
  useEffect(() => {
    if (!user || (role !== "staff" && role !== "manager")) return;
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
      
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
      if (
        locationFilter &&
        !t.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
        return false;
      return true;
    });
  }, [tickets, categoryFilter, locationFilter]);

  const clearFilters = () => {
    setCategoryFilter("All");
    setLocationFilter("");
  };

  const hasActiveFilters =
    categoryFilter !== "All" || locationFilter !== "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/staff-login");
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
      <StaffHeader staffName={staffName} activePage="Dashboard" />

      <main className="px-6 py-6 space-y-4">
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
