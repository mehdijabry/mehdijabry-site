import { useEffect, useState } from "react";

interface LiveTimeProps {
  timezone?: string;
  label?: string;
  className?: string;
}

export function LiveTime({
  timezone = "America/Toronto",
  label = "Trois-Rivières",
  className,
}: LiveTimeProps) {
  const [time, setTime] = useState<string>(() => formatNow(timezone));

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(formatNow(timezone));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timezone]);

  return (
    <span className={className}>
      <span className="relative inline-flex h-1.5 w-1.5 mr-2 align-middle">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
      </span>
      {label} · {time}
    </span>
  );
}

function formatNow(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString();
  }
}
