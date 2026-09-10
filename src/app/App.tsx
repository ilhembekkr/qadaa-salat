import { AppProvider, useApp } from "./state";
import { MobileNav } from "./components/MobileNav";
import { PrintSheet } from "./components/PrintSheet";
import { TodayStrip } from "./components/TodayStrip";
import { About } from "./sections/About";
import { Calculator } from "./sections/Calculator";
import { DailyTracking } from "./sections/DailyTracking";
import { Faq } from "./sections/Faq";
import { FinalCta } from "./sections/FinalCta";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { Nav } from "./sections/Nav";
import { PlanBuilder } from "./sections/PlanBuilder";
import { PrintablePlanner } from "./sections/PrintablePlanner";
import { Privacy } from "./sections/Privacy";

/**
 * Two entry states, one component tree.
 * landing (no plan yet): marketing order, tracker demo in its own section.
 * app (plan exists): tracker first, utilities next, marketing removed, calculator collapsed.
 */
function Page() {
  const { state } = useApp();
  const app = state.calculated;
  return (
    <div className="app-screen min-h-screen bg-background text-foreground" dir="rtl">
      <Nav />
      {app && <TodayStrip />}
      <main>
        <Hero />
        {app ? (
          <>
            <PlanBuilder />
            <PrintablePlanner />
            <Privacy />
            <Calculator collapsed />
            <About />
            <Faq />
          </>
        ) : (
          <>
            <HowItWorks />
            <Calculator />
            <PlanBuilder />
            <DailyTracking />
            <PrintablePlanner />
            <Privacy />
            <About />
            <Faq />
            <FinalCta />
          </>
        )}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Page />
      <PrintSheet />
    </AppProvider>
  );
}
