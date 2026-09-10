import { fromKey } from "./prayers";

export interface ExcludedPeriod {
  id: string;
  label: string;
  from: string;
  to: string;
}

const DAY_MS = 86_400_000;

const dayDiff = (a: number, b: number) => Math.round((b - a) / DAY_MS);

export function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  return Math.max(0, dayDiff(fromKey(from).getTime(), fromKey(to).getTime()));
}

export interface MenstruationSettings {
  enabled: boolean;
  /** Average menstrual days per month, used to estimate days across the whole period. */
  daysPerMonth: number;
}

export const MENSTRUATION_MAX_DAYS = 15;
export const AVG_MONTH_DAYS = 30.44;

export interface Estimate {
  /** Whole days between the two dates. */
  total: number;
  /** Days removed by dated periods (custom + postpartum; overlaps merged, clipped to the range). */
  fixed: number;
  /** Estimated menstrual days (applied to the days left after dated exclusions). */
  menstrual: number;
  /** fixed + menstrual */
  excluded: number;
  /** Days that count as missed. */
  net: number;
}

const EMPTY: Estimate = { total: 0, fixed: 0, menstrual: 0, excluded: 0, net: 0 };

export function estimateMissedDays(
  start: string,
  end: string,
  excluded: readonly ExcludedPeriod[],
  menstruation?: MenstruationSettings,
): Estimate {
  const total = daysBetween(start, end);
  if (total === 0) return EMPTY;

  const s = fromKey(start).getTime();
  const e = fromKey(end).getTime();

  const intervals = excluded
    .filter((p) => p.from && p.to)
    .map<[number, number]>((p) => [
      Math.max(s, fromKey(p.from).getTime()),
      Math.min(e, fromKey(p.to).getTime()),
    ])
    .filter(([a, b]) => b > a)
    .sort((x, y) => x[0] - y[0]);

  let excludedDays = 0;
  let curA = Number.NEGATIVE_INFINITY;
  let curB = Number.NEGATIVE_INFINITY;
  for (const [a, b] of intervals) {
    if (a > curB) {
      if (curB > curA) excludedDays += dayDiff(curA, curB);
      curA = a;
      curB = b;
    } else {
      curB = Math.max(curB, b);
    }
  }
  if (curB > curA) excludedDays += dayDiff(curA, curB);

  const fixed = Math.min(total, excludedDays);
  const afterFixed = total - fixed;
  const perMonth = menstruation?.enabled ? Math.min(MENSTRUATION_MAX_DAYS, Math.max(0, menstruation.daysPerMonth)) : 0;
  const menstrual = Math.min(afterFixed, Math.round((afterFixed / AVG_MONTH_DAYS) * perMonth));
  const excludedTotal = fixed + menstrual;
  return { total, fixed, menstrual, excluded: excludedTotal, net: Math.max(0, total - excludedTotal) };
}

export const newPeriodId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
