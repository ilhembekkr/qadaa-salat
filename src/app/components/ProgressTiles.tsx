import { fmt, pct } from "@/lib/prayers";
import { useApp } from "../state";

/** Overall progress: done → percent → remaining (the eye lands on what has been done). */
export function ProgressTiles({ className = "" }: { className?: string }) {
  const { state, derived } = useApp();
  const live = state.calculated;
  return (
    <div className={`grid grid-cols-3 gap-3 md:gap-4 ${className}`}>
      <div className="bg-card border border-border rounded-2xl p-3.5 md:p-5 text-center">
        <div className="text-xl md:text-2xl font-bold text-primary tabular-nums">{fmt(derived.totalDone)}</div>
        <div className="text-xs text-muted-foreground mt-1">تم قضاؤها</div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-3.5 md:p-5 text-center">
        <div className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{live ? pct(derived.overallPct) : "—"}</div>
        <div className="text-xs text-muted-foreground mt-1">مكتمل</div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-3.5 md:p-5 text-center">
        <div className="text-base md:text-lg font-semibold text-foreground tabular-nums pt-0.5">{live ? fmt(derived.totalRemaining) : "—"}</div>
        <div className="text-xs text-muted-foreground mt-1">متبقية</div>
      </div>
    </div>
  );
}
