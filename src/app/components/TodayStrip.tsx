import { useEffect, useState } from "react";
import { useApp } from "../state";

/** Phone-only sticky strip shown once the tracker scrolls out of view (app mode). */
export function TodayStrip() {
  const { derived } = useApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById("track");
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const total = derived.dailyTotal;
  const done = Math.min(derived.todayDone, total);
  const ratio = total ? done / total : 0;

  return (
    <a
      href="#track"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`lg:hidden fixed top-16 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border px-4 h-10 flex items-center justify-between gap-3 text-sm transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      <span className="text-foreground tabular-nums">
        قضاء اليوم · <span className="font-semibold">{done} من {total}</span>
      </span>
      <span className="flex gap-1 w-24" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${ratio >= (i + 1) / 5 ? "bg-primary" : "bg-border"}`} />
        ))}
      </span>
    </a>
  );
}
