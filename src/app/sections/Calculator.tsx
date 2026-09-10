import { ArrowLeft, ChevronDown, Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { MENSTRUATION_MAX_DAYS, estimateMissedDays, type ExcludedPeriod } from "@/lib/calc";
import { PRAYERS, addDays, arDays, arPrayers, fmt, toKey } from "@/lib/prayers";
import { allDatedExclusions, useApp, type PeriodList } from "../state";
import { SectionHeader } from "../components/SectionHeader";
import { Stepper } from "../components/Stepper";
import { DatePicker } from "../components/DatePicker";

const THIS_YEAR = new Date().getFullYear();
const DEFAULT_AGE = 14;

interface Props {
  /** App mode: the whole form sits behind a single disclosure row. */
  collapsed?: boolean;
}

export function Calculator({ collapsed = false }: Props) {
  const { state, derived, actions } = useApp();
  const todayKey = toKey(new Date());
  const [open, setOpen] = useState(!collapsed);

  // Coarse entry for the first date: birth year + approximate age at puberty.
  const [entryMode, setEntryMode] = useState<"age" | "date">(state.startDate ? "date" : "age");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [ageAtPuberty, setAgeAtPuberty] = useState<number>(DEFAULT_AGE);
  const applyAge = (year: number | "", age: number) => {
    setBirthYear(year);
    setAgeAtPuberty(age);
    if (typeof year === "number" && year >= 1900 && year <= THIS_YEAR && age >= 8 && age <= 25) {
      actions.setDates(`${year + age}-01-01`, state.endDate);
    }
  };
  const startPickerView = toKey(addDays(new Date(), -15 * 365));
  const estimate = estimateMissedDays(state.startDate, state.endDate, allDatedExclusions(state), state.menstruation);
  const cycle = state.menstruation;
  const canCalculate = Boolean(state.startDate && state.endDate) && estimate.total > 0;
  const orderProblem = state.startDate && state.endDate && estimate.total === 0;

  return (
    <section id="calculator" className="py-10 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="calculator-body"
            className="w-full bg-card border border-border rounded-2xl px-4 md:px-6 py-4 flex items-center justify-between gap-4 text-start hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span>
              <span className="block font-bold text-foreground">إعادة تقدير الصلوات الفائتة</span>
              <span className="block text-[13px] text-muted-foreground mt-0.5 tabular-nums">
                التقدير الحالي: {arPrayers(derived.totalMissed)} · قابل للتعديل
              </span>
            </span>
            <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        ) : (
          <SectionHeader
            eyebrow="الحساب التقديري"
            tone="accent"
            title="ابدأ بتقدير صلواتك الفائتة"
            subtitle="التواريخ تقريبية ولا بأس بذلك — يمكنك تعديل كل عدد يدوياً بعد الحساب."
            className="mb-6 md:mb-16"
          />
        )}

        <div id="calculator-body" hidden={!open} className={`grid lg:grid-cols-2 gap-6 lg:gap-10 items-start ${collapsed ? "mt-4" : ""}`}>
          {/* Inputs */}
          <form
            className="bg-card border border-border rounded-2xl p-5 md:p-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (canCalculate) actions.calculate();
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={entryMode === "age" ? "birth-year" : "start-date"} className="block text-sm font-semibold text-foreground">
                  تاريخ البلوغ التقريبي
                </label>
                <button
                  type="button"
                  onClick={() => setEntryMode((m) => (m === "age" ? "date" : "age"))}
                  className="text-[13px] font-semibold text-primary hover:text-primary/75 transition-colors"
                >
                  {entryMode === "age" ? "أو اختر تاريخاً محدداً" : "أو أدخل سنة الميلاد"}
                </button>
              </div>
              {entryMode === "age" ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[13px] text-muted-foreground space-y-1">
                    <span>سنة الميلاد</span>
                    <input
                      id="birth-year"
                      type="number"
                      inputMode="numeric"
                      min={1900}
                      max={THIS_YEAR}
                      placeholder={String(THIS_YEAR - 30)}
                      value={birthYear}
                      onChange={(e) => applyAge(Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : "", ageAtPuberty)}
                      className="w-full px-3 py-3 bg-muted border border-border rounded-xl text-base text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </label>
                  <label className="text-[13px] text-muted-foreground space-y-1">
                    <span>سن البلوغ التقريبي</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={8}
                      max={25}
                      value={ageAtPuberty}
                      onChange={(e) => applyAge(birthYear, Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : DEFAULT_AGE)}
                      className="w-full px-3 py-3 bg-muted border border-border rounded-xl text-base text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </label>
                </div>
              ) : (
                <DatePicker
                  id="start-date"
                  value={state.startDate}
                  max={state.endDate || todayKey}
                  initialView={startPickerView}
                  onChange={(v) => actions.setDates(v, state.endDate)}
                  placeholder="اختر تاريخاً تقريبياً"
                />
              )}
              <p className="text-[13px] text-muted-foreground mt-1.5">
                {entryMode === "age"
                  ? state.startDate
                    ? `سيُحسب من بداية سنة ${state.startDate.slice(0, 4)} — غالباً بين 12 و15 سنة، ويكفي تقدير تقريبي.`
                    : "غالباً بين 12 و15 سنة، ويكفي تقدير تقريبي."
                  : "تاريخ تقريبي مقبول تماماً"}
              </p>
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
                <p className="text-[13px] text-destructive mt-1.5">يجب أن يكون تاريخ الالتزام بعد تاريخ البلوغ.</p>
              )}
            </div>

            {/* Excluded periods */}
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-semibold text-foreground">فترات مستثناة (اختياري)</span>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
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
                    <span className="block text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
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
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
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
                    <p className="text-[13px] text-primary font-semibold tabular-nums">
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
              className="w-full h-13 md:h-14 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {state.calculated ? "إعادة الحساب" : "احسب الصلوات الفائتة"}
            </button>
            {state.calculated && (
              <p className="text-[13px] text-muted-foreground text-center">
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
                  <span className="text-base md:text-lg font-semibold text-foreground tabular-nums">{arPrayers(derived.totalMissed)}</span>
                </div>
                <div className="px-5 md:px-8 py-4 text-[13px] text-muted-foreground leading-relaxed flex flex-col gap-1.5">
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
