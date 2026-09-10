import { deriveProgress } from "@/lib/progress";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MENSTRUATION_MAX_DAYS, estimateMissedDays, newPeriodId, type ExcludedPeriod, type MenstruationSettings } from "@/lib/calc";
import {
  fillCounts,
  toKey,
  type PrayerId,
} from "@/lib/prayers";
import {
  MAX_TARGET,
  STORAGE_KEY,
  clearState,
  defaultState,
  readStored,
  statesEqual,
  storageAvailable,
  writeState,
  type AppState,
  type PrintPeriod,
  type StorageStatus,
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
  /** Set today's count for a prayer directly (the tracker's +1 / −1 taps). */
  setTodayCount: (id: PrayerId, n: number) => void;
  addExtra: (id: PrayerId) => void;
  setPrintPeriod: (p: PrintPeriod) => void;
  resetAll: () => void;
  replaceState: (s: AppState) => void;
}

interface Ctx {
  state: AppState;
  derived: Derived;
  actions: Actions;
  /** Whether the last write to this device succeeded. Surface it; never fail silently. */
  storageStatus: StorageStatus;
  /** Retry persisting the current state (after freeing space, for example). */
  retrySave: () => void;
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
  const [state, setState] = useState<AppState>(() => readStored()?.state ?? defaultState());
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() => (storageAvailable() ? "ok" : "unavailable"));
  const today = useTodayKey();
  /** Stamp of the last envelope this tab wrote or adopted; anything else in storage came from another tab. */
  const lastSeenStamp = useRef<string | null>(readStored()?.savedAt ?? null);

  const persist = useCallback(
    (next: AppState) => {
      const stored = readStored();
      // Another tab already holds exactly this state: adopt its stamp, don't rewrite (avoids write ping-pong).
      if (stored && statesEqual(stored.state, next)) {
        lastSeenStamp.current = stored.savedAt;
        setStorageStatus((s) => (s === "unavailable" ? s : "ok"));
        return;
      }
      const stamp = writeState(next);
      if (stamp) {
        lastSeenStamp.current = stamp;
        setStorageStatus("ok");
      } else {
        setStorageStatus((s) => (s === "unavailable" ? s : "failed"));
      }
    },
    [],
  );

  useEffect(() => {
    persist(state);
  }, [state, persist]);

  // Adopt changes written by other tabs (storage event) or while this tab was hidden (visibility).
  useEffect(() => {
    const adoptIfChanged = () => {
      const stored = readStored();
      if (!stored || stored.savedAt === lastSeenStamp.current) return;
      lastSeenStamp.current = stored.savedAt;
      setState((current) => (statesEqual(current, stored.state) ? current : stored.state));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === STORAGE_KEY) adoptIfChanged();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") adoptIfChanged();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

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
      setTodayCount: (id, n) => setTodayCount(id, Math.max(0, Math.floor(n))),
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

  const retrySave = useCallback(() => {
    if (!storageAvailable()) {
      setStorageStatus("unavailable");
      return;
    }
    setStorageStatus("ok");
    persist(state);
  }, [persist, state]);

  const value = useMemo(
    () => ({ state, derived, actions, storageStatus, retrySave }),
    [state, derived, actions, storageStatus, retrySave],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
