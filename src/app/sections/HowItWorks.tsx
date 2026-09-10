import { BookOpen, Calendar, CheckSquare } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

const STEPS = [
  {
    num: "01",
    title: "احسب",
    body: "قدّر عدد الصلوات الفائتة بناءً على الفترة الزمنية التي تحددها. الأرقام تقريبية وقابلة للتعديل.",
    Icon: Calendar,
  },
  {
    num: "02",
    title: "خطّط",
    body: "حدد عدد صلوات القضاء التي تستطيع أداءها يومياً لكل صلاة. الخطة تتكيف مع جدولك.",
    Icon: BookOpen,
  },
  {
    num: "03",
    title: "تابع",
    body: "سجّل ما أنجزته يوماً بيوم، تابع تقدمك الإجمالي، واطبع خطتك على الورق إذا أردت.",
    Icon: CheckSquare,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/40 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="كيف يعمل" title="خطة واضحة في ثلاث خطوات" className="mb-10 md:mb-16" />
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(({ num, title, body, Icon }) => (
            <div key={num} className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute top-5 left-6 text-7xl font-bold text-border/60 select-none leading-none tabular-nums" aria-hidden="true">
                {num}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-loose text-sm">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
