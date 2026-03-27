import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "citizen" | "staff";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-lg">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (role && role !== requiredRole) {
    return <Navigate to={role === "staff" ? "/analytics" : "/portal"} replace />;
  }

  return <>{children}</>;
}
