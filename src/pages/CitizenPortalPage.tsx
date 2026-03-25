import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ExternalLink } from "lucide-react";
import RequestStatusHistory from "@/components/RequestStatusHistory";
import SubmitRequestForm from "@/components/SubmitRequestForm";
import RoleSwitcher from "@/components/RoleSwitcher";
import { format } from "date-fns";


interface ServiceRequest {
  id: string;
  type: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
  attachment_url: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-muted text-muted-foreground",
  "In Review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

function statusClass(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES["Open"];
}

function formatType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

export default function CitizenPortalPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(false);
    const { data, error } = await supabase
      .from("requests")
      .select("id, type, location, description, status, created_at, attachment_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch requests:", error);
      setFetchError(true);
    } else {
      setRequests(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Listen for inserts to auto-refresh
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-requests")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requests", filter: `user_id=eq.${user.id}` },
        () => fetchRequests()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchRequests]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Citizen Connect</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <RoleSwitcher />
          <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <section className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Welcome to Your Citizen Portal</h2>
          <p className="text-muted-foreground">
            Report a non-emergency issue in your community. Fill out the form below and track your request status.
          </p>
        </section>

        {/* Submit Request Form */}
        <section>
          <SubmitRequestForm onSubmitSuccess={fetchRequests} embedded />
        </section>


        {/* My Requests */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground text-center">My Requests</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fetchError ? (
            <p className="text-center text-sm text-destructive">
              Unable to load your requests. Please refresh the page.
            </p>
          ) : requests.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              You haven't submitted any requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 px-5">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{req.id.slice(0, 8)}
                        </span>
                        <Badge variant="outline" className={statusClass(req.status)}>
                          {req.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm text-foreground">{formatType(req.type)}</p>
                      <p className="text-xs text-muted-foreground">{req.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(req.created_at), "MMM dd, yyyy")}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Request ID</p>
                <p className="font-mono text-sm break-all">{selectedRequest.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                <Badge variant="outline" className={statusClass(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Request Type</p>
                <p className="text-sm">{formatType(selectedRequest.type)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                <p className="text-sm">{selectedRequest.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Date Submitted</p>
                <p className="text-sm">
                  {format(new Date(selectedRequest.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Attachment</p>
                {selectedRequest.attachment_url ? (
                  <a
                    href={selectedRequest.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View Attached File <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No attachment provided.</p>
                )}
              </div>
              {/* Status History */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Status History</p>
                <RequestStatusHistory requestId={selectedRequest.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
