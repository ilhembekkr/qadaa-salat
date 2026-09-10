import { AppProvider } from "./state";
import { MobileNav } from "./components/MobileNav";
import { PrintSheet } from "./components/PrintSheet";
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

export default function App() {
  return (
    <AppProvider>
      <div className="app-screen min-h-screen bg-background text-foreground" dir="rtl">
        <Nav />
        <main>
          <Hero />
          <HowItWorks />
          <Calculator />
          <PlanBuilder />
          <DailyTracking />
          <PrintablePlanner />
          <Privacy />
          <About />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
        <MobileNav />
      </div>
      <PrintSheet />
    </AppProvider>
  );
}
