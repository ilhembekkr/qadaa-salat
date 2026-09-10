import { printSchedule } from "@/lib/progress";
import { Printer } from "lucide-react";
import { PRAYERS, addDays, arDays, formatDayMonthShort, formatWeekdayShort, toKey } from "@/lib/prayers";
import { PRINT_DAYS, PRINT_LABELS, type PrintPeriod } from "@/lib/storage";
import { useApp } from "../state";
import { Pill } from "../components/SectionHeader";

const PERIODS: PrintPeriod[] = ["week", "month", "quarter"];

export function PrintablePlanner() {
  const { state, actions } = useApp();
  const today = new Date();
  const schedule = printSchedule(state, toKey(today), 6);

  return (
    <section id="print" className="py-10 md:py-24 bg-secondary/40 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 hidden lg:block">
            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden max-w-sm mx-auto" aria-hidden="true">
              <div className="bg-primary px-6 py-3.5">
                <div className="text-primary-foreground font-bold text-sm">خطة القضاء — {PRINT_LABELS[state.printPeriod]}</div>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="text-right py-2 px-2 font-semibold text-foreground/50 border-b border-border">اليوم</th>
                      {PRAYERS.map((p) => (
                        <th key={p.id} className="py-2 px-1 font-semibold text-foreground/50 border-b border-border text-center">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, d) => {
                      const date = addDays(today, d);
                      return (
                        <tr key={d} className="border-b border-border/40">
                          <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                            {formatWeekdayShort(date)} {formatDayMonthShort(date)}
                          </td>
                          {PRAYERS.map((p) => (
                            <td key={p.id} className="py-2 px-1 text-center">
                              <div className="flex justify-center gap-0.5">
                                {schedule[d][p.id] === 0 && <span>—</span>}
                                {Array.from({ length: Math.min(schedule[d][p.id], 3) }).map((_, i) => (
                                  <div key={i} className="w-3.5 h-3.5 border border-border/70 rounded-sm" />
                                ))}
                                {schedule[d][p.id] > 3 && <span>+{schedule[d][p.id] - 3}</span>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={6} className="py-2 text-center text-muted-foreground/50 text-[10px]">
                        … {arDays(PRINT_DAYS[state.printPeriod])}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-4 text-center text-[10px] text-muted-foreground/60 border-t border-border pt-3">
                خطوات صغيرة، واستمرار بإذن الله.
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-7">
            <Pill>المتابعة الورقية</Pill>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">تفضل المتابعة على الورق؟</h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-loose">
              اطبع الأعمال المتبقية من الآن وفق أهدافك اليومية. تُخصم صلوات اليوم المسجّلة، وتتوقف الخانات عند اكتمال العدد المقدّر لكل صلاة. للأهداف الكبيرة، يظهر العدد الإضافي بجانب المربعات.
            </p>
            <div className="flex gap-3" role="radiogroup" aria-label="مدة الخطة المطبوعة">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={state.printPeriod === p}
                  onClick={() => actions.setPrintPeriod(p)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                    state.printPeriod === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {PRINT_LABELS[p]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              <Printer className="w-5 h-5" aria-hidden="true" />
              حفظ الخطة PDF
            </button>
            <p className="text-sm text-muted-foreground">
              تُفتح نافذة الطباعة؛ اختر «حفظ بصيغة PDF» أو اطبع مباشرة على ورق A4.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
