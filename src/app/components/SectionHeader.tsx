import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: "primary" | "accent";
  align?: "center" | "start";
  className?: string;
}

export function Pill({ children, tone = "primary", className = "" }: { children: ReactNode; tone?: "primary" | "accent"; className?: string }) {
  const cls = tone === "accent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary";
  return (
    <div className={`inline-block px-3.5 py-1.5 rounded-full ${cls} ${className}`}>
      <span className="text-xs sm:text-sm font-semibold">{children}</span>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, tone = "primary", align = "center", className = "" }: Props) {
  const alignCls = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      <div className="mb-3 md:mb-4">
        <Pill tone={tone}>{eyebrow}</Pill>
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground leading-snug mb-2 md:mb-4">{title}</h2>
      {subtitle && (
        <p className={`text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed ${alignCls}`}>{subtitle}</p>
      )}
    </div>
  );
}
