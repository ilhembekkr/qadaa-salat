import { Logo } from "../components/Logo";

const LINKS: [string, string][] = [
  ["#about", "عن المشروع"],
  ["#method", "طريقة الحساب"],
  ["#privacy", "الخصوصية"],
  ["#faq", "الأسئلة الشائعة"],
];

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
          <div className="space-y-3 max-w-xs">
            <Logo />
            <p className="text-footer-foreground/55 text-sm leading-relaxed">
              أداة خاصة لتنظيم وتتبع صلوات القضاء. بياناتك على جهازك فقط.
            </p>
          </div>
          <nav aria-label="روابط التذييل">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {LINKS.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-footer-foreground/55 hover:text-footer-foreground transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-footer-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-footer-foreground/35 text-sm">خطة القضاء — أداة مجانية خاصة</p>
          <p className="text-footer-foreground/60 text-sm font-medium">خطوات صغيرة، واستمرار بإذن الله.</p>
        </div>
      </div>
    </footer>
  );
}
