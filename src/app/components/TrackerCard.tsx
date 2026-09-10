import { PRAYERS, formatDayLong, pct, type PrayerId } from "@/lib/prayers";
import { useApp } from "../state";
import { CheckBoxes, StaticCheckBoxes } from "./CheckBoxes";

const SAMPLE: Record<PrayerId, boolean[]> = {
  fajr: [true, true, false],
  dhuhr: [true],
  asr: [true, false],
  maghrib: [false],
  isha: [true, false],
};

interface Props {
  /** "live" is the single write surface for today's log; "sample" is a read-only preview. */
  variant: "live" | "sample";
  id?: string;
  className?: string;
}

export function TrackerCard({ variant, id, className = "" }: Props) {
  const { state, derived, actions } = useApp();
  const live = variant === "live";

  const todayDone = live ? derived.todayCredited : 5;
  const todayTotal = live ? derived.todayRequired : 9;
  const todayPct = live ? derived.todayPct : 56;
  const extra = live ? derived.todayExtra : 0;
  const overall = live ? (state.calculated ? derived.overallPct : null) : 28;

  return (
    <div id={id} className={`bg-card rounded-3xl md:rounded-2xl shadow-xl border border-border overflow-hidden scroll-mt-20 ${className}`}>
      <div className="bg-primary px-5 md:px-6 py-3.5 md:py-4 flex items-center justify-between">
        <span className="text-primary-foreground font-semibold">قضاء اليوم</span>
        <span className="text-primary-foreground/70 text-sm">{formatDayLong(new Date())}</span>
      </div>

      <div className="divide-y divide-border">
        {PRAYERS.map((p) => {
          const done = derived.todayLog[p.id] ?? 0;
          return (
            <div key={p.id} className="px-5 md:px-6 py-3 md:py-3.5 flex items-center justify-between gap-4">
              <span className="font-semibold text-foreground w-16 sm:w-20 flex-shrink-0">
                {p.name}
                {live && state.calculated && derived.remainingByPrayer[p.id] === 0 && (
                  <span className="block text-xs font-normal text-muted-foreground mt-1">مكتملة</span>
                )}
                {live && derived.todayRequiredByPrayer[p.id] === 0 && (!state.calculated || derived.remainingByPrayer[p.id] > 0) && (
                  <span className="block text-xs font-normal text-muted-foreground mt-1">دون هدف اليوم</span>
                )}
              </span>
              {live ? (
                <CheckBoxes prayerName={p.name} target={derived.todayRequiredByPrayer[p.id]} done={done} onToggle={(i) => actions.toggleToday(p.id, i)} />
              ) : (
                <StaticCheckBoxes boxes={SAMPLE[p.id]} />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 md:px-6 py-4 bg-muted/30 space-y-3">
        <div className="flex justify-between items-baseline text-sm">
          <span className="text-muted-foreground" aria-live="polite">
            {todayTotal > 0
              ? <>أنجزت من هدف اليوم: {todayDone} من {todayTotal}</>
              : derived.forecast.status === "complete" ? "الخطة مكتملة" : "لا توجد أهداف لليوم"}
            {extra > 0 && <span className="text-accent font-semibold"> (+{extra} إضافية)</span>}
          </span>
          <span className="font-bold text-primary tabular-nums">{todayTotal > 0 ? pct(todayPct) : "—"}</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${todayPct}%` }} />
        </div>
        {live && derived.todayComplete && (
          <p className="text-sm text-primary">أتممت هدف اليوم، تقبّل الله منك.</p>
        )}
        {overall !== null && (
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs text-muted-foreground">التقدم الإجمالي</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-sand transition-all duration-500" style={{ width: `${overall}%` }} />
              </div>
              <span className="text-xs font-semibold text-accent tabular-nums">{pct(overall)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
