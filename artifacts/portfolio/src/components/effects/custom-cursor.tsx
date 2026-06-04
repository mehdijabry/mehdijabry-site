import { useEffect, useRef } from "react";

/**
 * CustomCursor — a small bone-colored disc that becomes a ring when over
 * interactive elements. Position is pinned EXACTLY to the mouse via direct
 * DOM transform updates (rAF-throttled, no spring physics, no React state) —
 * this is the key fix vs the previous version: latency = 0.
 *
 * Personality lives in the size/border transition (180ms ease) when the
 * cursor enters an interactive element, not in any position lag.
 *
 * Hidden on touch devices and when the user prefers reduced motion.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let mx = 0;
    let my = 0;
    let raf: number | null = null;
    let mounted = false;

    const apply = () => {
      el.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      raf = null;
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!mounted) {
        mounted = true;
        el.style.opacity = "1";
      }
      if (raf === null) raf = requestAnimationFrame(apply);

      const t = e.target as HTMLElement | null;
      const isInteractive = !!t?.closest(
        'a, button, [role="button"], input, textarea, select, [data-magnetic]'
      );
      el.classList.toggle("is-hover", isInteractive);
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    const onEnter = () => {
      el.style.opacity = "1";
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="custom-cursor"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
        transform: "translate3d(0, 0, 0) translate(-50%, -50%)",
        willChange: "transform",
      }}
    />
  );
}
