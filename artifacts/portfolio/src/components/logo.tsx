import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  alt?: string;
}

export function Logo({ className, alt = "Mehdi Jabry — Independent Web Studio" }: LogoProps) {
  return (
    <span className={cn("inline-block", className)}>
      <img
        src="/logo-light.svg"
        alt={alt}
        className="block dark:hidden h-full w-auto select-none"
        draggable={false}
      />
      <img
        src="/logo-dark.svg"
        alt={alt}
        className="hidden dark:block h-full w-auto select-none"
        draggable={false}
      />
    </span>
  );
}
