import { Calculator, Info } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-16 bg-secondary/40 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 flex gap-5">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-accent" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-3">قبل أن تبدأ</h3>
            <p className="text-muted-foreground leading-loose">
              تساعدك هذه الأداة على تقدير وتنظيم صلوات القضاء. قد تختلف بعض الأحكام والتفاصيل حسب الحالة والمذهب أو الفتوى
              التي تتبعها، لذلك يمكنك دائماً تعديل الأعداد والخطة بما يناسب حالتك. هذه أداة تنظيمية وليست خدمة إفتاء.
            </p>
          </div>
        </div>

        <div id="method" className="bg-card border border-border rounded-2xl p-8 flex gap-5 scroll-mt-20">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calculator className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-3">طريقة الحساب</h3>
            <ul className="text-muted-foreground leading-loose list-disc pr-5 space-y-1">
              <li>نحسب عدد الأيام بين تاريخ البلوغ التقريبي وتاريخ الالتزام بالصلاة.</li>
              <li>نطرح الفترات المستثناة التي تحددها وفترات النفاس، مع دمج الفترات المتداخلة.</li>
              <li>إذا فعّلت خيار الحيض، نقدّر أيامه بضرب متوسط الأيام الشهري في عدد أشهر الفترة المتبقية ونطرحها أيضاً.</li>
              <li>كل يوم متبقٍ يُحسب خمس صلوات، ويمكنك بعد ذلك تعديل عدد كل صلاة يدوياً.</li>
              <li>المدة المتوقعة لإكمال الخطة تُحدَّد بأطول صلاة: المتبقي منها مقسوماً على هدفها اليومي.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
