import { forecastFor } from "@/lib/progress";
import { PRAYERS, addDays, arPrayers, durationFromDays, fillCounts, formatMonthYear } from "@/lib/prayers";
import { MAX_TARGET } from "@/lib/storage";
import { useApp } from "../state";
import { SectionHeader } from "../components/SectionHeader";
import { Stepper } from "../components/Stepper";

export function PlanBuilder() {
  const { state, derived, actions } = useApp();
  const live = state.calculated;
  const forecast = live ? derived.forecast : forecastFor(fillCounts(1460), state.targets);
  const days = forecast.days;
  const finished = live && forecast.status === "complete";
  const incomplete = forecast.status === "incomplete";
  const endLabel = days === null ? "المدة غير محددة" : formatMonthYear(addDays(new Date(), days));

  return (
    <section id="plan" className="py-10 md:py-24 bg-secondary/40 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="بناء الخطة"
          title={live ? "أهدافك اليومية" : "ابنِ خطة تناسب قدرتك"}
          subtitle={live ? "عدّل الهدف في أي وقت؛ لا يؤثر ذلك على ما سجّلته." : "اختر هدفاً يومياً مختلفاً لكل صلاة — الخطة تتكيف معك وليس العكس."}
          className="mb-6 md:mb-16"
        />

        {/* Phone summary: two cells above the steppers */}
        <div className="lg:hidden grid grid-cols-2 gap-3 mb-4">
          <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3.5">
            <div className="text-xs text-primary-foreground/70">هدف اليوم</div>
            <div className="text-2xl font-bold tabular-nums leading-tight">{derived.todayRequired}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl px-4 py-3.5">
            <div className="text-xs text-muted-foreground">{finished ? "الخطة" : "الانتهاء المتوقع"}</div>
            <div className="text-lg font-bold text-foreground leading-tight">{finished ? "مكتملة" : endLabel}</div>
            <div className="text-xs text-muted-foreground">{finished ? "بإذن الله" : incomplete ? "حدّد هدفاً لكل صلاة متبقية" : live ? durationFromDays(days!) : "أرقام توضيحية"}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 lg:gap-8 items-start">
          <div className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="hidden lg:block px-8 py-5 border-b border-border">
              <span className="font-bold text-foreground">الهدف اليومي لكل صلاة</span>
            </div>
            <div className="divide-y divide-border">
              {PRAYERS.map((p) => (
                <div key={p.id} className="px-4 md:px-8 py-3 md:py-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-foreground text-base md:text-lg">{p.name}</span>
                    {live && (
                      <div className="text-[13px] md:text-xs text-muted-foreground mt-0.5 tabular-nums">
                        {derived.remainingByPrayer[p.id] === 0 ? "مكتملة" : <>متبقٍ {arPrayers(derived.remainingByPrayer[p.id])}</>}
                        {derived.remainingByPrayer[p.id] > 0 && (
                          <span className="block mt-1">
                            {forecast.daysByPrayer[p.id] === null
                              ? "لم يُحدَّد هدف يومي"
                              : <>المدة التقديرية: {durationFromDays(forecast.daysByPrayer[p.id]!)}</>}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Stepper
                    size="lg"
                    label={`هدف ${p.name} اليومي`}
                    onDecrement={() => actions.adjustTarget(p.id, -1)}
                    onIncrement={() => actions.adjustTarget(p.id, 1)}
                    disableDecrement={state.targets[p.id] <= 0}
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

          {/* Desktop summary card */}
          <div className="hidden lg:block lg:col-span-2 bg-primary rounded-2xl p-8 text-primary-foreground space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl">خطتك الحالية</h3>
              {!live && (
                <span className="text-[11px] font-semibold bg-primary-foreground/15 px-2.5 py-1 rounded-full">أرقام توضيحية</span>
              )}
            </div>
            <div>
              <div className="text-5xl font-bold tabular-nums">{derived.todayRequired}</div>
              <div className="text-primary-foreground/65 text-sm mt-1">صلاة قضاء ضمن هدف اليوم</div>
            </div>
            <div className="h-px bg-primary-foreground/15" />
            {finished ? (
              <p className="text-lg font-semibold leading-relaxed">أكملت خطتك بإذن الله. يمكنك تعديل الأعداد إن كان هناك ما تبقّى.</p>
            ) : incomplete ? (
              <p className="text-sm leading-relaxed">حدّد هدفاً يومياً لكل صلاة متبقية لحساب المدة.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-xs tracking-wide text-primary-foreground/50 mb-1.5">المدة التقديرية لإكمال الخطة</div>
                  <div className="text-2xl font-bold">{durationFromDays(days!)}</div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-primary-foreground/50 mb-1.5">التاريخ المتوقع للانتهاء</div>
                  <div className="text-xl font-semibold">{endLabel}</div>
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
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-4 max-w-3xl">
          نحسب مدة كل صلاة بحسب المتبقي منها وهدفها اليومي، مع التقريب إلى يوم كامل. مدة الخطة هي أطول هذه المدد، بافتراض تحقيق الأهداف يومياً.
          {" "}يمكنك جعل الهدف صفراً؛ لن تُحسب مدة الخطة ما دامت صلاة متبقية دون هدف. أهداف الصلوات المكتملة لا تُنقل إلى غيرها.
        </p>
      </div>
    </section>
  );
}
