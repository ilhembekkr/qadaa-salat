import { ArrowLeft, ChevronDown, Info, Plus, Trash2 } from "lucide-react";
import { MENSTRUATION_MAX_DAYS, estimateMissedDays, type ExcludedPeriod } from "@/lib/calc";
import { PRAYERS, arDays, arPrayers, fmt, toKey } from "@/lib/prayers";
import { allDatedExclusions, useApp, type PeriodList } from "../state";
import { SectionHeader } from "../components/SectionHeader";
import { Stepper } from "../components/Stepper";
import { DatePicker } from "../components/DatePicker";

export function Calculator() {
  const { state, derived, actions } = useApp();
  const todayKey = toKey(new Date());
  const estimate = estimateMissedDays(state.startDate, state.endDate, allDatedExclusions(state), state.menstruation);
  const cycle = state.menstruation;
  const canCalculate = Boolean(state.startDate && state.endDate) && estimate.total > 0;
  const orderProblem = state.startDate && state.endDate && estimate.total === 0;

  return (
    <section id="calculator" className="py-16 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="الحساب التقديري"
          tone="accent"
          title="ابدأ بتقدير صلواتك الفائتة"
          subtitle="التواريخ تقريبية ولا بأس بذلك — يمكنك تعديل كل عدد يدوياً بعد الحساب."
          className="mb-10 md:mb-16"
        />

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Inputs */}
          <form
            className="bg-card border border-border rounded-2xl p-5 md:p-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (canCalculate) actions.calculate();
            }}
          >
            <div>
              <label htmlFor="start-date" className="block text-sm font-semibold text-foreground mb-2">
                تاريخ البلوغ التقريبي
              </label>
              <DatePicker
                id="start-date"
                value={state.startDate}
                max={state.endDate || todayKey}
                onChange={(v) => actions.setDates(v, state.endDate)}
                placeholder="اختر تاريخاً تقريبياً"
              />
              <p className="text-xs text-muted-foreground mt-1.5">تاريخ تقريبي مقبول تماماً</p>
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-semibold text-foreground mb-2">
                تاريخ الالتزام بالصلاة
              </label>
              <DatePicker
                id="end-date"
                value={state.endDate}
                min={state.startDate || undefined}
                max={todayKey}
                onChange={(v) => actions.setDates(state.startDate, v)}
              />
              {orderProblem && (
                <p className="text-xs text-destructive mt-1.5">يجب أن يكون تاريخ الالتزام بعد تاريخ البلوغ.</p>
              )}
            </div>

            {/* Excluded periods */}
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-semibold text-foreground">فترات مستثناة (اختياري)</span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  أضف الفترات التي لا تريد احتسابها ضمن تقدير الصلوات الفائتة.
                </p>
              </div>

              {/* 1. Precisely known periods */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">فترة محددة</span>
                  <button
                    type="button"
                    onClick={() => actions.addExcluded("excluded")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/75 transition-colors"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    إضافة فترة
                  </button>
                </div>
                {state.excluded.length > 0 && (
                  <ul className="space-y-3">
                    {state.excluded.map((p, i) => (
                      <PeriodRow
                        key={p.id}
                        period={p}
                        list="excluded"
                        placeholder={`فترة ${fmt(i + 1)} — مثلاً: كنت أصلي بانتظام`}
                      />
                    ))}
                  </ul>
                )}
              </div>

              {/* 2. Menstruation & postpartum (progressive disclosure) */}
              <div className={`rounded-xl border transition-colors ${cycle.enabled ? "border-primary/30 bg-secondary/40" : "border-border bg-muted/40"}`}>
                <button
                  type="button"
                  aria-expanded={cycle.enabled}
                  aria-controls="cycle-panel"
                  onClick={() => actions.setMenstruation({ enabled: !cycle.enabled })}
                  className="w-full p-4 flex items-start gap-3 text-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      cycle.enabled ? "bg-primary border-primary" : "bg-card border-border"
                    }`}
                  >
                    {cycle.enabled && (
                      <svg width="11" height="9" viewBox="0 0 12 10">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-foreground">الحيض والنفاس</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      يمكن استبعاد هذه الأيام من مدة الحساب للحصول على تقدير أدق.
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform ${cycle.enabled ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                <div id="cycle-panel" hidden={!cycle.enabled} className="px-4 pb-4 space-y-5">
                  <div className="h-px bg-border" />

                  {/* الحيض */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-foreground">الحيض</span>
                    <label htmlFor="menses-days" className="block text-xs text-muted-foreground">
                      متوسط عدد أيام الحيض في الشهر
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="menses-days"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={MENSTRUATION_MAX_DAYS}
                        value={cycle.daysPerMonth}
                        onChange={(e) => actions.setMenstruation({ daysPerMonth: e.target.valueAsNumber })}
                        className="w-20 px-3 py-2 bg-card border border-border rounded-lg text-sm text-center font-semibold text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                      />
                      <span className="text-sm text-muted-foreground">أيام</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      يمكن إدخال عدد تقريبي إذا لم تكن المدة معروفة بدقة.
                    </p>
                  </div>

                  {/* النفاس */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">النفاس</span>
                      <button
                        type="button"
                        onClick={() => actions.addExcluded("postpartum")}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/75 transition-colors"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        {state.postpartum.length ? "إضافة فترة نفاس أخرى" : "إضافة فترة نفاس"}
                      </button>
                    </div>
                    {state.postpartum.length > 0 && (
                      <ul className="space-y-3">
                        {state.postpartum.map((p, i) => (
                          <PeriodRow key={p.id} period={p} list="postpartum" placeholder={`فترة نفاس ${fmt(i + 1)}`} />
                        ))}
                      </ul>
                    )}
                  </div>

                  {estimate.total > 0 && (
                    <p className="text-xs text-primary font-semibold tabular-nums">
                      الأيام المستبعدة تقديرياً: {arDays(estimate.excluded)}
                      {estimate.menstrual > 0 && <span className="text-muted-foreground font-normal"> — منها {arDays(estimate.menstrual)} للحيض</span>}
                    </p>
                  )}
                </div>
              </div>
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
            <div className="px-5 md:px-8 py-5 border-b border-border flex items-center justify-between">
              <span className="font-bold text-foreground">نتائج التقدير</span>
              {state.calculated && (
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">قابل للتعديل</span>
              )}
            </div>
            <div className="divide-y divide-border">
              {PRAYERS.map((p) => (
                <div key={p.id} className="px-5 md:px-8 py-4 flex items-center justify-between gap-4">
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
                          className="w-20 sm:w-24 text-center font-bold text-foreground bg-transparent border border-transparent hover:border-border focus:border-border rounded-lg py-1 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
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
                <div className="px-5 md:px-8 py-5 bg-primary/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">الإجمالي</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">{arPrayers(derived.totalMissed)}</span>
                </div>
                <div className="px-5 md:px-8 py-4 text-xs text-muted-foreground leading-relaxed flex flex-col gap-1.5">
                  <span>
                    الفترة: {arDays(estimate.total)}
                    {estimate.excluded > 0 && <> — مستثنى منها {arDays(estimate.excluded)}</>}
                    {estimate.menstrual > 0 && <> (منها {arDays(estimate.menstrual)} تقديرية للحيض)</>}
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

interface PeriodRowProps {
  period: ExcludedPeriod;
  list: PeriodList;
  placeholder: string;
}

/** One dated exclusion: label, from/to pickers, remove. Shared by custom and postpartum lists. */
function PeriodRow({ period: p, list, placeholder }: PeriodRowProps) {
  const { state, actions } = useApp();
  const todayKey = toKey(new Date());
  const isPostpartum = list === "postpartum";
  return (
    <li className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={p.label}
          placeholder={placeholder}
          aria-label={isPostpartum ? "وصف فترة النفاس" : "وصف الفترة"}
          onChange={(e) => actions.updateExcluded(p.id, { label: e.target.value }, list)}
          className="flex-1 px-3 py-2 bg-muted/60 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
        <button
          type="button"
          onClick={() => actions.removeExcluded(p.id, list)}
          aria-label={isPostpartum ? "حذف فترة النفاس" : "حذف الفترة"}
          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <span>من</span>
          <DatePicker
            size="sm"
            ariaLabel={isPostpartum ? "بداية فترة النفاس" : "بداية الفترة المستثناة"}
            value={p.from}
            min={state.startDate || undefined}
            max={p.to || state.endDate || todayKey}
            onChange={(v) => actions.updateExcluded(p.id, { from: v }, list)}
          />
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <span>إلى</span>
          <DatePicker
            size="sm"
            ariaLabel={isPostpartum ? "نهاية فترة النفاس" : "نهاية الفترة المستثناة"}
            value={p.to}
            min={p.from || state.startDate || undefined}
            max={state.endDate || todayKey}
            onChange={(v) => actions.updateExcluded(p.id, { to: v }, list)}
          />
        </div>
      </div>
    </li>
  );
}
