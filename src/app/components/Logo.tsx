export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z"
            fill="white"
            fillOpacity="0.95"
          />
        </svg>
      </div>
      <span className="text-lg font-bold">خطة القضاء</span>
    </div>
  );
}
