import { addDays, arPrayers, fmt, formatWeekdayShort, fromKey, sumCounts, toKey } from "@/lib/prayers";
import { useApp } from "../state";

/** Seven factual day dots (last 6 days + today) — show recorded activity, independent of today’s targets. No streaks. */
export function WeekGlance({ className = "" }: { className?: string }) {
  const { state, derived } = useApp();
  const today = fromKey(derived.today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    const key = toKey(d);
    const done = sumCounts(state.log[key] ?? {});
    return { key, d, done, isToday: key === derived.today };
  });
  return (
    <div className={`flex items-center justify-between gap-1 ${className}`} aria-label="هذا الأسبوع">
      {days.map(({ key, d, done, isToday }) => (
        <div key={key} className="flex flex-col items-center gap-1.5 flex-1" title={`${formatWeekdayShort(d)}: ${arPrayers(done)} مسجّلة`}>
          <span
            className={`w-3 h-3 rounded-full border-2 ${
              done > 0
                ? "bg-primary border-primary"
                : "bg-transparent border-border"
            } ${isToday ? "ring-2 ring-primary/25 ring-offset-1 ring-offset-card" : ""}`}
            aria-hidden="true"
          />
          <span className={`text-[11px] leading-none ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            {formatWeekdayShort(d)}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums" aria-label={`${arPrayers(done)} مسجّلة`}>{fmt(done)}</span>
        </div>
      ))}
    </div>
  );
}
