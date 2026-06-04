/**
 * FloatingMark — a giant typographic watermark of "M·J" used as a section
 * accent. Static (no scroll-driven re-renders) — paint-cheap. Lives at z-0
 * behind content.
 */
export function FloatingMark({
  className = "",
  text = "M · J",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 flex items-end justify-end overflow-hidden ${className}`}
    >
      <span
        className="font-display select-none leading-none"
        style={{
          fontSize: "clamp(220px, 38vw, 520px)",
          color: "transparent",
          WebkitTextStroke: "1.5px hsl(var(--foreground) / 0.14)",
          letterSpacing: "-0.06em",
          fontWeight: 700,
          paddingRight: "2vw",
        }}
      >
        {text}
      </span>
    </div>
  );
}
