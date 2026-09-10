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

  const btn = "flex items-center gap-2.5 px-6 py-3 bg-card border border-border rounded-xl font-semibold text-sm hover:bg-secondary transition-all";

  return (
    <section id="privacy" className="py-24 bg-background scroll-mt-16">
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
          className="mb-16"
        />

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {BENEFITS.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button type="button" onClick={() => downloadBackup(state)} className={btn}>
            <FileDown className="w-4 h-4 text-primary" aria-hidden="true" />
            نسخ احتياطي لخطتي
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={btn}>
            <RotateCcw className="w-4 h-4 text-primary" aria-hidden="true" />
            استعادة خطة
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="اختر ملف النسخة الاحتياطية"
            onChange={(e) => void onRestore(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2.5 px-6 py-3 bg-card border border-destructive/30 text-destructive rounded-xl font-semibold text-sm hover:bg-destructive/5 transition-all"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            حذف بياناتي
          </button>
        </div>
        <p
          role="status"
          aria-live="polite"
          className={`text-center text-sm mt-5 min-h-5 ${status?.kind === "error" ? "text-destructive" : "text-primary"}`}
        >
          {status?.text ?? ""}
        </p>
        <p className="text-center text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          النسخة الاحتياطية ملف JSON صغير يُحفظ على جهازك. استخدمه للانتقال إلى جهاز آخر أو لحماية خطتك من حذف بيانات المتصفح.
        </p>
      </div>
    </section>
  );
}
