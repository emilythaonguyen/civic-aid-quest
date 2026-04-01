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

const nativeNames: Record<Language, string> = {
  en: "English", es: "Español", fr: "Français", pt: "Português",
  vi: "Tiếng Việt", zh: "中文", ko: "한국어", ar: "العربية",
  ht: "Kreyòl Ayisyen", de: "Deutsch", he: "עברית", ta: "தமிழ்",
  hi: "हिन्दी", ml: "മലയാളം",
};

const langCodes: Language[] = ["en","es","fr","pt","vi","zh","ko","ar","ht","de","he","ta","hi","ml"];
const flags: Record<Language, string> = {
  en:"🇺🇸", es:"🇪🇸", fr:"🇫🇷", pt:"🇵🇹", vi:"🇻🇳", zh:"🇨🇳",
  ko:"🇰🇷", ar:"🇸🇦", ht:"🇭🇹", de:"🇩🇪", he:"🇮🇱", ta:"🇮🇳", hi:"🇮🇳", ml:"🇮🇳",
};

// translatedNames[uiLang][targetLang] = name of targetLang in uiLang
const translatedNames: Record<Language, Record<Language, string>> = {
  en: { en:"English", es:"Spanish", fr:"French", pt:"Portuguese", vi:"Vietnamese", zh:"Chinese", ko:"Korean", ar:"Arabic", ht:"Haitian Creole", de:"German", he:"Hebrew", ta:"Tamil", hi:"Hindi", ml:"Malayalam" },
  es: { en:"Inglés", es:"Español", fr:"Francés", pt:"Portugués", vi:"Vietnamita", zh:"Chino", ko:"Coreano", ar:"Árabe", ht:"Criollo Haitiano", de:"Alemán", he:"Hebreo", ta:"Tamil", hi:"Hindi", ml:"Malayalam" },
  fr: { en:"Anglais", es:"Espagnol", fr:"Français", pt:"Portugais", vi:"Vietnamien", zh:"Chinois", ko:"Coréen", ar:"Arabe", ht:"Créole Haïtien", de:"Allemand", he:"Hébreu", ta:"Tamoul", hi:"Hindi", ml:"Malayalam" },
  pt: { en:"Inglês", es:"Espanhol", fr:"Francês", pt:"Português", vi:"Vietnamita", zh:"Chinês", ko:"Coreano", ar:"Árabe", ht:"Crioulo Haitiano", de:"Alemão", he:"Hebraico", ta:"Tâmil", hi:"Hindi", ml:"Malayalam" },
  vi: { en:"Tiếng Anh", es:"Tiếng Tây Ban Nha", fr:"Tiếng Pháp", pt:"Tiếng Bồ Đào Nha", vi:"Tiếng Việt", zh:"Tiếng Trung", ko:"Tiếng Hàn", ar:"Tiếng Ả Rập", ht:"Tiếng Creole Haiti", de:"Tiếng Đức", he:"Tiếng Do Thái", ta:"Tiếng Tamil", hi:"Tiếng Hindi", ml:"Tiếng Malayalam" },
  zh: { en:"英语", es:"西班牙语", fr:"法语", pt:"葡萄牙语", vi:"越南语", zh:"中文", ko:"韩语", ar:"阿拉伯语", ht:"海地克里奥尔语", de:"德语", he:"希伯来语", ta:"泰米尔语", hi:"印地语", ml:"马拉雅拉姆语" },
  ko: { en:"영어", es:"스페인어", fr:"프랑스어", pt:"포르투갈어", vi:"베트남어", zh:"중국어", ko:"한국어", ar:"아랍어", ht:"아이티 크리올어", de:"독일어", he:"히브리어", ta:"타밀어", hi:"힌디어", ml:"말라얄람어" },
  ar: { en:"الإنجليزية", es:"الإسبانية", fr:"الفرنسية", pt:"البرتغالية", vi:"الفيتنامية", zh:"الصينية", ko:"الكورية", ar:"العربية", ht:"الكريولية الهايتية", de:"الألمانية", he:"العبرية", ta:"التاميلية", hi:"الهندية", ml:"المالايالامية" },
  ht: { en:"Anglè", es:"Espagnòl", fr:"Fransè", pt:"Pòtigè", vi:"Vyetnamyen", zh:"Chinwa", ko:"Koreyen", ar:"Arab", ht:"Kreyòl Ayisyen", de:"Alman", he:"Ebre", ta:"Tamoul", hi:"Endi", ml:"Malayalam" },
  de: { en:"Englisch", es:"Spanisch", fr:"Französisch", pt:"Portugiesisch", vi:"Vietnamesisch", zh:"Chinesisch", ko:"Koreanisch", ar:"Arabisch", ht:"Haitianisches Kreolisch", de:"Deutsch", he:"Hebräisch", ta:"Tamilisch", hi:"Hindi", ml:"Malayalam" },
  he: { en:"אנגלית", es:"ספרדית", fr:"צרפתית", pt:"פורטוגזית", vi:"וייטנאמית", zh:"סינית", ko:"קוריאנית", ar:"ערבית", ht:"קריאולית האיטית", de:"גרמנית", he:"עברית", ta:"טמילית", hi:"הינדי", ml:"מלאיאלאם" },
  ta: { en:"ஆங்கிலம்", es:"ஸ்பானிஷ்", fr:"பிரெஞ்சு", pt:"போர்த்துகீசியம்", vi:"வியட்நாமீஸ்", zh:"சீனம்", ko:"கொரியன்", ar:"அரபிக்", ht:"ஹைட்டியன் கிரியோல்", de:"ஜெர்மன்", he:"ஹீப்ரு", ta:"தமிழ்", hi:"இந்தி", ml:"மலையாளம்" },
  hi: { en:"अंग्रेज़ी", es:"स्पेनिश", fr:"फ्रेंच", pt:"पुर्तगाली", vi:"वियतनामी", zh:"चीनी", ko:"कोरियाई", ar:"अरबी", ht:"हाईटियन क्रियोल", de:"जर्मन", he:"हिब्रू", ta:"तमिल", hi:"हिन्दी", ml:"मलयालम" },
  ml: { en:"ഇംഗ്ലീഷ്", es:"സ്പാനിഷ്", fr:"ഫ്രഞ്ച്", pt:"പോർച്ചുഗീസ്", vi:"വിയറ്റ്നാമീസ്", zh:"ചൈനീസ്", ko:"കൊറിയൻ", ar:"അറബിക്", ht:"ഹെയ്തിയൻ ക്രിയോൾ", de:"ജർമ്മൻ", he:"ഹീബ്രു", ta:"തമിഴ്", hi:"ഹിന്ദി", ml:"മലയാളം" },
};

export default function LanguageSelector({ language, onChange, className }: LanguageSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`gap-1.5 text-sm font-normal ${className ?? ""}`}>
          <Globe className="h-4 w-4" />
          {nativeNames[language]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <ScrollArea className="h-[min(360px,50vh)]">
          <div className="p-1">
            {langCodes.map((code) => (
              <DropdownMenuItem
                key={code}
                onClick={() => onChange(code)}
                className="gap-2"
              >
                <span>{flags[code]}</span>
                <span className="flex-1">{translatedNames[language][code]}</span>
                {language === code && <span>✓</span>}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
