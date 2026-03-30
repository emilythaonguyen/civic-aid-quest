import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "citizen" | "staff";
}

const isStaffLike = (r: string | null): r is "staff" | "manager" =>
  r === "staff" || r === "manager";

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

  // Manager is treated the same as staff for access control
  const effectiveMatch =
    requiredRole === "staff" ? isStaffLike(role) : role === requiredRole;

  if (role && !effectiveMatch) {
    return <Navigate to={isStaffLike(role) ? "/analytics" : "/portal"} replace />;
  }

  return <>{children}</>;
}
