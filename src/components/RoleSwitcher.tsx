import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

export default function RoleSwitcher() {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (newRole: "citizen" | "staff") => {
    if (newRole === role) return;
    await switchRole(newRole);
    toast.success(`Switched to ${newRole} role`);
    navigate(newRole === "staff" ? "/staff/dashboard" : "/portal");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Switch Role</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleSwitch("citizen")}
          className={role === "citizen" ? "bg-accent" : ""}
        >
          Citizen
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSwitch("staff")}
          className={role === "staff" || role === "manager" ? "bg-accent" : ""}
        >
          Staff
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
