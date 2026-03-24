import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CitizenPortalPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
          <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Welcome to Your Citizen Portal</h2>
        <p className="text-muted-foreground">
          This is where you will submit and track your civic service requests.
          Full submission form coming in Sprint 2.
        </p>
        <Badge variant="secondary" className="text-xs">Sprint 2 — Coming Soon</Badge>
      </main>
    </div>
  );
}
