interface Props {
  className?: string;
  /** "dark" is the green tile (light backgrounds); "light" is the cream tile for the footer. */
  tone?: "dark" | "light";
}

/** Brand mark + wordmark. Icon sizes live in public/icons (masters: docs/brand/app-icon*.png). */
export function Logo({ className = "", tone = "dark" }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={tone === "light" ? "/icons/icon-light-144.png" : "/icons/icon-144.png"}
        alt=""
        width={36}
        height={36}
        decoding="async"
        className="w-9 h-9 rounded-xl flex-shrink-0 select-none"
        draggable={false}
      />
      <span className="text-lg font-bold">خطة القضاء</span>
    </div>
  );
}
