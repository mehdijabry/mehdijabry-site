import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";

interface ScrambleTextProps {
  text: string;
  duration?: number;
  delay?: number;
  className?: string;
  as?: "span" | "div" | "h1" | "h2" | "p";
}

export function ScrambleText({
  text,
  duration = 900,
  delay = 200,
  className,
  as: Tag = "span",
}: ScrambleTextProps) {
  const [display, setDisplay] = useState<string>(() =>
    text
      .split("")
      .map((ch) => (ch === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
      .join("")
  );
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;

    const run = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out for the settle
      const eased = 1 - Math.pow(1 - progress, 3);
      const settledLen = Math.floor(eased * text.length);

      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < settledLen || text[i] === " ") {
          out += text[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(out);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(run);
      } else {
        setDisplay(text);
      }
    };

    timeoutRef.current = window.setTimeout(() => {
      frameRef.current = requestAnimationFrame(run);
    }, delay);

    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration, delay]);

  return (
    <Tag className={className} aria-label={text}>
      {display}
    </Tag>
  );
}
