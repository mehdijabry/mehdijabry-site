import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}

export function Marquee({
  children,
  duration = 40,
  reverse = false,
  className,
}: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`} aria-hidden>
      <motion.div
        className="flex w-max gap-12 whitespace-nowrap"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
