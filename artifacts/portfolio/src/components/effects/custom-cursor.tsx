import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useSpring(cursorX, { stiffness: 350, damping: 28, mass: 0.5 });
  const ringY = useSpring(cursorY, { stiffness: 350, damping: 28, mass: 0.5 });

  const [variant, setVariant] = useState<"default" | "hover">("default");
  const [hidden, setHidden] = useState(true);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const touch = window.matchMedia("(hover: none)").matches;
    setIsTouch(touch);
    if (touch) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (hidden) setHidden(false);
    };

    const overInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        "a, button, [role='button'], [data-magnetic], input, textarea, select, [contenteditable='true']"
      );
      setVariant(interactive ? "hover" : "default");
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", overInteractive);

    const leave = () => setHidden(true);
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", overInteractive);
      document.removeEventListener("mouseleave", leave);
    };
  }, [cursorX, cursorY, hidden]);

  if (isTouch) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: variant === "hover" ? 0 : 1,
            opacity: hidden ? 0 : 1,
          }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="h-1.5 w-1.5 rounded-full bg-white"
        />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: variant === "hover" ? 1.6 : 1,
            opacity: hidden ? 0 : 1,
          }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="h-9 w-9 rounded-full border border-white/80"
        />
      </motion.div>
    </>
  );
}
