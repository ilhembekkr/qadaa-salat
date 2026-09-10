import { addDays, formatWeekdayShort, fromKey, sumCounts, toKey } from "@/lib/prayers";
import { useApp } from "../state";

/** Seven factual day dots (last 6 days + today) — filled by how much of the target was logged. No streaks. */
export function WeekGlance({ className = "" }: { className?: string }) {
  const { state, derived } = useApp();
  const today = fromKey(derived.today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    const key = toKey(d);
    const done = sumCounts(state.log[key] ?? {});
    const ratio = derived.dailyTotal ? Math.min(1, done / derived.dailyTotal) : 0;
    return { key, d, done, ratio, isToday: key === derived.today };
  });
  return (
    <div className={`flex items-center justify-between gap-1 ${className}`} aria-label="هذا الأسبوع">
      {days.map(({ key, d, done, ratio, isToday }) => (
        <div key={key} className="flex flex-col items-center gap-1.5 flex-1" title={`${formatWeekdayShort(d)}: ${done}`}>
          <span
            className={`w-3 h-3 rounded-full border-2 ${
              ratio >= 1
                ? "bg-primary border-primary"
                : ratio > 0
                  ? "bg-primary/35 border-primary/60"
                  : "bg-transparent border-border"
            } ${isToday ? "ring-2 ring-primary/25 ring-offset-1 ring-offset-card" : ""}`}
            aria-hidden="true"
          />
          <span className={`text-[11px] leading-none ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            {formatWeekdayShort(d)}
          </span>
        </div>
      ))}
    </div>
  );
}
