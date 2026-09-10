import { ArrowLeft } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-16 md:py-20 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-5 leading-snug">
          لديك خطة واضحة لما تستطيع فعله اليوم.
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/75 mb-8 md:mb-10 leading-relaxed">
          ابدأ بتقدير صلواتك وأنشئ خطتك الخاصة — بخصوصية تامة، بدون حساب.
        </p>
        <a
          href="#calculator"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 md:py-5 bg-background text-primary rounded-xl font-bold text-lg hover:bg-background/90 transition-all shadow-xl hover:shadow-2xl"
        >
          ابدأ حساب صلواتي
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </a>
        <p className="text-primary-foreground/50 mt-6 text-sm">بدون تسجيل — بدون بريد إلكتروني — بياناتك على جهازك</p>
      </div>
    </section>
  );
}
