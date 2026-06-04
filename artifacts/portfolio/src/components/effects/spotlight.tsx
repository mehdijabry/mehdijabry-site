import { useEffect, useRef } from "react";

/**
 * Spotlight — a soft radial highlight that follows the cursor inside its
 * parent. Reveals the primary-color glow without affecting layout.
 *
 * Drop inside a `relative` container. Hidden on touch / reduced-motion.
 */
interface SpotlightProps {
  size?: number; // px diameter
  className?: string;
}

export function Spotlight({ size = 520, className }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parent = el.parentElement;
    if (!parent) return;

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 ${className ?? ""}`}
      style={{
        background: `radial-gradient(${size}px circle at var(--x, 50%) var(--y, 50%), hsl(var(--primary) / 0.18), transparent 60%)`,
      }}
    />
  );
}
