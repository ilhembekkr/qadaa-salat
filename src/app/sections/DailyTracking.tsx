import { Pill } from "../components/SectionHeader";
import { ProgressTiles } from "../components/ProgressTiles";
import { TrackerCard } from "../components/TrackerCard";

/** Landing mode only: shows the real (interactive) tracker so visitors can try it. In app mode the hero owns the tracker. */
export function DailyTracking() {
  return (
    <section className="py-10 md:py-24 bg-background scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-4 md:space-y-7 order-2 lg:order-1">
            <Pill tone="accent">المتابعة اليومية</Pill>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground leading-snug">قضاء اليوم</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-loose">
              سجّل ما أنجزته بنقرة واحدة لكل صلاة. التقدم يُحفظ تلقائياً على جهازك.
            </p>
            <ProgressTiles />
            <p className="text-[13px] text-muted-foreground">
              يمكنك البدء بالتسجيل الآن، وستظهر نسبة الإكمال والمتبقي بعد{" "}
              <a href="#calculator" className="text-primary font-semibold hover:underline">حساب صلواتك</a>.
            </p>
          </div>
          <TrackerCard variant="live" id="track" className="order-1 lg:order-2" />
        </div>
      </div>
    </section>
  );
}
