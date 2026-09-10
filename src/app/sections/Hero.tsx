import { ArrowLeft, Lock } from "lucide-react";
import { PRAYERS, formatDayLong, pct, type PrayerId } from "@/lib/prayers";
import { useApp } from "../state";
import { CheckBoxes, StaticCheckBoxes } from "../components/CheckBoxes";

const SAMPLE: Record<PrayerId, boolean[]> = {
  fajr: [true, true, false],
  dhuhr: [true],
  asr: [true, false],
  maghrib: [false],
  isha: [true, false],
};

export function Hero() {
  const { state, derived, actions } = useApp();
  const live = state.calculated;

  const todayDone = live ? derived.todayDone : 5;
  const todayTotal = live ? derived.dailyTotal : 9;
  const todayPct = todayTotal ? Math.min(100, Math.round((todayDone / todayTotal) * 100)) : 0;
  const extra = Math.max(0, todayDone - todayTotal);
  const overall = live ? derived.overallPct : 28;

  return (
    <section id="top" className="relative overflow-hidden pt-10 pb-16 md:pt-20 md:pb-28">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-5 md:space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full border border-primary/15">
              <Lock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold text-primary">بدون حساب — بياناتك محفوظة على جهازك</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              رتّب قضاء صلواتك،
              <span className="block mt-1 text-primary">خطوة بخطوة</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-loose max-w-lg">
              احسب تقديراً لصلواتك الفائتة، أنشئ خطة قضاء تناسب وقتك، وتابع تقدمك بسهولة وخصوصية.
            </p>
            <div className="grid grid-cols-2 sm:flex gap-3 pt-1">
              <a
                href={live ? "#track" : "#calculator"}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm sm:text-base hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                {live ? "سجّل صلوات اليوم" : "ابدأ حساب صلواتي"}
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-3 sm:px-8 py-3.5 sm:py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-sm sm:text-base hover:bg-secondary transition-all"
              >
                كيف يعمل؟
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-primary px-5 md:px-6 py-4 flex items-center justify-between">
                <span className="text-primary-foreground font-semibold">قضاء اليوم</span>
                <span className="text-primary-foreground/60 text-sm">{formatDayLong(new Date())}</span>
              </div>
              <div className="p-5 md:p-6 space-y-3.5">
                {PRAYERS.map((p) => {
                  const done = derived.todayLog[p.id] ?? 0;
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-foreground w-16 sm:w-20 flex-shrink-0">{p.name}</span>
                      {live ? (
                        <CheckBoxes
                          prayerName={p.name}
                          total={Math.max(state.targets[p.id], done)}
                          done={done}
                          onToggle={(i) => actions.toggleToday(p.id, i)}
                        />
                      ) : (
                        <StaticCheckBoxes boxes={SAMPLE[p.id]} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground" aria-live="polite">
                    أنجزت اليوم {Math.min(todayDone, todayTotal)} من {todayTotal} صلوات
                    {extra > 0 && <span className="text-primary font-semibold"> (+{extra} إضافية)</span>}
                  </span>
                  <span className="font-bold text-primary">{pct(todayPct)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${todayPct}%` }} />
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs text-muted-foreground">التقدم الإجمالي</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-sand" style={{ width: `${overall}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-accent">{pct(overall)}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              {live ? "اضغط على المربعات لتسجيل ما أنجزته اليوم — يُحفظ تلقائياً" : "معاينة توضيحية — ستعرض خطتك الفعلية بعد الحساب"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
