import { Plus } from "lucide-react";
import { useState } from "react";
import { PRAYERS, fmt, formatDayLong, pct } from "@/lib/prayers";
import { useApp } from "../state";
import { CheckBoxes } from "../components/CheckBoxes";
import { Pill } from "../components/SectionHeader";

export function DailyTracking() {
  const { state, derived, actions } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const live = state.calculated;
  const todayPct = derived.dailyTotal ? Math.min(100, Math.round((derived.todayDone / derived.dailyTotal) * 100)) : 0;
  const extra = Math.max(0, derived.todayDone - derived.dailyTotal);

  return (
    <section id="track" className="py-16 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-5 md:space-y-7 order-2 lg:order-1">
            <Pill tone="accent">المتابعة اليومية</Pill>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">قضاء اليوم</h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-loose">
              سجّل ما أنجزته بنقرة واحدة لكل صلاة. التقدم يُحفظ تلقائياً على جهازك.
            </p>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 md:p-5 text-center">
                <div className="text-2xl font-bold text-foreground tabular-nums">{live ? pct(derived.overallPct) : "—"}</div>
                <div className="text-xs text-muted-foreground mt-1">مكتمل</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 md:p-5 text-center">
                <div className="text-xl font-bold text-foreground tabular-nums">{fmt(derived.totalDone)}</div>
                <div className="text-xs text-muted-foreground mt-1">تم قضاؤها</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 md:p-5 text-center">
                <div className="text-xl font-bold text-foreground tabular-nums">{live ? fmt(derived.totalRemaining) : "—"}</div>
                <div className="text-xs text-muted-foreground mt-1">متبقية</div>
              </div>
            </div>
            {!live && (
              <p className="text-sm text-muted-foreground">
                يمكنك البدء بالتسجيل الآن، وستظهر نسبة الإكمال والمتبقي بعد{" "}
                <a href="#calculator" className="text-primary font-semibold hover:underline">حساب صلواتك</a>.
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl order-1 lg:order-2">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <span className="font-bold text-foreground">قضاء اليوم</span>
              <span className="text-sm text-muted-foreground">{formatDayLong(new Date())}</span>
            </div>
            <div className="divide-y divide-border">
              {PRAYERS.map((p) => {
                const done = derived.todayLog[p.id] ?? 0;
                const total = Math.max(state.targets[p.id], done);
                return (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <span className="font-semibold text-foreground w-16 sm:w-20 flex-shrink-0">{p.name}</span>
                    <CheckBoxes prayerName={p.name} total={total} done={done} onToggle={(i) => actions.toggleToday(p.id, i)} />
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-5 bg-muted/30 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground" aria-live="polite">
                  أنجزت اليوم {Math.min(derived.todayDone, derived.dailyTotal)} من {derived.dailyTotal} صلوات القضاء
                  {extra > 0 && <span className="text-primary font-semibold"> (+{extra} إضافية)</span>}
                </span>
                <span className="font-bold text-primary">{pct(todayPct)}</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${todayPct}%` }} />
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-sand transition-all duration-500" style={{ width: `${live ? derived.overallPct : 0}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{live ? pct(derived.overallPct) : "—"} إجمالي</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdd((v) => !v)}
                  aria-expanded={showAdd}
                  className="text-xs font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  إضافة صلاة قضاء
                </button>
              </div>
              {showAdd && (
                <div className="pt-1 flex flex-wrap items-center gap-2" role="group" aria-label="اختر الصلاة لإضافتها">
                  <span className="text-xs text-muted-foreground ml-1">صلاة إضافية خارج الهدف:</span>
                  {PRAYERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => actions.addExtra(p.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
