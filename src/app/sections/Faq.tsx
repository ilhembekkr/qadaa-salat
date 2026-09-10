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
    a: "نعم. بعد الحساب الأولي يمكنك زيادة أو إنقاص عدد كل صلاة بشكل منفصل، أو كتابة الرقم مباشرة. وفي المتابعة اليومية، كل ضغطة على مربع تسجّل صلاة واحدة أو تتراجع عن واحدة فقط.",
  },
  {
    q: "كيف يتم التعامل مع فترات الحيض والنفاس؟",
    a: "الصلاة غير واجبة في هذه الفترات، فلا قضاء لها. في الحاسبة، فعّل خيار «الحيض والنفاس» ضمن الفترات المستثناة: أدخل متوسط أيام الحيض في الشهر ليُقدَّر مجموعها تلقائياً، وأضف فترات النفاس بتواريخها التقريبية. ويبقى بإمكانك تعديل الأعداد النهائية يدوياً.",
  },
  {
    q: "هل يجب أن أقضي نفس العدد كل يوم؟",
    a: "لا. الخطة مرنة تماماً. هدفك اليومي للاسترشاد لا للإلزام، ويمكنك تسجيل أكثر أو أقل في أي يوم. تعديل الهدف لا يؤثر على ما سجّلته سابقاً.",
  },
  {
    q: "ماذا لو فاتتني صلوات بعد تاريخ الالتزام؟",
    a: "يمكنك في أي وقت زيادة عدد صلاة معينة من قسم «نتائج التقدير» (إعادة التقدير في وضع الخطة)، وسيُحدَّث المتبقي والمدة المتوقعة تلقائياً دون المساس بما سجّلته.",
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
    <section id="faq" className="py-10 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="الأسئلة الشائعة" tone="accent" title="لديك أسئلة؟" className="mb-6 md:mb-16" />
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
                    className="w-full px-5 md:px-7 py-4 md:py-5 flex items-center justify-between text-start hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span className="font-semibold text-foreground text-base pe-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div id={panelId} hidden={!isOpen} className="px-5 md:px-7 pb-5 md:pb-6">
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
