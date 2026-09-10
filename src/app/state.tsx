import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { estimateMissedDays, newPeriodId, type ExcludedPeriod } from "@/lib/calc";
import {
  PRAYER_IDS,
  fillCounts,
  mapCounts,
  sumCounts,
  toKey,
  type PrayerCounts,
  type PrayerId,
} from "@/lib/prayers";
import {
  MAX_TARGET,
  clearState,
  defaultState,
  loadState,
  saveState,
  type AppState,
  type PrintPeriod,
} from "@/lib/storage";

export interface Derived {
  today: string;
  doneByPrayer: PrayerCounts;
  totalDone: number;
  totalMissed: number;
  remainingByPrayer: PrayerCounts;
  totalRemaining: number;
  overallPct: number;
  dailyTotal: number;
  todayLog: Partial<PrayerCounts>;
  todayDone: number;
  /** Days to finish at the current targets, or null before the first calculation. */
  daysNeeded: number | null;
}

export interface Actions {
  setDates: (start: string, end: string) => void;
  addExcluded: () => void;
  updateExcluded: (id: string, patch: Partial<Omit<ExcludedPeriod, "id">>) => void;
  removeExcluded: (id: string) => void;
  calculate: () => void;
  setCount: (id: PrayerId, n: number) => void;
  adjustCount: (id: PrayerId, delta: number) => void;
  adjustTarget: (id: PrayerId, delta: number) => void;
  toggleToday: (id: PrayerId, index: number) => void;
  addExtra: (id: PrayerId) => void;
  setPrintPeriod: (p: PrintPeriod) => void;
  resetAll: () => void;
  replaceState: (s: AppState) => void;
}

interface Ctx {
  state: AppState;
  derived: Derived;
  actions: Actions;
}

const AppContext = createContext<Ctx | null>(null);

function useTodayKey(): string {
  const [key, setKey] = useState(() => toKey(new Date()));
  useEffect(() => {
    const t = setInterval(() => {
      const now = toKey(new Date());
      if (now !== key) setKey(now);
    }, 60_000);
    return () => clearInterval(t);
  }, [key]);
  return key;
}

export function daysNeededFor(remaining: PrayerCounts, targets: PrayerCounts): number {
  return Math.max(0, ...PRAYER_IDS.map((id) => Math.ceil(remaining[id] / Math.max(1, targets[id]))));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState() ?? defaultState());
  const today = useTodayKey();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const derived = useMemo<Derived>(() => {
    const entries = Object.values(state.log);
    const doneByPrayer = mapCounts((id) => entries.reduce((acc, d) => acc + (d[id] ?? 0), 0));
    const totalDone = sumCounts(doneByPrayer);
    const totalMissed = sumCounts(state.counts);
    const remainingByPrayer = mapCounts((id) => Math.max(0, state.counts[id] - doneByPrayer[id]));
    const totalRemaining = sumCounts(remainingByPrayer);
    const overallPct = totalMissed > 0 ? Math.min(100, Math.round((totalDone / totalMissed) * 100)) : 0;
    const todayLog = state.log[today] ?? {};
    return {
      today,
      doneByPrayer,
      totalDone,
      totalMissed,
      remainingByPrayer,
      totalRemaining,
      overallPct,
      dailyTotal: sumCounts(state.targets),
      todayLog,
      todayDone: sumCounts(todayLog),
      daysNeeded: state.calculated ? daysNeededFor(remainingByPrayer, state.targets) : null,
    };
  }, [state, today]);

  const setTodayCount = useCallback(
    (id: PrayerId, n: number) =>
      setState((s) => {
        const day = { ...(s.log[today] ?? {}) };
        if (n > 0) day[id] = n;
        else delete day[id];
        const log = { ...s.log };
        if (Object.keys(day).length) log[today] = day;
        else delete log[today];
        return { ...s, log };
      }),
    [today],
  );

  const actions = useMemo<Actions>(
    () => ({
      setDates: (startDate, endDate) => setState((s) => ({ ...s, startDate, endDate })),
      addExcluded: () =>
        setState((s) => ({
          ...s,
          excluded: [...s.excluded, { id: newPeriodId(), label: "", from: "", to: "" }],
        })),
      updateExcluded: (id, patch) =>
        setState((s) => ({
          ...s,
          excluded: s.excluded.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeExcluded: (id) =>
        setState((s) => ({ ...s, excluded: s.excluded.filter((p) => p.id !== id) })),
      calculate: () =>
        setState((s) => {
          const { net } = estimateMissedDays(s.startDate, s.endDate, s.excluded);
          return { ...s, counts: fillCounts(net), calculated: true };
        }),
      setCount: (id, n) =>
        setState((s) => ({
          ...s,
          counts: { ...s.counts, [id]: Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)) },
        })),
      adjustCount: (id, delta) =>
        setState((s) => ({ ...s, counts: { ...s.counts, [id]: Math.max(0, s.counts[id] + delta) } })),
      adjustTarget: (id, delta) =>
        setState((s) => ({
          ...s,
          targets: { ...s.targets, [id]: Math.min(MAX_TARGET, Math.max(1, s.targets[id] + delta)) },
        })),
      toggleToday: (id, index) => {
        const current = derived.todayLog[id] ?? 0;
        setTodayCount(id, index < current ? index : index + 1);
      },
      addExtra: (id) => setTodayCount(id, (derived.todayLog[id] ?? 0) + 1),
      setPrintPeriod: (printPeriod) => setState((s) => ({ ...s, printPeriod })),
      resetAll: () => {
        clearState();
        setState(defaultState());
      },
      replaceState: (next) => setState(next),
    }),
    [derived.todayLog, setTodayCount],
  );

  const value = useMemo(() => ({ state, derived, actions }), [state, derived, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
