import { BookOpen, Calculator, CheckSquare, HelpCircle, MoreHorizontal, Printer, Route, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../state";

interface Item {
  href: string;
  label: string;
  Icon: typeof CheckSquare;
}

const APP_ITEMS: Item[] = [
  { href: "#track", label: "اليوم", Icon: CheckSquare },
  { href: "#plan", label: "الخطة", Icon: BookOpen },
  { href: "#print", label: "طباعة", Icon: Printer },
  { href: "#privacy", label: "المزيد", Icon: MoreHorizontal },
];

const LANDING_ITEMS: Item[] = [
  { href: "#calculator", label: "ابدأ", Icon: Calculator },
  { href: "#how-it-works", label: "كيف يعمل", Icon: Route },
  { href: "#privacy", label: "الخصوصية", Icon: Shield },
  { href: "#faq", label: "الأسئلة", Icon: HelpCircle },
];

/** Phone-only bottom bar (hidden from lg up and in print). State-aware; highlights the section in view. */
export function MobileNav() {
  const { derived, state } = useApp();
  const items = state.calculated ? APP_ITEMS : LANDING_ITEMS;
  const [active, setActive] = useState<string>(items[0].href);

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(`#${e.target.id}`, e.isIntersecting ? e.intersectionRatio : 0);
        let best = "";
        let bestRatio = 0;
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            best = id;
            bestRatio = r;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-25% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  const total = derived.dailyTotal;
  const ratio = total ? Math.min(1, derived.todayDone / total) : 0;

  return (
    <nav
      aria-label="التنقل السريع"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, Icon }) => {
          const isActive = active === href;
          const showTicks = href === "#track" && state.calculated;
          return (
            <li key={href} className="relative">
              {isActive && <span aria-hidden="true" className="absolute top-0 inset-x-5 h-0.5 rounded-b-full bg-primary" />}
              <a
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 h-16 text-xs font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {label}
                {showTicks && (
                  <span className="flex gap-0.5 w-7 -mt-0.5" aria-label={`${Math.min(derived.todayDone, total)} من ${total} اليوم`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`h-0.5 flex-1 rounded-full ${ratio >= (i + 1) / 5 ? "bg-primary" : "bg-border"}`} />
                    ))}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
