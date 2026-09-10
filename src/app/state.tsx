import { deriveProgress } from "@/lib/progress";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MENSTRUATION_MAX_DAYS, estimateMissedDays, newPeriodId, type ExcludedPeriod, type MenstruationSettings } from "@/lib/calc";
import {
  fillCounts,
  toKey,
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

export type Derived = ReturnType<typeof deriveProgress>;

export type PeriodList = "excluded" | "postpartum";

export interface Actions {
  setDates: (start: string, end: string) => void;
  addExcluded: (list?: PeriodList) => void;
  updateExcluded: (id: string, patch: Partial<Omit<ExcludedPeriod, "id">>, list?: PeriodList) => void;
  removeExcluded: (id: string, list?: PeriodList) => void;
  setMenstruation: (patch: Partial<MenstruationSettings>) => void;
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

/** Custom periods plus postpartum periods (the latter only while the الحيض والنفاس option is on). */
export function allDatedExclusions(s: AppState): ExcludedPeriod[] {
  return s.menstruation.enabled ? [...s.excluded, ...s.postpartum] : s.excluded;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState() ?? defaultState());
  const today = useTodayKey();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const derived = useMemo<Derived>(() => deriveProgress(state, today), [state, today]);

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
      addExcluded: (list = "excluded") =>
        setState((s) => ({
          ...s,
          [list]: [...s[list], { id: newPeriodId(), label: "", from: "", to: "" }],
        })),
      updateExcluded: (id, patch, list = "excluded") =>
        setState((s) => ({
          ...s,
          [list]: s[list].map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeExcluded: (id, list = "excluded") =>
        setState((s) => ({ ...s, [list]: s[list].filter((p) => p.id !== id) })),
      setMenstruation: (patch) =>
        setState((s) => {
          const next = { ...s.menstruation, ...patch };
          const days = Number.isFinite(next.daysPerMonth) ? Math.floor(next.daysPerMonth) : 0;
          return { ...s, menstruation: { ...next, daysPerMonth: Math.min(MENSTRUATION_MAX_DAYS, Math.max(0, days)) } };
        }),
      calculate: () =>
        setState((s) => {
          const { net } = estimateMissedDays(s.startDate, s.endDate, allDatedExclusions(s), s.menstruation);
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
          targets: { ...s.targets, [id]: Math.min(MAX_TARGET, Math.max(0, s.targets[id] + delta)) },
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
