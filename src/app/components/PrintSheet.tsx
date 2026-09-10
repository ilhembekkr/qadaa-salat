import { printSchedule } from "@/lib/progress";
import { PRAYERS, addDays, arPrayers, formatDayLong, formatDayMonthShort, formatWeekdayShort, toKey } from "@/lib/prayers";
import { PRINT_DAYS, PRINT_LABELS } from "@/lib/storage";
import { useApp } from "../state";

const MAX_BOXES = 8;

/** Rendered only when printing (see styles/print.css). */
export function PrintSheet() {
  const { state, derived } = useApp();
  const today = new Date();
  const days = PRINT_DAYS[state.printPeriod];
  const schedule = printSchedule(state, toKey(today), days);

  return (
    <div className="print-only" dir="rtl" aria-hidden="true">
      <header className="print-header">
        <div>
          <h1>خطة القضاء — {PRINT_LABELS[state.printPeriod]}</h1>
          <p>
            ابتداءً من {formatDayLong(today)} · الأعمال المتبقية من وقت الطباعة
            {state.calculated && <> · المتبقي {arPrayers(derived.totalRemaining)}</>}
          </p>
        </div>
        <p className="print-targets">
          الأهداف اليومية: {" "}
          {PRAYERS.map((p) => `${p.name} ${state.calculated && derived.remainingByPrayer[p.id] === 0 ? 0 : state.targets[p.id]}`).join(" · ")}
        </p>
      </header>

      <table className="print-table">
        <thead>
          <tr>
            <th className="day-col">اليوم</th>
            {PRAYERS.map((p) => (
              <th key={p.id}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: days }).map((_, d) => {
            const date = addDays(today, d);
            return (
              <tr key={d}>
                <td className="day-col">
                  <span className="wd">{formatWeekdayShort(date)}</span> {formatDayMonthShort(date)}
                </td>
                {PRAYERS.map((p) => {
                  const n = schedule[d][p.id];
                  return (
                    <td key={p.id}>
                      <div className="boxes">
                        {n === 0 && <span>—</span>}
                        {Array.from({ length: Math.min(n, MAX_BOXES) }).map((_, i) => (
                          <span key={i} className="box" />
                        ))}
                        {n > MAX_BOXES && <span className="more">+{n - MAX_BOXES}</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <footer className="print-footer">خطوات صغيرة، واستمرار بإذن الله.</footer>
    </div>
  );
}
