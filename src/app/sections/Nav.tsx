import { Logo } from "../components/Logo";

const LINKS: [string, string][] = [
  ["#how-it-works", "كيف يعمل"],
  ["#calculator", "حساب الصلوات"],
  ["#plan", "الخطة"],
  ["#track", "المتابعة"],
  ["#privacy", "الخصوصية"],
  ["#faq", "الأسئلة الشائعة"],
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a href="#top" className="text-foreground" aria-label="خطة القضاء — الصفحة الرئيسية">
              <Logo />
            </a>
            <div className="hidden lg:flex items-center gap-6">
              {LINKS.map(([href, label]) => (
                <a key={href} href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>
          <a
            href="#calculator"
            className="px-4 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <span className="hidden sm:inline">ابدأ حساب صلواتي</span>
            <span className="sm:hidden">ابدأ الآن</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
