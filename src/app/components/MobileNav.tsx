import { BookOpen, Calculator, CheckSquare, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../state";

const ITEMS = [
  { href: "#top", label: "الرئيسية", Icon: Home },
  { href: "#calculator", label: "الحساب", Icon: Calculator },
  { href: "#plan", label: "الخطة", Icon: BookOpen },
  { href: "#track", label: "اليوم", Icon: CheckSquare },
] as const;

/** Phone-only bottom bar (hidden from lg up and in print). Highlights the section in view. */
export function MobileNav() {
  const { derived, state } = useApp();
  const [active, setActive] = useState<string>("#top");

  useEffect(() => {
    const targets = ITEMS.map((i) => document.querySelector<HTMLElement>(i.href)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(`#${e.target.id}`, e.isIntersecting ? e.intersectionRatio : 0);
        let best = "#top";
        let bestRatio = 0;
        for (const [id, r] of visible) {
          if (r > bestRatio) {
            best = id;
            bestRatio = r;
          }
        }
        if (bestRatio > 0) setActive(best);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const todayLeft = Math.max(0, derived.dailyTotal - derived.todayDone);

  return (
    <nav
      aria-label="التنقل السريع"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map(({ href, label, Icon }) => {
          const isActive = active === href;
          const showBadge = href === "#track" && state.calculated && todayLeft > 0;
          return (
            <li key={href}>
              <a
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {showBadge && (
                    <span
                      className="absolute -top-1.5 -start-2 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] leading-4 text-center tabular-nums"
                      aria-label={`${todayLeft} صلوات متبقية اليوم`}
                    >
                      {todayLeft}
                    </span>
                  )}
                </span>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
