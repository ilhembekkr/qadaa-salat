import { FileDown, HardDrive, Lock, RotateCcw, Shield, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { downloadBackup, readBackup } from "@/lib/storage";
import { useApp } from "../state";
import { SectionHeader } from "../components/SectionHeader";

const BENEFITS = [
  { Icon: Shield, title: "بدون حساب", desc: "لا تسجيل دخول، ولا بريد إلكتروني، ولا تتبّع." },
  { Icon: Lock, title: "بدون كلمة مرور", desc: "لا توجد بيانات حساب تُخترق أو تُنسى." },
  { Icon: HardDrive, title: "بياناتك على جهازك", desc: "جميع بياناتك تُخزَّن في متصفحك ولا تُرسَل لأي خادم." },
];

type Status = { kind: "ok" | "error"; text: string } | null;

export function Privacy() {
  const { state, actions } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);

  const flash = (s: Status) => {
    setStatus(s);
    window.setTimeout(() => setStatus(null), 6000);
  };

  const onRestore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = await readBackup(file);
      const hasData = state.calculated || Object.keys(state.log).length > 0;
      if (hasData && !window.confirm("سيتم استبدال خطتك الحالية بالخطة الموجودة في الملف. هل تريد المتابعة؟")) return;
      actions.replaceState(next);
      flash({ kind: "ok", text: "تمت استعادة خطتك بنجاح." });
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
          title={
            <>
              صلاتك أمر شخصي.
              <span className="block text-primary">وبياناتك كذلك.</span>
            </>
          }
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
