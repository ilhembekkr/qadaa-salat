import { Minus, Plus } from "lucide-react";

const Check = () => (
  <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Above this many boxes a counter row is used instead of individual boxes. */
const MAX_BOXES = 6;

interface StaticProps {
  boxes: readonly boolean[];
}

/** Read-only row of check boxes (landing-page preview). */
export function StaticCheckBoxes({ boxes }: StaticProps) {
  return (
    <div className="flex gap-2.5 flex-wrap justify-end">
      {boxes.map((checked, i) => (
        <div
          key={i}
          className={`w-10 h-10 md:w-8 md:h-8 rounded-xl md:rounded-lg border-2 flex items-center justify-center ${
            checked ? "bg-primary border-primary" : "bg-muted border-border"
          }`}
        >
          {checked && <Check />}
        </div>
      ))}
    </div>
  );
}

interface InteractiveProps {
  prayerName: string;
  /** Daily target for this prayer. */
  target: number;
  /** Prayers logged today (may exceed target). */
  done: number;
  /**
   * Toggle semantics: `index < done` sets done = index (uncheck from there),
   * otherwise sets done = index + 1. Passing `done` therefore adds one.
   */
  onToggle: (index: number) => void;
}

/**
 * Interactive row: the first `done` boxes are checked, boxes beyond `target`
 * carry a sand border ("beyond target"), and a dashed ghost box adds one more
 * once the target is met. Large targets switch to a counter.
 */
export function CheckBoxes({ prayerName, target, done, onToggle }: InteractiveProps) {
  const total = Math.max(target, done);

  if (total > MAX_BOXES) {
    const pctDone = Math.min(1, done / Math.max(1, target));
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(done - 1)}
            disabled={done === 0}
            aria-label={`إنقاص ${prayerName}`}
            className="w-11 h-11 md:w-10 md:h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:text-primary active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="tabular-nums text-lg font-bold text-foreground min-w-16 text-center" aria-live="polite">
            <bdi>{done} / {target}</bdi>
          </span>
          <button
            type="button"
            onClick={() => onToggle(done)}
            aria-label={`زيادة ${prayerName}`}
            className="w-11 h-11 md:w-10 md:h-10 rounded-xl border-2 border-primary bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex gap-1 w-full max-w-40" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${pctDone >= (i + 1) / 5 ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 flex-wrap justify-end" role="group" aria-label={prayerName}>
      {Array.from({ length: total }, (_, i) => {
        const checked = i < done;
        const extra = i >= target;
        return (
          <button
            key={i}
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={`${prayerName} — صلاة القضاء رقم ${i + 1}${extra ? " (خارج الهدف)" : ""}`}
            onClick={() => onToggle(i)}
            className={`w-10 h-10 md:w-8 md:h-8 rounded-xl md:rounded-lg border-2 flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              checked
                ? extra
                  ? "bg-sand border-sand"
                  : "bg-primary border-primary"
                : "bg-background border-border hover:border-primary/40"
            }`}
          >
            {checked && <Check />}
          </button>
        );
      })}
      {done >= target && (
        <button
          type="button"
          onClick={() => onToggle(total)}
          aria-label={`إضافة صلاة ${prayerName} خارج الهدف`}
          className="w-10 h-10 md:w-8 md:h-8 rounded-xl md:rounded-lg border-2 border-dashed border-border text-muted-foreground flex items-center justify-center hover:border-sand hover:text-accent active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
