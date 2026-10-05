import { Leaf, X } from "lucide-react";
import { useEffect, useState } from "react";
import { advanceIstighfar, type IstighfarState } from "@/lib/istighfar";
import { useApp } from "../state";

export function IstighfarReminder() {
  const { derived } = useApp();
  const [reminder, setReminder] = useState<IstighfarState>(() => ({
    day: derived.today, recorded: derived.todayDone, visible: false,
  }));
  const today = derived.today;
  const recorded = derived.todayDone;
  const visible = reminder.visible && reminder.day === today;

  useEffect(() => {
    setReminder((current) => advanceIstighfar(current, today, recorded));
  }, [today, recorded]);

  return (
    <div className="space-y-3">
      {derived.todayComplete && <p className="text-sm text-primary">أتممت هدف اليوم{visible ? "." : "، تقبّل الله منك."}</p>}
      <div role="status" aria-live="polite" aria-atomic="true">
        {visible && (
          <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-secondary/70 p-3 sm:p-4">
            <Leaf className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0 text-sm leading-relaxed">
              <p className="font-semibold text-primary">تقبّل الله منك.</p>
              <p className="text-muted-foreground mt-1">خذ لحظة للاستغفار والدعاء.</p>
            </div>
            <button type="button" aria-label="إغلاق تذكير الاستغفار"
              onClick={() => setReminder((current) => ({ ...current, visible: false }))}
              className="w-10 h-10 -m-1 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
