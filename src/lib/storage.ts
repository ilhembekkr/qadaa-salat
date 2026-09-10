import { MENSTRUATION_MAX_DAYS, type ExcludedPeriod, type MenstruationSettings } from "./calc";
import { PRAYER_IDS, fillCounts, isDateKey, mapCounts, toKey, type PrayerCounts } from "./prayers";

export type PrintPeriod = "week" | "month" | "quarter";

export const PRINT_DAYS: Record<PrintPeriod, number> = { week: 7, month: 30, quarter: 90 };
export const PRINT_LABELS: Record<PrintPeriod, string> = { week: "أسبوع", month: "شهر", quarter: "3 أشهر" };

/** Per-day log: how many qada prayers were performed for each prayer on that date. */
export type DailyLog = Record<string, Partial<PrayerCounts>>;

export interface AppState {
  version: 1;
  startDate: string;
  endDate: string;
  /** Dated periods the user knows precisely. */
  excluded: ExcludedPeriod[];
  /** Postpartum (نفاس) periods; counted only while menstruation.enabled. */
  postpartum: ExcludedPeriod[];
  menstruation: MenstruationSettings;
  calculated: boolean;
  /** Estimated missed prayers (the fixed baseline the user adjusts). */
  counts: PrayerCounts;
  /** Daily target per prayer. */
  targets: PrayerCounts;
  log: DailyLog;
  printPeriod: PrintPeriod;
}

export const STORAGE_KEY = "qada-planner:state";
export const MAX_TARGET = 50;

export const defaultState = (): AppState => ({
  version: 1,
  startDate: "",
  endDate: "",
  excluded: [],
  postpartum: [],
  menstruation: { enabled: false, daysPerMonth: 6 },
  calculated: false,
  counts: fillCounts(0),
  targets: { fajr: 3, dhuhr: 1, asr: 2, maghrib: 1, isha: 2 },
  log: {},
  printPeriod: "month",
});

// ── Validation ────────────────────────────────────────────────────────────────

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const nonNegInt = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;

const readCounts = (v: unknown, min: number, fallback: PrayerCounts): PrayerCounts => {
  if (!isRecord(v)) return fallback;
  return mapCounts((id) => Math.max(min, nonNegInt(v[id], fallback[id])));
};

/** Accepts anything (parsed JSON) and returns a well-formed state, or null if it is not ours. */
export function sanitize(raw: unknown): AppState | null {
  if (!isRecord(raw) || raw.version !== 1) return null;
  const base = defaultState();

  const readPeriods = (v: unknown, prefix: string): ExcludedPeriod[] =>
    Array.isArray(v)
      ? v.filter(isRecord).map((p, i) => ({
          id: typeof p.id === "string" && p.id ? p.id : `${prefix}-${i}`,
          label: typeof p.label === "string" ? p.label : "",
          from: isDateKey(p.from) ? p.from : "",
          to: isDateKey(p.to) ? p.to : "",
        }))
      : [];
  const excluded = readPeriods(raw.excluded, "restored");
  const postpartum = readPeriods(raw.postpartum, "postpartum");
  const m = isRecord(raw.menstruation) ? raw.menstruation : {};
  const menstruation: MenstruationSettings = {
    enabled: m.enabled === true,
    daysPerMonth: Math.min(MENSTRUATION_MAX_DAYS, nonNegInt(m.daysPerMonth, base.menstruation.daysPerMonth)),
  };

  const log: DailyLog = {};
  if (isRecord(raw.log)) {
    for (const [day, entry] of Object.entries(raw.log)) {
      if (!isDateKey(day) || !isRecord(entry)) continue;
      const clean: Partial<PrayerCounts> = {};
      for (const id of PRAYER_IDS) {
        const n = nonNegInt(entry[id]);
        if (n > 0) clean[id] = n;
      }
      if (Object.keys(clean).length) log[day] = clean;
    }
  }

  const printPeriod = raw.printPeriod;

  return {
    version: 1,
    startDate: isDateKey(raw.startDate) ? raw.startDate : "",
    endDate: isDateKey(raw.endDate) ? raw.endDate : "",
    excluded,
    postpartum,
    menstruation,
    calculated: raw.calculated === true,
    counts: readCounts(raw.counts, 0, base.counts),
    targets: mapCounts((id) => Math.min(MAX_TARGET, readCounts(raw.targets, 0, base.targets)[id])),
    log,
    printPeriod:
      printPeriod === "week" || printPeriod === "month" || printPeriod === "quarter"
        ? printPeriod
        : "month",
  };
}

// ── localStorage ──────────────────────────────────────────────────────────────

/**
 * ok: reads and writes work.
 * unavailable: storage throws (private mode, blocked site data) — nothing persists.
 * failed: the last write was rejected (quota, disabled mid-session) — progress is at risk.
 */
export type StorageStatus = "ok" | "unavailable" | "failed";

/** Every write carries the moment it happened so tabs can tell their own writes from others'. */
export interface StoredEnvelope extends AppState {
  savedAt?: string;
}

export function storageAvailable(): boolean {
  try {
    const probe = `${STORAGE_KEY}:probe`;
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** Reads the raw envelope (state + savedAt) or null if absent/corrupt/unavailable. */
export function readStored(): { state: AppState; savedAt: string | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const state = sanitize(parsed);
    if (!state) return null;
    const savedAt =
      typeof parsed === "object" && parsed !== null && typeof (parsed as StoredEnvelope).savedAt === "string"
        ? (parsed as StoredEnvelope).savedAt!
        : null;
    return { state, savedAt };
  } catch {
    return null;
  }
}

export function loadState(): AppState | null {
  return readStored()?.state ?? null;
}

/** Writes state with a timestamp; returns the stamp, or null if storage rejected the write. */
export function writeState(state: AppState, savedAt = new Date().toISOString()): string | null {
  try {
    const envelope: StoredEnvelope = { ...state, savedAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return savedAt;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): boolean {
  return writeState(state) !== null;
}

/** Structural equality of two states, ignoring the envelope stamp. */
export function statesEqual(a: AppState, b: AppState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

// ── Backup / restore (JSON file on the user's device) ─────────────────────────

export function downloadBackup(state: AppState): void {
  const payload = { ...state, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qada-plan-${toKey(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readBackup(file: File): Promise<AppState> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("الملف ليس بصيغة JSON صالحة.");
  }
  const state = sanitize(parsed);
  if (!state) throw new Error("هذا الملف ليس نسخة احتياطية من خطة القضاء.");
  return state;
}
