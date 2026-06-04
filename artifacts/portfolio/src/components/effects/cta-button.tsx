import { ReactNode, forwardRef } from "react";
import { Link } from "wouter";

/**
 * CtaButton — pill-shaped editorial CTA.
 *
 * Visual signature:
 *  - Black or accent pill, white text, arrow that translates + rotates on hover
 *  - On hover, an inner "ribbon" marquees the label horizontally so it reads
 *    like a typographic loop. The whole thing also gets a subtle scale.
 *
 * Variants:
 *  - "primary"  – solid primary fill (chartreuse on dark)
 *  - "ghost"    – outlined transparent
 *  - "ink"      – solid foreground/ink fill
 */
type Variant = "primary" | "ghost" | "ink";

interface CtaButtonProps {
  children: string;
  to?: string;
  href?: string;
  variant?: Variant;
  size?: "lg" | "md";
  className?: string;
  onClick?: () => void;
  "data-testid"?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground border-primary [&_.ribbon-fill]:bg-primary/80",
  ghost:
    "bg-transparent text-foreground border-border [&_.ribbon-fill]:bg-foreground/10",
  ink:
    "bg-foreground text-background border-foreground [&_.ribbon-fill]:bg-foreground/85",
};

export const CtaButton = forwardRef<HTMLElement, CtaButtonProps>(
  function CtaButton(
    {
      children,
      to,
      href,
      variant = "primary",
      size = "lg",
      className = "",
      onClick,
      ...rest
    },
    ref
  ) {
    const padding = size === "lg" ? "h-14 px-9 text-sm" : "h-11 px-6 text-xs";
    const classes = `
      group relative inline-flex items-center justify-center overflow-hidden
      rounded-full border ${padding} font-mono uppercase tracking-[0.18em]
      transition-transform duration-300 ease-out
      hover:-translate-y-0.5 active:translate-y-0
      ${variantClasses[variant]}
      ${className}
    `;

    const content = (
      <>
        {/* sliding fill layer (inverse on hover) */}
        <span
          aria-hidden
          className="ribbon-fill absolute inset-0 translate-x-[-101%] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-0"
        />
        {/* base label */}
        <span className="relative z-10 inline-flex items-center gap-3 whitespace-nowrap">
          <span className="relative inline-block overflow-hidden">
            {/* default label */}
            <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
              {children}
            </span>
            {/* hover label (rises from below) */}
            <span className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
              {children}
            </span>
          </span>
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-rotate-45"
          >
            →
          </span>
        </span>
      </>
    );

    const baseProps = {
      className: classes,
      "data-magnetic": "",
      onClick,
      ...rest,
    };

    if (to) {
      return (
        <Link
          href={to}
          {...(baseProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {content}
        </Link>
      );
    }
    if (href) {
      return (
        <a
          href={href}
          {...(baseProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        type="button"
        {...(baseProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        {content}
      </button>
    );
  }
);
