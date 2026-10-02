import type { CSSProperties } from "react";

type Tone = "green" | "gold";

/** Ellipse the spheres ride on. Lengths are % of the stage, tilt is degrees. */
interface Orbit {
  rx: number;
  ry: number;
  dx: number;
  dy: number;
  tilt: number;
  tone: Tone;
  dashed?: boolean;
  /** Only from `md` up — phones keep two orbits. */
  wide?: boolean;
}

interface Sphere {
  orbit: number;
  /** Start position along the orbit, 0–1. */
  phase: number;
  /** Seconds per revolution; spheres sharing an orbit share a period so they never pile up. */
  period: number;
  reverse?: boolean;
  tone: Tone;
  size: keyof typeof SIZE;
  glow?: boolean;
  wide?: boolean;
}

/** Static soft light spot; position and size are % of the stage. */
interface Glow {
  x: number;
  y: number;
  size: number;
  period: number;
  phase: number;
  wide?: boolean;
}

const ORBITS: Orbit[] = [
  { rx: 44, ry: 27, dx: 2, dy: 1, tilt: -22, tone: "green" },
  { rx: 47, ry: 29, dx: -2, dy: -2, tilt: 38, tone: "gold" },
  { rx: 56, ry: 44, dx: 4, dy: 3, tilt: -62, tone: "green", dashed: true, wide: true },
];

const SIZE = {
  xs: "w-1.5 h-1.5 md:w-2 md:h-2",
  sm: "w-2.5 h-2.5 md:w-3 md:h-3",
  md: "w-3.5 h-3.5 md:w-4 md:h-4",
  lg: "w-7 h-7",
} as const;

const SPHERES: Sphere[] = [
  { orbit: 0, phase: 0.08, period: 52, tone: "gold", size: "sm", glow: true },
  { orbit: 0, phase: 0.45, period: 52, tone: "green", size: "md" },
  { orbit: 0, phase: 0.7, period: 52, tone: "gold", size: "xs" },
  { orbit: 1, phase: 0.2, period: 64, reverse: true, tone: "green", size: "sm" },
  { orbit: 1, phase: 0.55, period: 64, reverse: true, tone: "gold", size: "md", glow: true },
  { orbit: 1, phase: 0.85, period: 64, reverse: true, tone: "green", size: "xs" },
  { orbit: 2, phase: 0.3, period: 80, tone: "green", size: "lg", wide: true },
  { orbit: 2, phase: 0.78, period: 80, tone: "gold", size: "lg", glow: true, wide: true },
  { orbit: 0, phase: 0.92, period: 52, tone: "gold", size: "xs", wide: true },
  { orbit: 1, phase: 0.4, period: 64, reverse: true, tone: "green", size: "xs", wide: true },
];

const GLOWS: Glow[] = [
  { x: 14, y: 66, size: 9, period: 7, phase: -2 },
  { x: 78, y: 20, size: 7, period: 8, phase: -5 },
  { x: 70, y: 84, size: 11, period: 9, phase: -1, wide: true },
  { x: 8, y: 26, size: 6, period: 6, phase: -3, wide: true },
];

const LAYER = "absolute inset-0";

const wide = (on?: boolean) => (on ? "hidden md:block" : "");

/**
 * One sphere on a tilted elliptical orbit, built from transforms only so the
 * browser can composite it. The tilted/squashed plane turns a circular spin
 * into an ellipse; the inner counter-spin and un-squash keep the sphere round.
 */
function Orbiter({ s }: { s: Sphere }) {
  const o = ORBITS[s.orbit];
  const k = o.ry / o.rx;
  const timing = { "--period": `${s.period}s`, "--phase": `${-s.phase * s.period}s` } as CSSProperties;
  const spin = (reverse?: boolean) => `${LAYER} hero-orbit-spin ${reverse ? "hero-orbit-spin--reverse" : ""}`;
  return (
    <div className={`${LAYER} ${wide(s.wide)}`} style={{ transform: `translate(${o.dx}%, ${o.dy}%) rotate(${o.tilt}deg) scaleY(${k})` }}>
      <div className={spin(s.reverse)} style={timing}>
        <div className={LAYER} style={{ transform: `translateX(${o.rx}%)` }}>
          <div className={spin(!s.reverse)} style={timing}>
            <div className={LAYER} style={{ transform: `scaleY(${1 / k}) rotate(${-o.tilt}deg)` }}>
              <span
                className={`hero-orbit-sphere hero-orbit-sphere--${s.tone} ${s.glow ? "hero-orbit-sphere--glow" : ""} ${SIZE[s.size]} absolute inset-0 m-auto`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Landing hero visual: the app mark on a soft disc, ringed by slow elliptical
 * orbits of green and gold spheres. Phones get two orbits and six spheres;
 * `md` and up add a third orbit, larger spheres and more depth.
 */
export function HeroOrbitVisual({ className = "" }: { className?: string }) {
  return (
    <div
      className={`hero-orbit relative mx-auto w-full max-w-[20rem] sm:max-w-[24rem] lg:max-w-[32.5rem] aspect-square select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="hero-orbit-blob absolute rounded-full" style={{ left: "-8%", top: "2%", width: "78%" }} />
      <div className="hero-orbit-blob hero-orbit-blob--sand absolute rounded-full" style={{ left: "46%", top: "42%", width: "62%" }} />
      <div className="hero-orbit-blob hero-orbit-blob--disc absolute rounded-full hidden md:block" style={{ left: "26%", top: "-12%", width: "58%" }} />

      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" fill="none">
        {ORBITS.map((o, i) => (
          <ellipse
            key={i}
            className={`hero-orbit-path hero-orbit-path--${o.tone} ${wide(o.wide)}`}
            cx={50 + o.dx}
            cy={50 + o.dy}
            rx={o.rx}
            ry={o.ry}
            transform={`rotate(${o.tilt} ${50 + o.dx} ${50 + o.dy})`}
            strokeDasharray={o.dashed ? "3 5" : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {GLOWS.map((g, i) => (
        <div
          key={i}
          className={`hero-orbit-glow hero-orbit-pulse absolute rounded-full ${wide(g.wide)}`}
          style={{ left: `${g.x}%`, top: `${g.y}%`, width: `${g.size}%`, "--period": `${g.period}s`, "--phase": `${g.phase}s` } as CSSProperties}
        />
      ))}

      {SPHERES.map((s, i) => (
        <Orbiter key={i} s={s} />
      ))}

      <div className="absolute inset-0 m-auto w-[46%] lg:w-1/2 aspect-square">
        <div className="hero-orbit-float relative w-full h-full">
          <div className="hero-orbit-halo absolute inset-[-22%] rounded-full" />
          <div className="hero-orbit-disc relative w-full h-full rounded-full overflow-hidden">
            <img
              src="/icons/hero-mark.webp"
              alt=""
              width={640}
              height={640}
              decoding="async"
              fetchPriority="high"
              draggable={false}
              className="block w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
