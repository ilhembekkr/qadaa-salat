import { ArrowLeft, Info, Plus, Trash2 } from "lucide-react";
import { estimateMissedDays } from "@/lib/calc";
import { PRAYERS, arDays, arPrayers, fmt, toKey } from "@/lib/prayers";
import { useApp } from "../state";
import { SectionHeader } from "../components/SectionHeader";
import { Stepper } from "../components/Stepper";

const inputCls =
  "w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all";

export function Calculator() {
  const { state, derived, actions } = useApp();
  const todayKey = toKey(new Date());
  const estimate = estimateMissedDays(state.startDate, state.endDate, state.excluded);
  const canCalculate = Boolean(state.startDate && state.endDate) && estimate.total > 0;
  const orderProblem = state.startDate && state.endDate && estimate.total === 0;

  return (
    <section id="calculator" className="py-24 bg-background scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="الحساب التقديري"
          tone="accent"
          title="ابدأ بتقدير صلواتك الفائتة"
          subtitle="التواريخ تقريبية ولا بأس بذلك — يمكنك تعديل كل عدد يدوياً بعد الحساب."
          className="mb-16"
        />

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Inputs */}
          <form
            className="bg-card border border-border rounded-2xl p-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (canCalculate) actions.calculate();
            }}
          >
            <div>
              <label htmlFor="start-date" className="block text-sm font-semibold text-foreground mb-2">
                تاريخ البلوغ التقريبي
              </label>
              <input
                id="start-date"
                type="date"
                max={todayKey}
                value={state.startDate}
                onChange={(e) => actions.setDates(e.target.value, state.endDate)}
                className={inputCls}
              />
              <p className="text-xs text-muted-foreground mt-1.5">تاريخ تقريبي مقبول تماماً</p>
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-semibold text-foreground mb-2">
                تاريخ الالتزام بالصلاة
              </label>
              <input
                id="end-date"
                type="date"
                max={todayKey}
                value={state.endDate}
                onChange={(e) => actions.setDates(state.startDate, e.target.value)}
                className={inputCls}
              />
              {orderProblem && (
                <p className="text-xs text-destructive mt-1.5">يجب أن يكون تاريخ الالتزام بعد تاريخ البلوغ.</p>
              )}
            </div>

            {/* Excluded periods */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">فترات مستثناة (اختياري)</span>
                <button
                  type="button"
                  onClick={actions.addExcluded}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/75 transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  إضافة فترة
                </button>
              </div>
              {state.excluded.length === 0 ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  أضف فترات كنت تصلي فيها أو فترات عذر كالحيض والنفاس، وسيتم استثناؤها من الحساب.
                </p>
              ) : (
                <ul className="space-y-3">
                  {state.excluded.map((p, i) => (
                    <li key={p.id} className="bg-muted/60 border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={p.label}
                          placeholder={`فترة ${fmt(i + 1)} — مثلاً: كنت أصلي بانتظام`}
                          aria-label="وصف الفترة"
                          onChange={(e) => actions.updateExcluded(p.id, { label: e.target.value })}
                          className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                        />
                        <button
                          type="button"
                          onClick={() => actions.removeExcluded(p.id)}
                          aria-label="حذف الفترة"
                          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs text-muted-foreground space-y-1">
                          <span>من</span>
                          <input
                            type="date"
                            value={p.from}
                            min={state.startDate || undefined}
                            max={state.endDate || todayKey}
                            onChange={(e) => actions.updateExcluded(p.id, { from: e.target.value })}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                          />
                        </label>
                        <label className="text-xs text-muted-foreground space-y-1">
                          <span>إلى</span>
                          <input
                            type="date"
                            value={p.to}
                            min={p.from || state.startDate || undefined}
                            max={state.endDate || todayKey}
                            onChange={(e) => actions.updateExcluded(p.id, { to: e.target.value })}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                          />
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-secondary/70 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                يُحسب كل يوم في الفترة كخمس صلوات فائتة. بعد الحساب يمكنك تعديل عدد كل صلاة على حدة.
              </p>
            </div>

            <button
              type="submit"
              disabled={!canCalculate}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {state.calculated ? "إعادة الحساب" : "احسب الصلوات الفائتة"}
            </button>
            {state.calculated && (
              <p className="text-xs text-muted-foreground text-center">
                إعادة الحساب تستبدل الأعداد الحالية، ولا تؤثر على ما سجّلته من صلوات القضاء.
              </p>
            )}
          </form>

          {/* Results */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-border flex items-center justify-between">
              <span className="font-bold text-foreground">نتائج التقدير</span>
              {state.calculated && (
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">قابل للتعديل</span>
              )}
            </div>
            <div className="divide-y divide-border">
              {PRAYERS.map((p) => (
                <div key={p.id} className="px-8 py-4 flex items-center justify-between gap-4">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  {state.calculated ? (
                    <Stepper
                      label={`عدد ${p.name}`}
                      onDecrement={() => actions.adjustCount(p.id, -1)}
                      onIncrement={() => actions.adjustCount(p.id, 1)}
                      disableDecrement={state.counts[p.id] === 0}
                      value={
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          aria-label={`عدد صلوات ${p.name} الفائتة`}
                          value={state.counts[p.id]}
                          onChange={(e) => actions.setCount(p.id, e.target.valueAsNumber)}
                          className="w-24 text-center font-bold text-foreground bg-transparent border border-transparent hover:border-border focus:border-border rounded-lg py-1 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                        />
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground/60 text-sm">— أدخل التواريخ أولاً</span>
                  )}
                </div>
              ))}
            </div>
            {state.calculated && (
              <div className="border-t border-border">
                <div className="px-8 py-5 bg-primary/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">الإجمالي</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">{arPrayers(derived.totalMissed)}</span>
                </div>
                <div className="px-8 py-4 text-xs text-muted-foreground leading-relaxed flex flex-col gap-1.5">
                  <span>
                    الفترة: {arDays(estimate.total)}
                    {estimate.excluded > 0 && <> — مستثنى منها {arDays(estimate.excluded)}</>}
                  </span>
                  <a href="#plan" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary/75 transition-colors">
                    التالي: ابنِ خطتك
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
