import { motion, useScroll, useTransform } from "framer-motion";

/**
 * FloatingMark — a giant typographic watermark of "M·J" that slowly drifts
 * with scroll. Lives at z-0, behind content. Pure-CSS / Framer-only.
 */
export function FloatingMark({
  className = "",
  text = "M · J",
}: {
  className?: string;
  text?: string;
}) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 6]);

  return (
    <motion.div
      aria-hidden
      style={{ y, rotate }}
      className={`pointer-events-none absolute inset-0 z-0 flex items-end justify-end overflow-hidden ${className}`}
    >
      <span
        className="font-display select-none leading-none"
        style={{
          fontSize: "clamp(220px, 38vw, 520px)",
          color: "transparent",
          WebkitTextStroke: "1px hsl(var(--foreground) / 0.07)",
          letterSpacing: "-0.06em",
          fontWeight: 600,
          paddingRight: "2vw",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}
