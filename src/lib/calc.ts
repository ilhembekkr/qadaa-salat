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

export interface Estimate {
  /** Whole days between the two dates. */
  total: number;
  /** Days removed by excluded periods (overlaps merged, clipped to the range). */
  excluded: number;
  /** Days that count as missed. */
  net: number;
}

export function estimateMissedDays(
  start: string,
  end: string,
  excluded: readonly ExcludedPeriod[],
): Estimate {
  const total = daysBetween(start, end);
  if (total === 0) return { total: 0, excluded: 0, net: 0 };

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

  return { total, excluded: excludedDays, net: Math.max(0, total - excludedDays) };
}

export const newPeriodId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
