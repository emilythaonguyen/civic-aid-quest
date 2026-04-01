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
  { code: "es", flag: "🇪🇸", label: "Spanish (Español)", shortLabel: "Español" },
  { code: "fr", flag: "🇫🇷", label: "French (Français)", shortLabel: "Français" },
  { code: "pt", flag: "🇵🇹", label: "Portuguese (Português)", shortLabel: "Português" },
  { code: "vi", flag: "🇻🇳", label: "Vietnamese (Tiếng Việt)", shortLabel: "Tiếng Việt" },
  { code: "zh", flag: "🇨🇳", label: "Chinese Simplified (中文)", shortLabel: "中文" },
  { code: "ko", flag: "🇰🇷", label: "Korean (한국어)", shortLabel: "한국어" },
  { code: "ar", flag: "🇸🇦", label: "Arabic (العربية)", shortLabel: "العربية" },
  { code: "ht", flag: "🇭🇹", label: "Haitian Creole (Kreyòl Ayisyen)", shortLabel: "Kreyòl" },
  { code: "de", flag: "🇩🇪", label: "German (Deutsch)", shortLabel: "Deutsch" },
  { code: "he", flag: "🇮🇱", label: "Hebrew (עברית)", shortLabel: "עברית" },
  { code: "ta", flag: "🇮🇳", label: "Tamil (தமிழ்)", shortLabel: "தமிழ்" },
  { code: "ml", flag: "🇮🇳", label: "Malayalam (മലയാളം)", shortLabel: "മലയാളം" },
  { code: "hi", flag: "🇮🇳", label: "Hindi (हिन्दी)", shortLabel: "हिन्दी" },
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
        <ScrollArea className="h-[min(360px,50vh)]">
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
