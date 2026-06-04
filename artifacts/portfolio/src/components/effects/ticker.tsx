import { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Ticker — oversized marquee row used as a section divider / brand banner.
 *
 * Plays both directions if `reverse`. Pauses on hover so the user can read.
 * Uses a CSS-driven double-track so the loop is seamless.
 */
interface TickerProps {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}

export function Ticker({
  children,
  duration = 35,
  reverse = false,
  className,
}: TickerProps) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <motion.div
        className="inline-flex gap-12 will-change-transform"
        animate={{ x: reverse ? ["−50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <div className="inline-flex gap-12 shrink-0">{children}</div>
        <div className="inline-flex gap-12 shrink-0" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
