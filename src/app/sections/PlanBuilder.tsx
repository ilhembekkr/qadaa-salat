import { PRAYERS, addDays, arPrayers, durationFromDays, fillCounts, formatMonthYear } from "@/lib/prayers";
import { MAX_TARGET } from "@/lib/storage";
import { daysNeededFor, useApp } from "../state";
import { SectionHeader } from "../components/SectionHeader";
import { Stepper } from "../components/Stepper";

export function PlanBuilder() {
  const { state, derived, actions } = useApp();
  const live = derived.daysNeeded !== null;
  const days = live ? derived.daysNeeded! : daysNeededFor(fillCounts(1460), state.targets);
  const finished = live && days === 0;

  return (
    <section id="plan" className="py-24 bg-secondary/40 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="بناء الخطة"
          title="ابنِ خطة تناسب قدرتك"
          subtitle="اختر هدفاً يومياً مختلفاً لكل صلاة — الخطة تتكيف معك وليس العكس."
          className="mb-16"
        />

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-border">
              <span className="font-bold text-foreground">الهدف اليومي لكل صلاة</span>
            </div>
            <div className="divide-y divide-border">
              {PRAYERS.map((p) => (
                <div key={p.id} className="px-8 py-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-foreground text-lg">{p.name}</span>
                    {live && (
                      <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                        متبقٍ {arPrayers(derived.remainingByPrayer[p.id])}
                      </div>
                    )}
                  </div>
                  <Stepper
                    size="lg"
                    label={`هدف ${p.name} اليومي`}
                    onDecrement={() => actions.adjustTarget(p.id, -1)}
                    onIncrement={() => actions.adjustTarget(p.id, 1)}
                    disableDecrement={state.targets[p.id] <= 1}
                    disableIncrement={state.targets[p.id] >= MAX_TARGET}
                    value={
                      <span className="text-2xl font-bold text-foreground w-8 text-center tabular-nums" aria-live="polite">
                        {state.targets[p.id]}
                      </span>
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-primary rounded-2xl p-8 text-primary-foreground space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl">خطتك الحالية</h3>
              {!live && (
                <span className="text-[11px] font-semibold bg-primary-foreground/15 px-2.5 py-1 rounded-full">أرقام توضيحية</span>
              )}
            </div>
            <div>
              <div className="text-5xl font-bold tabular-nums">{derived.dailyTotal}</div>
              <div className="text-primary-foreground/65 text-sm mt-1">صلاة قضاء يومياً</div>
            </div>
            <div className="text-primary-foreground/65 text-sm tabular-nums">{arPrayers(derived.dailyTotal * 7)} أسبوعياً</div>
            <div className="h-px bg-primary-foreground/15" />
            {finished ? (
              <p className="text-lg font-semibold leading-relaxed">أكملت خطتك بإذن الله. يمكنك تعديل الأعداد إن كان هناك ما تبقّى.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-xs tracking-wide text-primary-foreground/50 mb-1.5">المدة التقديرية لإكمال الخطة</div>
                  <div className="text-2xl font-bold">{durationFromDays(days)}</div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-primary-foreground/50 mb-1.5">التاريخ المتوقع للانتهاء</div>
                  <div className="text-xl font-semibold">{formatMonthYear(addDays(new Date(), days))}</div>
                </div>
              </div>
            )}
            <div className="h-px bg-primary-foreground/15" />
            <p className="text-primary-foreground/60 text-xs leading-relaxed">
              {live
                ? "يمكنك تعديل هدفك اليومي في أي وقت دون أن يؤثر ذلك على تقدمك السابق."
                : "احسب صلواتك في القسم السابق لتُبنى هذه الخطة على أعدادك الفعلية."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
