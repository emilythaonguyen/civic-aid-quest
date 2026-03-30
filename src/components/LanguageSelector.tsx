import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Language } from "@/i18n/citizenTranslations";

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const languages: { code: Language; flag: string; label: string }[] = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Spanish (Español)" },
];

export default function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  const current = languages.find((l) => l.code === language)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-normal">
          <Globe className="h-4 w-4" />
          {current.label.split(" ")[0]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => onChange(l.code)}
            className="gap-2"
          >
            <span>{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            {language === l.code && <span>✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
