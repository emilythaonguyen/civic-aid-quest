import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  lightLabel?: string;
  darkLabel?: string;
}

export default function ThemeToggle({ className, lightLabel, darkLabel }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  const label = isDark ? (lightLabel ?? "Light Mode") : (darkLabel ?? "Dark Mode");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`gap-1.5 text-sm font-normal ${className ?? ""}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {label}
    </Button>
  );
}
