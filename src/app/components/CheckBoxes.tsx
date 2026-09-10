const Check = () => (
  <svg width="11" height="9" viewBox="0 0 12 10" aria-hidden="true">
    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface StaticProps {
  boxes: readonly boolean[];
  size?: "sm" | "md";
}

/** Read-only row of check boxes (used in previews). */
export function StaticCheckBoxes({ boxes, size = "sm" }: StaticProps) {
  const dim = size === "md" ? "w-8 h-8" : "w-7 h-7";
  return (
    <div className="flex gap-2 flex-wrap justify-end">
      {boxes.map((checked, i) => (
        <div
          key={i}
          className={`${dim} rounded-lg border-2 flex items-center justify-center ${
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
  /** Number of boxes to render. */
  total: number;
  /** How many are checked (the first `done` boxes). */
  done: number;
  onToggle: (index: number) => void;
}

/** Row of toggleable boxes: the first `done` boxes are checked. */
export function CheckBoxes({ prayerName, total, done, onToggle }: InteractiveProps) {
  return (
    <div className="flex gap-2 flex-wrap justify-end">
      {Array.from({ length: total }, (_, i) => {
        const checked = i < done;
        return (
          <button
            key={i}
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={`${prayerName} — صلاة القضاء رقم ${i + 1}`}
            onClick={() => onToggle(i)}
            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              checked ? "bg-primary border-primary" : "bg-background border-border hover:border-primary/40"
            }`}
          >
            {checked && <Check />}
          </button>
        );
      })}
    </div>
  );
}
