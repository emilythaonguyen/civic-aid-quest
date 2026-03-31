import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


export default function StaffDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">Citizen Connect</h1>
          <Badge variant="outline" className="text-xs">Staff</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          
          <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 text-center space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Staff Dashboard</h2>
        <p className="text-muted-foreground">
          This is the staff operations area. Ticket management, assignment, and
          escalation tools are coming in Sprint 3.
        </p>
        <Badge variant="secondary" className="text-xs">Sprint 3 — Coming Soon</Badge>
      </main>
    </div>
  );
}
