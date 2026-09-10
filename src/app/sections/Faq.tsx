import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "../components/SectionHeader";

const FAQS = [
  {
    q: "ماذا لو لم أتذكر تاريخ البلوغ بدقة؟",
    a: "لا بأس بذلك. أدخل تاريخاً تقريبياً ثم عدّل الأعداد يدوياً بعد الحساب. الأداة مصممة للتقدير وليس للدقة المطلقة.",
  },
  {
    q: "ماذا لو كنت أصلي أحياناً خلال تلك الفترة؟",
    a: "أضف الفترات التي كنت تصلي فيها كفترات مستثناة في الحاسبة، أو أنقص العدد يدوياً بعد الحساب. الأداة تعطيك نقطة بداية، وأنت من يقرر العدد النهائي.",
  },
  {
    q: "هل يمكنني تعديل عدد صلاة معينة؟",
    a: "نعم. بعد الحساب الأولي يمكنك زيادة أو إنقاص عدد كل صلاة بشكل منفصل، أو كتابة الرقم مباشرة.",
  },
  {
    q: "كيف يتم التعامل مع فترات الحيض والنفاس؟",
    a: "الصلاة غير واجبة في هذه الفترات، فلا قضاء لها. يمكنك إضافتها كفترات مستثناة في الحاسبة إن كنت تعرف تواريخها تقريبياً، أو إنقاص الأعداد يدوياً بما يناسبك.",
  },
  {
    q: "هل يجب أن أقضي نفس العدد كل يوم؟",
    a: "لا. الخطة مرنة تماماً. هدفك اليومي مرشد وليس إلزاماً، ويمكنك تسجيل أكثر أو أقل في أي يوم. تعديل الهدف لا يؤثر على ما سجّلته سابقاً.",
  },
  {
    q: "أين يتم حفظ بياناتي؟",
    a: "جميع بياناتك تُحفظ في متصفحك على هذا الجهاز فقط. لا يوجد خادم، ولا يُرسل أي شيء إلى أي جهة.",
  },
  {
    q: "ماذا يحدث إذا حذفت بيانات المتصفح؟",
    a: "ستُحذف خطتك معها. ننصحك بأخذ نسخة احتياطية من قسم الخصوصية بين وقت وآخر، وهي ملف صغير يُحفظ على جهازك.",
  },
  {
    q: "هل يمكنني نقل خطتي إلى جهاز آخر؟",
    a: "نعم. اضغط «نسخ احتياطي لخطتي» لتصدير ملف الخطة، ثم افتح الموقع على الجهاز الآخر واختر «استعادة خطة».",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-background scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="الأسئلة الشائعة" tone="accent" title="لديك أسئلة؟" className="mb-16" />
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            return (
              <div key={faq.q} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-sm transition-all">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full px-7 py-5 flex items-center justify-between text-right hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span className="font-semibold text-foreground text-base pl-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div id={panelId} hidden={!isOpen} className="px-7 pb-6">
                  <p className="text-muted-foreground leading-loose">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
