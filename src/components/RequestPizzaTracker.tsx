import { CheckCircle2, Circle, Clock, Search, Wrench, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "Open", label: "Submitted", icon: Clock, description: "Request received" },
  { key: "In Review", label: "In Review", icon: Search, description: "Being evaluated" },
  { key: "In Progress", label: "In Progress", icon: Wrench, description: "Work underway" },
  { key: "Resolved", label: "Resolved", icon: PartyPopper, description: "Issue resolved" },
];

interface RequestPizzaTrackerProps {
  status: string;
}

export default function RequestPizzaTracker({ status }: RequestPizzaTrackerProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-4">
      <div className="flex items-start justify-between relative">
        {/* Connector line behind the icons */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted z-0 mx-8" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary z-0 mx-8 transition-all duration-500"
          style={{ width: `calc(${(activeIndex / (STEPS.length - 1)) * 100}% - 4rem)` }}
        />

        {STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isCurrent = i === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted
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
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground text-center mt-0.5">
                {step.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
