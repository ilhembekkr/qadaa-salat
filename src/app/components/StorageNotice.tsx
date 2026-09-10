import { AlertTriangle, RefreshCw } from "lucide-react";
import { downloadBackup } from "@/lib/storage";
import { useApp } from "../state";

/** Shown only when this device cannot keep the user's progress. Never silent. */
export function StorageNotice() {
  const { state, storageStatus, retrySave } = useApp();
  if (storageStatus === "ok") return null;

  const unavailable = storageStatus === "unavailable";
  return (
    <div role="alert" className="bg-accent/10 border-b border-accent/30 text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] sm:text-sm">
        <span className="inline-flex items-center gap-2 flex-1 min-w-60">
          <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
          {unavailable
            ? "لا يمكن الحفظ على هذا الجهاز (وضع التصفح الخاص أو تخزين معطّل). ستُفقد بياناتك عند إغلاق الصفحة."
            : "لم يُحفظ آخر تغيير على هذا الجهاز. قد تكون مساحة التخزين ممتلئة."}
        </span>
        <span className="inline-flex items-center gap-3">
          {!unavailable && (
            <button type="button" onClick={retrySave} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary/75">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              إعادة المحاولة
            </button>
          )}
          <button type="button" onClick={() => downloadBackup(state)} className="font-semibold text-accent hover:text-accent/80">
            نسخة احتياطية الآن
          </button>
        </span>
      </div>
    </div>
  );
}
