import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/effects/reveal";
import { MaquetteViewer } from "@/components/maquette-viewer";

/**
 * Galerie « Réalisations » (2026-10-06) — les maquettes construites pour des commerces locaux, lues sur
 * GET /api/portfolio/maquettes (celles que l'admin n'a ni suspendues ni retirées du portfolio, la plus
 * récente en premier). Un clic ouvre la maquette DANS le site, dans une fenêtre (MaquetteViewer) : le
 * visiteur ne quitte jamais mehdijabry.dev. La miniature est une capture statique /maquettes/<slug>.jpg
 * (scripts/capture-maquettes.sh) ; sans capture, on affiche le nom du commerce sur un fond neutre.
 */
export type PortfolioMaquette = { slug: string; title: string; meta: string; url: string; proxyUrl: string; thumb: string };

async function fetchPortfolioMaquettes(): Promise<PortfolioMaquette[]> {
  const res = await fetch("/api/portfolio/maquettes");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PortfolioMaquette[];
}

export function usePortfolioMaquettes() {
  return useQuery({ queryKey: ["portfolio", "maquettes"], queryFn: fetchPortfolioMaquettes, staleTime: 60_000 });
}

function Thumb({ m }: { m: PortfolioMaquette }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6 bg-muted/40">
        <span className="font-serif italic text-2xl md:text-3xl text-center text-muted-foreground leading-tight">{m.title}</span>
      </div>
    );
  }
  return (
    <img
      src={m.thumb}
      alt={`${m.title} — page d'accueil`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
  );
}

export function MaquettesGallery({ limit }: { limit?: number }) {
  const q = usePortfolioMaquettes();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const all = q.data ?? [];
  const shown = limit ? all.slice(0, limit) : all;

  if (q.isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/40 border border-border/40" aria-busy>
        {Array.from({ length: limit ?? 8 }).map((_, i) => (
          <div key={i} className="bg-background">
            <div className="aspect-[16/10] bg-muted/30 animate-pulse" />
            <div className="p-4 md:p-5 space-y-2"><div className="h-4 w-2/3 bg-muted/40" /><div className="h-3 w-1/2 bg-muted/30" /></div>
          </div>
        ))}
      </div>
    );
  }
  if (q.isError) return <p className="text-sm text-muted-foreground">The gallery could not be loaded — please try again in a moment.</p>;
  if (all.length === 0) return <p className="text-sm text-muted-foreground">No mockup published yet.</p>;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/40 border border-border/40">
        {shown.map((m, i) => (
          <Reveal key={m.slug} delay={Math.min(i, 7) * 0.05} y={18}>
            <button
              type="button"
              onClick={() => setOpenSlug(m.slug)}
              className="group block w-full text-left bg-background hover:bg-muted/40 transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              aria-label={`Open the ${m.title} mockup`}
              data-testid={`button-maquette-${m.slug}`}
              data-magnetic
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                <Thumb m={m} />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 bg-background/30 backdrop-blur-[2px]">
                  <span className="chip bg-background/90 text-foreground">Open here ↗</span>
                </span>
              </div>
              <div className="p-4 md:p-5">
                <h3 className="font-display text-base md:text-xl tracking-[-0.02em] leading-tight transition-transform duration-500 group-hover:translate-x-1">{m.title}</h3>
                <p className="text-mark text-muted-foreground mt-1.5 truncate">{m.meta}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
      <MaquetteViewer items={all} slug={openSlug} onChange={setOpenSlug} />
    </>
  );
}
