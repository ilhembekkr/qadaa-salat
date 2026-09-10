import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  value: ReactNode;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
  size?: "sm" | "lg";
  disableDecrement?: boolean;
  disableIncrement?: boolean;
}

export function Stepper({ value, label, onDecrement, onIncrement, size = "sm", disableDecrement, disableIncrement }: Props) {
  const btn =
    size === "lg"
      ? "w-12 h-12 md:w-10 md:h-10 rounded-xl border-2 border-border hover:border-primary hover:text-primary"
      : "w-11 h-11 md:w-9 md:h-9 rounded-xl md:rounded-lg border border-border hover:bg-muted";
  const icon = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5 text-muted-foreground";
  const gap = size === "lg" ? "gap-4 md:gap-5" : "gap-2.5 md:gap-3";
  const common =
    "flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
  return (
    <div className={`flex items-center ${gap}`}>
      <button type="button" onClick={onDecrement} disabled={disableDecrement} aria-label={`إنقاص ${label}`} className={`${btn} ${common}`}>
        <Minus className={icon} />
      </button>
      {value}
      <button type="button" onClick={onIncrement} disabled={disableIncrement} aria-label={`زيادة ${label}`} className={`${btn} ${common}`}>
        <Plus className={icon} />
      </button>
    </div>
  );
}
