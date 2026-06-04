import { ReactNode } from "react";

/**
 * SmoothScrollProvider — currently a no-op pass-through.
 *
 * Lenis (smooth wheel interpolation) was removed: when the page already has
 * compositor work (WebGL aurora, motion reveals, custom cursor), Lenis's
 * extra interpolated frames amplify perceived lag rather than smoothing it.
 * Native macOS / Windows wheel scroll is the smoothest option here. Keeping
 * the provider component so the import in App.tsx stays stable; flip the
 * implementation back on if we ever change strategy.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
