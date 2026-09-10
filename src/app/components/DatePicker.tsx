import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { fromKey, isDateKey, toKey } from "@/lib/prayers";

const LOCALE = "ar-u-nu-latn-ca-gregory";
const monthFmt = new Intl.DateTimeFormat(LOCALE, { month: "long" });
const fullFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });
const shortFmt = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "numeric", year: "numeric" });

const MONTHS = Array.from({ length: 12 }, (_, m) => monthFmt.format(new Date(2000, m, 1)));
/** Week starts on Saturday (2000-01-01 was a Saturday). */
const WEEK_START = 6;
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => weekdayFmt.format(new Date(2000, 0, 1 + i)));
const MIN_YEAR = 1940;

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  size?: "md" | "sm";
  ariaLabel?: string;
  /** Month to open on when nothing is selected (YYYY-MM-DD). */
  initialView?: string;
}

export function DatePicker({ id, value, onChange, min, max, placeholder = "اختر تاريخاً", size = "md", ariaLabel, initialView }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const gridId = useId();

  const today = toKey(new Date());
  const maxKey = max && isDateKey(max) ? max : undefined;
  const minKey = min && isDateKey(min) ? min : undefined;
  const selected = isDateKey(value) ? value : "";

  const viewKey = initialView && isDateKey(initialView) ? initialView : undefined;
  const initial = fromKey(selected || viewKey || maxKey || today);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const openPicker = () => {
    const d = fromKey(selected || viewKey || maxKey || today);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const maxYear = (maxKey ? fromKey(maxKey) : new Date()).getFullYear();
  const years = useMemo(() => {
    const out: number[] = [];
    for (let y = maxYear; y >= MIN_YEAR; y--) out.push(y);
    return out;
  }, [maxYear]);

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const offset = (first.getDay() - WEEK_START + 7) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) out.push(toKey(new Date(viewYear, viewMonth, d)));
    while (out.length % 7) out.push(null);
    return out;
  }, [viewYear, viewMonth]);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const isDisabled = (key: string): boolean => Boolean((minKey && key < minKey) || (maxKey && key > maxKey));

  const pick = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  const triggerCls =
    size === "sm"
      ? "px-3 py-2 text-sm rounded-lg bg-card"
      : "px-4 py-3 rounded-xl bg-muted";

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={`${triggerCls} w-full flex items-center justify-between gap-3 border border-border text-start transition-all focus:outline-none focus:ring-2 focus:ring-primary/25 hover:border-primary/40`}
      >
        <span className={`truncate ${selected ? "text-foreground" : "text-muted-foreground/70"}`}>
          {selected ? (size === "sm" ? shortFmt.format(fromKey(selected)) : fullFmt.format(fromKey(selected))) : placeholder}
        </span>
        <span className="flex items-center gap-1.5 flex-shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              aria-label="مسح التاريخ"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }
              }}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-border/60 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          )}
          <CalendarDays className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} text-primary`} aria-hidden="true" />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-foreground/30 sm:absolute sm:inset-auto sm:start-0 sm:top-full sm:mt-2 sm:block sm:p-0 sm:bg-transparent"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="اختيار التاريخ"
          className="w-full max-w-sm sm:w-[20.5rem] bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="الشهر السابق"
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <select
              aria-label="الشهر"
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="flex-1 min-w-0 px-2 py-1.5 text-base sm:text-sm font-semibold bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              aria-label="السنة"
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="w-24 px-2 py-1.5 text-base sm:text-sm font-semibold bg-muted border border-border rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="الشهر التالي"
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-labelledby={gridId}>
            <span id={gridId} className="sr-only">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[11px] font-semibold text-muted-foreground py-1" role="columnheader">
                {w}
              </span>
            ))}
            {cells.map((key, i) =>
              key ? (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  aria-selected={key === selected}
                  aria-label={fullFmt.format(fromKey(key))}
                  disabled={isDisabled(key)}
                  onClick={() => pick(key)}
                  className={`h-11 sm:h-9 rounded-lg text-sm tabular-nums transition-colors active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed ${
                    key === selected
                      ? "bg-primary text-primary-foreground font-bold"
                      : key === today
                        ? "ring-1 ring-primary/50 text-primary font-semibold hover:bg-primary/10"
                        : "text-foreground hover:bg-primary/10"
                  }`}
                >
                  {Number(key.slice(8))}
                </button>
              ) : (
                <span key={`e-${i}`} aria-hidden="true" />
              ),
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <button
              type="button"
              onClick={() => {
                if (!isDisabled(today)) pick(today);
              }}
              disabled={isDisabled(today)}
              className="text-sm font-semibold text-primary hover:text-primary/75 disabled:opacity-40 py-2 px-1"
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground py-2 px-1"
            >
              مسح
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
