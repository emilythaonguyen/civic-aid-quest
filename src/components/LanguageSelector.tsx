import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Language } from "@/i18n/citizenTranslations";

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

const languages: { code: Language; flag: string; label: string; shortLabel: string }[] = [
  { code: "en", flag: "🇺🇸", label: "English", shortLabel: "English" },
  { code: "es", flag: "🇪🇸", label: "Spanish (Español)", shortLabel: "Spanish" },
  { code: "fr", flag: "🇫🇷", label: "French (Français)", shortLabel: "French" },
  { code: "pt", flag: "🇵🇹", label: "Portuguese (Português)", shortLabel: "Portuguese" },
  { code: "vi", flag: "🇻🇳", label: "Vietnamese (Tiếng Việt)", shortLabel: "Vietnamese" },
  { code: "zh", flag: "🇨🇳", label: "Chinese Simplified (中文)", shortLabel: "Chinese" },
  { code: "ko", flag: "🇰🇷", label: "Korean (한국어)", shortLabel: "Korean" },
  { code: "ar", flag: "🇸🇦", label: "Arabic (العربية)", shortLabel: "Arabic" },
  { code: "ht", flag: "🇭🇹", label: "Haitian Creole (Kreyòl Ayisyen)", shortLabel: "Haitian" },
  { code: "de", flag: "🇩🇪", label: "German (Deutsch)", shortLabel: "German" },
];

export default function LanguageSelector({ language, onChange, className }: LanguageSelectorProps) {
  const current = languages.find((l) => l.code === language)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`gap-1.5 text-sm font-normal ${className ?? ""}`}>
          <Globe className="h-4 w-4" />
          {current.shortLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <ScrollArea className="max-h-[min(400px,60vh)]">
          <div className="p-1">
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
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
