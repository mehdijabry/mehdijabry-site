import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, ExternalLink, Monitor, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioMaquette } from "@/components/maquettes-gallery";

/**
 * La « bulle » (2026-10-06) : une maquette ouverte dans une fenêtre par-dessus le site, sans le quitter.
 * Une fenêtre de navigateur stylisée — barre d'adresse qui montre le lien mehdijabry.dev/maquette-v1/…,
 * vue ordinateur ou téléphone (390 px dans un cadre), précédent/suivant (aussi au clavier ← →), ouverture
 * dans un onglet, fermeture (Échap, croix, clic à côté). L'iframe charge l'hébergement réel de la maquette
 * avec ?src=portfolio : le suivi enregistre la visite sans la prendre pour celle du prospect.
 */
type Device = "desktop" | "mobile";
const ICON_BTN = "inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function MaquetteViewer({ items, slug, onChange }: { items: PortfolioMaquette[]; slug: string | null; onChange: (slug: string | null) => void }) {
  const index = items.findIndex((m) => m.slug === slug);
  const current = index >= 0 ? items[index] : null;
  const [device, setDevice] = useState<Device>("desktop");
  const [loaded, setLoaded] = useState(false);

  const go = useCallback((dir: 1 | -1) => {
    if (index < 0 || items.length < 2) return;
    onChange(items[(index + dir + items.length) % items.length]!.slug);
  }, [index, items, onChange]);

  useEffect(() => { setLoaded(false); }, [slug, device]);
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  const src = current ? `${current.url}/?src=portfolio` : undefined;

  return (
    <DialogPrimitive.Root open={Boolean(current)} onOpenChange={(open) => { if (!open) onChange(null); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed inset-0 z-[70] flex flex-col overflow-hidden border border-border bg-card shadow-2xl outline-none md:inset-x-6 md:inset-y-5 lg:inset-x-10 lg:inset-y-7 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300"
          data-testid="dialog-maquette"
        >
          {current && (
            <>
              <DialogPrimitive.Title className="sr-only">{current.title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">{current.meta} — mockup opened inside mehdijabry.dev.</DialogPrimitive.Description>

              {/* Barre de fenêtre */}
              <div className="flex items-center gap-1 md:gap-2 h-12 md:h-14 px-2 md:px-4 border-b border-border/60 bg-background/80 shrink-0">
                <div className="hidden md:flex items-center gap-1.5 mr-2" aria-hidden>
                  <span className="w-2.5 h-2.5 rounded-full bg-border" /><span className="w-2.5 h-2.5 rounded-full bg-border" /><span className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <button type="button" onClick={() => go(-1)} disabled={items.length < 2} className={ICON_BTN} aria-label="Previous mockup" data-testid="button-maquette-prev"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => go(1)} disabled={items.length < 2} className={ICON_BTN} aria-label="Next mockup" data-testid="button-maquette-next"><ChevronRight className="w-4 h-4" /></button>
                <div className="flex-1 min-w-0 flex items-center justify-center px-1">
                  <div className="flex items-center gap-2 max-w-full border border-border/60 bg-muted/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden />
                    <span className="truncate">{current.proxyUrl.replace(/^https?:\/\//, "")}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center border border-border/60" role="group" aria-label="Preview size">
                  <button type="button" onClick={() => setDevice("desktop")} aria-pressed={device === "desktop"} aria-label="Desktop view" className={cn("inline-flex items-center justify-center w-9 h-8 transition-colors", device === "desktop" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}><Monitor className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setDevice("mobile")} aria-pressed={device === "mobile"} aria-label="Phone view" className={cn("inline-flex items-center justify-center w-9 h-8 transition-colors", device === "mobile" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}><Smartphone className="w-4 h-4" /></button>
                </div>
                <a href={current.proxyUrl} target="_blank" rel="noopener noreferrer" className={ICON_BTN} aria-label="Open in a new tab" data-testid="link-maquette-newtab"><ExternalLink className="w-4 h-4" /></a>
                <DialogPrimitive.Close className={ICON_BTN} aria-label="Close" data-testid="button-maquette-close"><X className="w-5 h-5" /></DialogPrimitive.Close>
              </div>

              {/* La maquette */}
              <div className={cn("relative flex-1 min-h-0 bg-muted/20", device === "mobile" && "flex items-center justify-center p-4 md:p-6")}>
                <iframe
                  key={`${current.slug}-${device}`}
                  src={src}
                  title={current.title}
                  onLoad={() => setLoaded(true)}
                  allow="fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className={cn("bg-white", device === "desktop" ? "block w-full h-full" : "block w-[390px] max-w-full h-full max-h-[844px] border-[10px] border-foreground/90 rounded-[2.2rem] shadow-2xl")}
                />
                {!loaded && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-muted-foreground pointer-events-none" aria-live="polite">
                    <span className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
                    <span className="text-mark">Loading {current.title}…</span>
                  </div>
                )}
              </div>

              {/* Pied */}
              <div className="flex items-center justify-between gap-3 h-11 px-4 border-t border-border/60 bg-background/80 text-xs shrink-0">
                <div className="min-w-0 truncate">
                  <span className="font-display text-sm">{current.title}</span>
                  <span className="text-muted-foreground"> · {current.meta}</span>
                </div>
                <span className="text-mark text-muted-foreground tabular-nums shrink-0">{index + 1} / {items.length}</span>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
