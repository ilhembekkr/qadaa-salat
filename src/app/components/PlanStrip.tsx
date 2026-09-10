import { ChevronLeft } from "lucide-react";
import { addDays, arPrayers, formatMonthYear } from "@/lib/prayers";
import { useApp } from "../state";

/** One-line plan summary with a link to edit targets. */
export function PlanStrip({ className = "" }: { className?: string }) {
  const { derived } = useApp();
  const days = derived.forecast.days;
  return (
    <a
      href="#plan"
      className={`bg-secondary/70 hover:bg-secondary border border-primary/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm transition-colors ${className}`}
    >
      <span className="text-foreground tabular-nums truncate">
        <span className="font-semibold">{arPrayers(derived.todayRequired)} ضمن هدف اليوم</span>
        {days !== null && days > 0 && (
          <span className="text-muted-foreground"> · الانتهاء المتوقع {formatMonthYear(addDays(new Date(), days))}</span>
        )}
        {derived.forecast.status === "incomplete" && <span className="text-muted-foreground"> · المدة غير محددة</span>}
        {days === 0 && <span className="text-muted-foreground"> · الخطة مكتملة</span>}
      </span>
      <span className="inline-flex items-center gap-1 text-primary font-semibold flex-shrink-0">
        تعديل
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </span>
    </a>
  );
}
