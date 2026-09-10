export type PrayerId = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface Prayer {
  id: PrayerId;
  name: string;
}

export const PRAYERS: readonly Prayer[] = [
  { id: "fajr", name: "الفجر" },
  { id: "dhuhr", name: "الظهر" },
  { id: "asr", name: "العصر" },
  { id: "maghrib", name: "المغرب" },
  { id: "isha", name: "العشاء" },
];

export const PRAYER_IDS: readonly PrayerId[] = PRAYERS.map((p) => p.id);

export type PrayerCounts = Record<PrayerId, number>;

export const mapCounts = (f: (id: PrayerId) => number): PrayerCounts => ({
  fajr: f("fajr"),
  dhuhr: f("dhuhr"),
  asr: f("asr"),
  maghrib: f("maghrib"),
  isha: f("isha"),
});

export const fillCounts = (n: number): PrayerCounts => mapCounts(() => n);

export const sumCounts = (c: Partial<PrayerCounts>): number =>
  PRAYER_IDS.reduce((acc, id) => acc + (c[id] ?? 0), 0);

// Arabic locale, Western digits, Gregorian calendar (matches the brief: "2,437", "مايو 2029").
const LOCALE = "ar-u-nu-latn-ca-gregory";
const numberFmt = new Intl.NumberFormat(LOCALE);
const dayLongFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long" });
const monthYearFmt = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "numeric" });
const weekdayShortFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });

export const fmt = (n: number): string => numberFmt.format(n);
export const pct = (n: number): string => `${fmt(n)}٪`;

export const formatDayLong = (d: Date): string => dayLongFmt.format(d);
export const formatMonthYear = (d: Date): string => monthYearFmt.format(d);
export const formatShortDate = (d: Date): string => shortDateFmt.format(d);
export const formatWeekdayShort = (d: Date): string => weekdayShortFmt.format(d);

interface ArForms {
  one: string;
  two: string;
  few: string;
  many: string;
}

/** Arabic count agreement: 1 → singular, 2 → dual, 3–10 → plural, 11+ → singular accusative. */
export function arCount(n: number, forms: ArForms): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${fmt(n)} ${forms.few}`;
  return `${fmt(n)} ${forms.many}`;
}

export const arPrayers = (n: number) =>
  arCount(n, { one: "صلاة واحدة", two: "صلاتان", few: "صلوات", many: "صلاة" });

export const arDays = (n: number) =>
  arCount(n, { one: "يوم واحد", two: "يومان", few: "أيام", many: "يوماً" });

export function durationFromDays(days: number): string {
  if (days <= 0) return "مكتملة";
  if (days < 30) return arDays(days);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const y = years ? arCount(years, { one: "سنة", two: "سنتان", few: "سنوات", many: "سنة" }) : "";
  const m = months ? arCount(months, { one: "شهر", two: "شهران", few: "أشهر", many: "شهراً" }) : "";
  if (y && m) return `${y} و${m}`;
  return y || m || "أقل من شهر";
}

// ── Local-date keys (YYYY-MM-DD in the user's timezone) ──────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export const isDateKey = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(fromKey(s).getTime());
