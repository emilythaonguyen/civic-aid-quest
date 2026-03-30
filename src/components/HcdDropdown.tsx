import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const HCD_PAGES = [
  { label: "Staff Empathy Map", to: "/hcd/empathy-map-staff" },
  { label: "Staff Journey Map", to: "/hcd/journey-map-staff" },
  { label: "HCD Artifacts", to: "/hcd/artifacts" },
  { label: "Prompt Templates", to: "/hcd/prompt-templates" },
  { label: "Sprint Board", to: "/hcd/sprint-board" },
  { label: "Citizen Empathy Map", to: "/hcd/citizen-empathy-map" },
  { label: "Citizen Journey Map", to: "/hcd/citizen-journey-map" },
] as const;

export default function HcdDropdown() {
  const { pathname } = useLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          HCD
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {HCD_PAGES.map((page) => (
          <DropdownMenuItem key={page.to} asChild>
            <Link
              to={page.to}
              className={pathname === page.to ? "font-semibold" : ""}
            >
              {page.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/analytics" className={pathname === "/analytics" ? "font-semibold" : ""}>
            ← Back to Analytics
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
