import { FileDown, HardDrive, Lock, RotateCcw, Shield, Trash2 } from "lucide-react";
import { summarizePlan, type PlanSummary } from "@/lib/progress";
import { arDays, arPrayers, fmt, formatDayLong, fromKey } from "@/lib/prayers";
import { useRef, useState } from "react";
import { downloadBackup, readBackupFile, type AppState } from "@/lib/storage";
import { useApp } from "../state";
import { SectionHeader } from "../components/SectionHeader";

const BENEFITS = [
  { Icon: Shield, title: "بدون حساب", desc: "لا تسجيل دخول، ولا بريد إلكتروني، ولا تتبّع." },
  { Icon: Lock, title: "بدون كلمة مرور", desc: "لا شيء يُخترق، ولا شيء يُنسى." },
  { Icon: HardDrive, title: "بياناتك على جهازك", desc: "جميع بياناتك تُخزَّن في متصفحك ولا تُرسَل لأي خادم." },
];

type Status = { kind: "ok" | "error"; text: string } | null;

interface Pending {
  state: AppState;
  exportedAt: string | null;
  incoming: PlanSummary;
  current: PlanSummary;
}

const dateTimeFmt = new Intl.DateTimeFormat("ar-u-nu-latn-ca-gregory", { dateStyle: "medium", timeStyle: "short" });

function SummaryColumn({ title, s, highlight }: { title: string; s: PlanSummary; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3.5 space-y-1.5 text-[13px] ${highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/60 border border-border"}`}>
      <div className="font-bold text-foreground text-sm">{title}</div>
      {s.empty ? (
        <div className="text-muted-foreground">لا توجد خطة ولا سجل</div>
      ) : (
        <>
          <div className="text-foreground tabular-nums">{s.calculated ? <>المتبقي: {arPrayers(s.remaining)}</> : "بدون تقدير"}</div>
          <div className="text-muted-foreground tabular-nums">مسجّلة: {arPrayers(s.recorded)} في {arDays(s.loggedDays)}</div>
          {s.lastLoggedDay && <div className="text-muted-foreground">آخر تسجيل: {formatDayLong(fromKey(s.lastLoggedDay))}</div>}
        </>
      )}
    </div>
  );
}

export function Privacy() {
  const { state, actions } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const flash = (s: Status) => {
    setStatus(s);
    window.setTimeout(() => setStatus(null), 6000);
  };

  const applyRestore = (next: AppState) => {
    actions.replaceState(next);
    setPending(null);
    flash({ kind: "ok", text: "تمت استعادة خطتك بنجاح." });
  };

  const onRestore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { state: next, exportedAt } = await readBackupFile(file);
      const current = summarizePlan(state);
      const incoming = summarizePlan(next);
      // Nothing on this device worth protecting: restore straight away.
      if (current.empty) {
        applyRestore(next);
        return;
      }
      setPending({ state: next, exportedAt, incoming, current });
    } catch (e) {
      flash({ kind: "error", text: e instanceof Error ? e.message : "تعذّر قراءة الملف." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDelete = () => {
    if (!window.confirm("سيتم حذف خطتك وسجل تقدمك من هذا الجهاز نهائياً. هل تريد المتابعة؟")) return;
    actions.resetAll();
    flash({ kind: "ok", text: "تم حذف بياناتك من هذا الجهاز." });
  };

  const btn = "flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-6 py-3 bg-card border border-border rounded-xl font-semibold text-xs sm:text-sm text-center hover:bg-secondary transition-all";

  return (
    <section id="privacy" className="py-10 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="الخصوصية"
          title="خصوصيتك محفوظة"
          subtitle="لا تحتاج إلى إنشاء حساب أو إدخال بريد إلكتروني. يتم حفظ خطتك وتقدمك محلياً على جهازك فقط."
          className="mb-6 md:mb-16"
        />

        <div className="grid grid-cols-3 gap-3 md:gap-8 mb-8 md:mb-12">
          {BENEFITS.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-3 md:p-8 text-center hover:shadow-lg transition-all">
              <div className="w-11 h-11 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2.5 md:mb-5">
                <Icon className="w-5 h-5 md:w-7 md:h-7 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-sm md:text-xl font-bold text-foreground md:mb-2 leading-snug">{title}</h3>
              <p className="hidden md:block text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-4">
          <button type="button" onClick={() => downloadBackup(state)} className={btn}>
            <FileDown className="w-5 h-5 sm:w-4 sm:h-4 text-primary" aria-hidden="true" />
            <span className="sm:hidden">نسخ احتياطي</span><span className="hidden sm:inline">نسخ احتياطي لخطتي</span>
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={btn}>
            <RotateCcw className="w-5 h-5 sm:w-4 sm:h-4 text-primary" aria-hidden="true" />
            استعادة خطة
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-6 py-3 bg-card border border-destructive/30 text-destructive rounded-xl font-semibold text-xs sm:text-sm text-center hover:bg-destructive/5 transition-all"
          >
            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span className="sm:hidden">حذف البيانات</span><span className="hidden sm:inline">حذف بياناتي</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="اختر ملف النسخة الاحتياطية"
          onChange={(e) => void onRestore(e.target.files?.[0])}
          />
        {pending && (
          <div role="dialog" aria-labelledby="restore-title" className="mt-6 max-w-2xl mx-auto bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4 shadow-lg">
            <div>
              <h3 id="restore-title" className="text-lg font-bold text-foreground">استبدال خطتك الحالية؟</h3>
              <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                ستحل الخطة الموجودة في الملف محل كل ما هو محفوظ على هذا الجهاز، بما فيه سجل التقدم. لا يمكن التراجع إلا بنسخة احتياطية.
                {pending.exportedAt && <> صُدّر الملف في {dateTimeFmt.format(new Date(pending.exportedAt))}.</>}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SummaryColumn title="على هذا الجهاز الآن" s={pending.current} />
              <SummaryColumn title="في الملف" s={pending.incoming} highlight />
            </div>
            {pending.incoming.recorded < pending.current.recorded && (
              <p className="text-[13px] text-destructive">
                الملف يحوي تسجيلات أقل مما على جهازك بمقدار {fmt(pending.current.recorded - pending.incoming.recorded)} صلاة. خذ نسخة احتياطية من الحالية أولاً إن كنت غير متأكد.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button type="button" onClick={() => downloadBackup(state)} className="px-5 h-11 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-secondary">
                نسخة احتياطية من الحالية
              </button>
              <button type="button" onClick={() => setPending(null)} className="px-5 h-11 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-secondary">
                إلغاء
              </button>
              <button type="button" onClick={() => applyRestore(pending.state)} className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">
                استبدال والاستعادة
              </button>
            </div>
          </div>
        )}
        <p
          role="status"
          aria-live="polite"
          className={`text-center text-sm mt-5 min-h-5 ${status?.kind === "error" ? "text-destructive" : "text-primary"}`}
        >
          {status?.text ?? ""}
        </p>
        <p className="text-center text-[13px] text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          النسخة الاحتياطية ملف JSON صغير يُحفظ على جهازك. استخدمه للانتقال إلى جهاز آخر أو لحماية خطتك من حذف بيانات المتصفح.
        </p>
      </div>
    </section>
  );
}
