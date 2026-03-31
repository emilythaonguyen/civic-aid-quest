import { CheckCircle2, Circle, Clock, Search, Wrench, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { translations, type Language } from "@/i18n/citizenTranslations";

const STEP_KEYS = [
  { key: "Open", labelKey: "stepSubmitted" as const, descKey: "stepSubmittedDesc" as const, icon: Clock },
  { key: "In Review", labelKey: "stepInReview" as const, descKey: "stepInReviewDesc" as const, icon: Search },
  { key: "Escalated", labelKey: "stepInProgress" as const, descKey: "stepInProgressDesc" as const, icon: Wrench },
  { key: "Resolved", labelKey: "stepResolved" as const, descKey: "stepResolvedDesc" as const, icon: PartyPopper },
];

interface RequestPizzaTrackerProps {
  status: string;
  language?: Language;
  dark?: boolean;
}

export default function RequestPizzaTracker({ status, language = "en", dark }: RequestPizzaTrackerProps) {
  const t = translations[language];
  const currentIndex = STEP_KEYS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-4">
      <div className="flex items-start justify-between relative">
        {STEP_KEYS.map((_, i) => {
          if (i === STEP_KEYS.length - 1) return null;
          const segmentCompleted = i < activeIndex;
          const stepWidth = 100 / STEP_KEYS.length;
          return (
            <div
              key={`line-${i}`}
              className="absolute top-5 h-0.5 z-0"
              style={{
                left: `calc(${(i + 0.5) * stepWidth}% + 20px)`,
                width: `calc(${stepWidth}% - 40px)`,
              }}
            >
              <div className={cn("w-full h-full", dark ? "bg-[hsl(215_25%_22%)]" : "bg-muted")} />
              {segmentCompleted && (
                <div className={cn(
                  "absolute inset-0 transition-all duration-500",
                  dark ? "bg-[hsl(var(--hero-cta))]" : "bg-primary"
                )} />
              )}
            </div>
          );
        })}

        {STEP_KEYS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isCurrent = i === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  dark
                    ? isCompleted
                      ? "bg-[hsl(var(--hero-bg))] border-[hsl(var(--hero-cta))] text-white"
                      : isCurrent
                        ? "bg-[hsl(var(--hero-cta))]/15 border-[hsl(var(--hero-cta))] text-[hsl(var(--hero-accent))] ring-4 ring-[hsl(var(--hero-cta))]/20"
                        : "bg-transparent border-[hsl(215_20%_34%)] text-[hsl(215_20%_34%)]"
                    : isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary/10 border-primary text-primary ring-4 ring-primary/20"
                        : "bg-background border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isCurrent ? (
                  <Icon className="h-5 w-5" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium mt-2 text-center",
                  dark
                    ? isCurrent ? "text-[hsl(var(--hero-accent))]" : isCompleted ? "text-white" : "text-[hsl(var(--hero-muted))]"
                    : isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t[step.labelKey]}
              </span>
              <span className={cn(
                "text-[10px] text-center mt-0.5",
                dark ? "text-[hsl(215_25%_40%)]" : "text-muted-foreground"
              )}>
                {t[step.descKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
