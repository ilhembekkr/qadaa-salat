import { useId, useState } from "react";
import { fmt } from "@/lib/prayers";
import { useApp } from "../state";

export function FullDayRecorder() {
  const { state, derived, actions, fullDaysRecorded } = useApp();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const id = useId();
  const days = Number(quantity);
  const max = state.calculated ? Math.min(...Object.values(derived.remainingByPrayer)) : undefined;
  const valid = Number.isSafeInteger(days) && days > 0 && (max === undefined || days <= max);

  return (
    <div className="px-5 md:px-6 py-4 border-b border-border bg-secondary/20 space-y-3">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-primary underline underline-offset-4 py-2 focus-visible:ring-2 focus-visible:ring-ring rounded">
        تسجيل قضاء أيام كاملة
      </button>
      {open && (
        <div id={id} className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">سجّل الأيام التي قضيتها بالفعل؛ كل يوم يضيف صلاة واحدة من كل نوع. هدفك اليومي لا يتغيّر.</p>
          {max === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد أيام كاملة متبقية. يمكنك تسجيل الصلوات المتبقية كلّ واحدة على حدة أدناه.</p>
          ) : (
            <form className="space-y-3" onSubmit={(event) => {
              event.preventDefault();
              if (valid) actions.recordFullDays(days);
            }}>
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor={`${id}-quantity`} className="text-sm font-semibold">عدد الأيام</label>
                <input id={`${id}-quantity`} type="number" inputMode="numeric" min="1" max={max} step="1" required
                  value={quantity} onChange={(event) => setQuantity(event.target.value)}
                  aria-describedby={`${id}-preview`} className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                {max !== undefined && <span className="text-xs text-muted-foreground">المتاح: {fmt(max)} أيام كاملة</span>}
              </div>
              <p id={`${id}-preview`} className="text-sm text-muted-foreground" aria-live="polite">
                {valid ? <>سيُضاف {fmt(days)} من كل صلاة، أي {fmt(days * 5)} صلاة إلى سجل اليوم.</> : "أدخل عدداً صحيحاً ضمن الأيام المتبقية."}
              </p>
              <button type="submit" disabled={!valid} className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring">
                تسجيل الصلوات المنجزة
              </button>
            </form>
          )}
        </div>
      )}
      {fullDaysRecorded !== null && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 text-sm text-primary">
          <span>أُضيف {fmt(fullDaysRecorded)} من كل صلاة إلى سجل اليوم.</span>
          <button type="button" onClick={actions.undoFullDays} className="font-semibold underline underline-offset-4 py-2">تراجع</button>
        </div>
      )}
    </div>
  );
}
