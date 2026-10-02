import { SectionDisclosure } from "./components/SectionDisclosure";
import { AppProvider, useApp } from "./state";
import { MobileNav } from "./components/MobileNav";
import { PrintSheet } from "./components/PrintSheet";
import { StorageNotice } from "./components/StorageNotice";
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
      <StorageNotice />
      {app && <TodayStrip />}
      <main>
        <Hero />
        {!app && <HowItWorks />}
        <Calculator collapsed={app} />
        {app ? (
          <SectionDisclosure title="تعديل أهداف الخطة"><PlanBuilder /></SectionDisclosure>
        ) : <PlanBuilder />}
        {!app && <DailyTracking />}
        {app ? (
          <>
            <SectionDisclosure title="طباعة جدول القضاء"><PrintablePlanner /></SectionDisclosure>
            <SectionDisclosure title="الخصوصية والنسخ الاحتياطي"><Privacy /></SectionDisclosure>
            <SectionDisclosure title="عن التطبيق والأسئلة الشائعة"><About /><Faq /></SectionDisclosure>
          </>
        ) : (
          <>
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
