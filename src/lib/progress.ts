import { PRAYER_IDS, mapCounts, sumCounts, type PrayerCounts } from "./prayers";
import type { AppState } from "./storage";

/**
 * Tap rule for the tracker row: a tap on a checked box removes ONE prayer, a tap on an
 * unchecked box adds ONE. The boxes are a count, so no tap ever clears several at once.
 */
export function nextCountOnTap(done: number, index: number): number {
  return index < done ? Math.max(0, done - 1) : done + 1;
}

export interface Forecast {
  status: "uncalculated" | "incomplete" | "scheduled" | "complete";
  daysByPrayer: Record<keyof PrayerCounts, number | null>;
  days: number | null;
}

export function forecastFor(remaining: PrayerCounts, targets: PrayerCounts, calculated = true): Forecast {
  const daysByPrayer = Object.fromEntries(PRAYER_IDS.map((id) => [
    id, !calculated ? null : remaining[id] === 0 ? 0 : targets[id] === 0 ? null : Math.ceil(remaining[id] / targets[id]),
  ])) as Forecast["daysByPrayer"];
  if (!calculated) return { status: "uncalculated", daysByPrayer, days: null };
  if (sumCounts(remaining) === 0) return { status: "complete", daysByPrayer, days: 0 };
  if (PRAYER_IDS.some((id) => daysByPrayer[id] === null)) return { status: "incomplete", daysByPrayer, days: null };
  return { status: "scheduled", daysByPrayer, days: Math.max(...Object.values(daysByPrayer) as number[]) };
}

/** A rounded percentage must never imply completion while work remains. */
export function progressPercent(credited: number, required: number): number {
  if (required === 0) return 0;
  return credited >= required ? 100 : Math.min(99, Math.round(credited / required * 100));
}

export function deriveProgress(state: AppState, today: string) {
  const entries = Object.values(state.log);
  const doneByPrayer = mapCounts((id) => entries.reduce((sum, day) => sum + (day[id] ?? 0), 0));
  const creditedByPrayer = mapCounts((id) => Math.min(doneByPrayer[id], state.counts[id]));
  const remainingByPrayer = mapCounts((id) => Math.max(0, state.counts[id] - doneByPrayer[id]));
  const todayLog = state.log[today] ?? {};
  // Exclude today's entries so the requirement does not shrink with each click.
  const balanceBeforeToday = mapCounts((id) => Math.max(0, state.counts[id] - (doneByPrayer[id] - (todayLog[id] ?? 0))));
  const todayRequiredByPrayer = mapCounts((id) => state.calculated
    ? Math.min(state.targets[id], balanceBeforeToday[id]) : state.targets[id]);
  const todayCreditedByPrayer = mapCounts((id) => Math.min(todayLog[id] ?? 0, todayRequiredByPrayer[id]));
  const todayExtraByPrayer = mapCounts((id) => Math.max(0, (todayLog[id] ?? 0) - todayRequiredByPrayer[id]));
  const totalMissed = sumCounts(state.counts);
  const totalRemaining = sumCounts(remainingByPrayer);
  const todayRequired = sumCounts(todayRequiredByPrayer);
  const todayCredited = sumCounts(todayCreditedByPrayer);
  return {
    today, doneByPrayer, creditedByPrayer, remainingByPrayer, balanceBeforeToday,
    totalDone: sumCounts(doneByPrayer), totalCredited: sumCounts(creditedByPrayer), totalMissed, totalRemaining,
    overallPct: !state.calculated ? null : totalRemaining === 0 ? 100 : progressPercent(sumCounts(creditedByPrayer), totalMissed),
    configuredDailyTotal: sumCounts(state.targets),
    todayLog, todayDone: sumCounts(todayLog), todayRequiredByPrayer, todayCreditedByPrayer, todayExtraByPrayer,
    todayRequired, todayCredited, todayExtra: sumCounts(todayExtraByPrayer),
    todayPct: progressPercent(todayCredited, todayRequired),
    todayComplete: todayRequired > 0 && todayCredited === todayRequired,
    forecast: forecastFor(remainingByPrayer, state.targets, state.calculated),
  };
}

export interface PlanSummary {
  calculated: boolean;
  /** Estimated missed prayers. */
  estimated: number;
  remaining: number;
  /** Raw prayers recorded in the log. */
  recorded: number;
  loggedDays: number;
  /** Latest day with an entry (YYYY-MM-DD) or null. */
  lastLoggedDay: string | null;
  /** True when there is nothing worth protecting: no estimate and an empty log. */
  empty: boolean;
}

/** Compact, comparable description of a plan — used before replacing one with another. */
export function summarizePlan(state: AppState): PlanSummary {
  const days = Object.keys(state.log).filter((d) => sumCounts(state.log[d] ?? {}) > 0).sort();
  const recorded = days.reduce((acc, d) => acc + sumCounts(state.log[d] ?? {}), 0);
  const estimated = sumCounts(state.counts);
  const remaining = sumCounts(mapCounts((id) => Math.max(0, state.counts[id] - days.reduce((a, d) => a + (state.log[d]?.[id] ?? 0), 0))));
  return {
    calculated: state.calculated,
    estimated,
    remaining,
    recorded,
    loggedDays: days.length,
    lastLoggedDay: days.length ? days[days.length - 1] : null,
    empty: !state.calculated && recorded === 0,
  };
}

/** Blank future work, beginning with only the outstanding requirement today. */
export function printSchedule(state: AppState, today: string, days: number): PrayerCounts[] {
  const progress = deriveProgress(state, today);
  const remaining = { ...progress.remainingByPrayer };
  return Array.from({ length: days }, (_, day) => mapCounts((id) => {
    const target = day === 0
      ? Math.max(0, progress.todayRequiredByPrayer[id] - (progress.todayLog[id] ?? 0))
      : state.targets[id];
    const required = state.calculated ? Math.min(target, remaining[id]) : target;
    remaining[id] = Math.max(0, remaining[id] - required);
    return required;
  }));
}
