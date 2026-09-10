import { ArrowLeft, Lock } from "lucide-react";
import { formatDayLong } from "@/lib/prayers";
import { useApp } from "../state";
import { PlanStrip } from "../components/PlanStrip";
import { ProgressTiles } from "../components/ProgressTiles";
import { TrackerCard } from "../components/TrackerCard";
import { WeekGlance } from "../components/WeekGlance";

/** Landing hero (no plan yet): marketing copy + read-only preview. */
function LandingHero() {
  return (
    <section id="top" className="relative overflow-hidden pt-8 pb-12 md:pt-20 md:pb-28">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-4 md:space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 bg-secondary rounded-full border border-primary/15">
              <Lock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold text-primary">بدون حساب — بياناتك محفوظة على جهازك</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-snug">
              رتّب قضاء صلواتك،
              <span className="block mt-1 text-primary">خطوة بخطوة</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-loose max-w-lg">
              احسب تقديراً لصلواتك الفائتة، أنشئ خطة قضاء تناسب وقتك، وتابع تقدمك بسهولة وخصوصية.
            </p>
            <div className="grid grid-cols-2 sm:flex gap-3 pt-1">
              <a
                href="#calculator"
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-8 h-12 sm:h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-sm sm:text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
              >
                ابدأ حساب صلواتي
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-3 sm:px-8 h-12 sm:h-14 bg-card border border-border text-foreground rounded-xl font-semibold text-sm sm:text-base hover:bg-secondary active:scale-[0.98] transition-all"
              >
                كيف يعمل؟
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl rounded-full pointer-events-none" />
            <TrackerCard variant="sample" className="relative shadow-2xl" />
            <p className="text-center text-[13px] text-muted-foreground mt-3">معاينة توضيحية — ستعرض خطتك الفعلية بعد الحساب</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** App hero (plan exists): the tracker is the first screen. Single write surface. */
function AppHero() {
  return (
    <section id="top" className="pt-4 pb-8 md:pt-12 md:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-start">
          <div className="lg:order-2 space-y-4">
            <h1 className="sr-only lg:hidden">قضاء اليوم — {formatDayLong(new Date())}</h1>
            <TrackerCard variant="live" id="track" />
            <PlanStrip />
          </div>

          <div className="lg:order-1 space-y-4 md:space-y-6">
            <div className="hidden lg:block space-y-3">
              <h1 className="text-5xl font-bold text-foreground leading-snug">قضاء اليوم</h1>
              <p className="text-lg text-muted-foreground leading-loose">
                سجّل ما أنجزته بنقرة واحدة لكل صلاة. التقدم يُحفظ تلقائياً على جهازك.
              </p>
            </div>
            <ProgressTiles />
            <div className="bg-card border border-border rounded-2xl px-4 py-3.5">
              <div className="text-xs font-semibold text-muted-foreground mb-3">هذا الأسبوع</div>
              <WeekGlance />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Hero() {
  const { state } = useApp();
  return state.calculated ? <AppHero /> : <LandingHero />;
}
