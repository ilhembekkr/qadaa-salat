import { ArrowLeft } from "lucide-react";

/** Dots on the mark's arc as [angle in degrees (0 = right, clockwise), radius]. */
const MARK_DOTS: [number, number][] = [
  [-60, 2],
  [-42, 2.2],
  [-24, 2.4],
  [-6, 2.4],
  [12, 2.4],
  [29, 2.1],
];
const MARK_ARC = { cx: 51, cy: 51, r: 24.8 };

function onArc(deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [MARK_ARC.cx + MARK_ARC.r * Math.cos(a), MARK_ARC.cy + MARK_ARC.r * Math.sin(a)];
}

/**
 * Vector redraw of the app mark (crescent, hand, dotted arc) for the
 * watermark. The shipped icons are raster tiles, which would blur at this
 * size and bring their rounded square along.
 */
function MarkGlyph({ className = "" }: { className?: string }) {
  const [ax, ay] = onArc(-93);
  const [bx, by] = onArc(-78);
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <defs>
        <mask id="cta-mark-crescent">
          <circle cx="41" cy="52" r="25" fill="#fff" />
          <circle cx="49.5" cy="47" r="22" fill="#000" />
        </mask>
      </defs>
      <rect width="100" height="100" mask="url(#cta-mark-crescent)" />
      <circle cx="50" cy="52" r="3" />
      <line x1="50" y1="52" x2="63" y2="39" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />
      {MARK_DOTS.map(([deg, r]) => {
        const [x, y] = onArc(deg);
        return <circle key={deg} cx={x} cy={y} r={r} />;
      })}
    </svg>
  );
}

/**
 * Decorative layer behind the CTA copy (styles in final-cta.css). Phones keep
 * one disc, one orbit with its dot, the glow and the watermark; `md` and up
 * add the bottom-right pair and two small particles.
 */
function Backdrop() {
  return (
    <div className="cta-backdrop absolute inset-0 -z-10 pointer-events-none select-none" aria-hidden="true">
      <div className="cta-glow cta-breathe" />
      <div className="cta-disc cta-disc--tl" />
      <div className="cta-orbit cta-orbit--tl cta-sway">
        <span className="cta-orbit-dot" />
      </div>
      <div className="cta-sphere cta-drift hidden md:block" />
      <div className="cta-spark hidden md:block" />
      <div className="cta-disc cta-disc--br hidden md:block" />
      <div className="cta-orbit cta-orbit--br hidden md:block">
        <span className="cta-orbit-dot" />
      </div>
      <MarkGlyph className="cta-mark" />
    </div>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden py-16 md:py-20 bg-primary">
      <Backdrop />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-5 leading-snug">
          لديك خطة واضحة لما تستطيع فعله اليوم.
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/75 mb-8 md:mb-10 leading-relaxed">
          ابدأ بتقدير صلواتك وأنشئ خطتك الخاصة — بخصوصية تامة، بدون حساب.
        </p>
        <a
          href="#calculator"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 md:py-5 bg-background text-primary rounded-xl font-bold text-lg hover:bg-background/90 transition-all shadow-xl hover:shadow-2xl"
        >
          ابدأ حساب صلواتي
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </a>
        <p className="text-primary-foreground/50 mt-6 text-sm">بدون تسجيل — بدون بريد إلكتروني — بياناتك على جهازك</p>
      </div>
    </section>
  );
}
