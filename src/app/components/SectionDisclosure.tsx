import { useEffect, useRef, type ReactNode } from "react";

/** Keep secondary tools compact, while preserving navigation to their anchors. */
export function SectionDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const reveal = (hash: string, scroll = false) => {
      const target = hash.startsWith("#") ? document.getElementById(hash.slice(1)) : null;
      if (!target || !ref.current?.contains(target)) return;
      ref.current.open = true;
      if (scroll) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    };
    const onHash = () => reveal(window.location.hash, true);
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (link) reveal(link.getAttribute("href") || "", true);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return (
    <details ref={ref} className="mx-4 sm:mx-6 lg:mx-auto lg:max-w-[calc(72rem-4rem)] mb-4 rounded-2xl border border-border bg-card overflow-hidden">
      <summary className="cursor-pointer px-5 py-5 font-semibold text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">{title}</summary>
      {children}
    </details>
  );
}
