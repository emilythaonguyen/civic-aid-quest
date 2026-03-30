import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import RoleSwitcher from "@/components/RoleSwitcher";
import { LogOut } from "lucide-react";

interface StaffHeaderProps {
  staffName: string;
  /** Label of the currently active nav item (will render as disabled button) */
  activePage?: "Dashboard" | "Workload" | "Survey Results" | "Analytics";
}

const allNavItems: { label: StaffHeaderProps["activePage"]; to: string; managerOnly: boolean }[] = [
  { label: "Dashboard", to: "/staff/dashboard", managerOnly: true },
  { label: "Workload", to: "/staff/workload", managerOnly: true },
  { label: "Survey Results", to: "/survey-results", managerOnly: false },
  { label: "Analytics", to: "/analytics", managerOnly: false },
];

export default function StaffHeader({ staffName, activePage }: StaffHeaderProps) {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/staff-login");
  };

  const visibleItems = allNavItems.filter(
    (item) => !item.managerOnly || role === "manager"
  );

  return (
    <header className="border-b bg-card px-6 py-4 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-primary">
          Civic Service Tracker — Staff Portal
        </h1>
        <nav className="flex items-center gap-2">
          {visibleItems.map((item) =>
            item.label === activePage ? (
              <Button key={item.label} size="sm" variant="default" disabled>
                {item.label}
              </Button>
            ) : (
              <Button key={item.label} size="sm" variant="outline" asChild>
                <Link to={item.to}>{item.label}</Link>
              </Button>
            )
          )}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground min-w-[60px]">
          {staffName || "\u00A0"}
        </span>
        <RoleSwitcher />
        <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </header>
  );
}
