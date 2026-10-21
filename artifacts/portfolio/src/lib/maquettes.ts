import { useQuery } from "@tanstack/react-query";

/**
 * Les maquettes construites pour des commerces locaux, lues sur
 * `GET /api/portfolio/maquettes` (celles que l'admin n'a ni suspendues ni
 * retirées du portfolio, la plus récente en premier).
 *
 * CE QUE CE MODULE NE FAIT PLUS, ET POURQUOI. Il vivait dans
 * `components/maquettes-gallery.tsx`, aux côtés d'une galerie et d'une fenêtre
 * qui ouvraient chaque maquette DANS le site. Mehdi, 21/10/2026 : « je veux que
 * tu caches cette partie maquettes du site, je ne veux pas que quelqu'un accède
 * à une maquette qui porte un nom légal ». Ces maquettes portent le nom, les
 * textes et l'identité de commerces qui n'ont rien demandé.
 *
 * La galerie, la page `/work` et la visionneuse ont donc été supprimées. Il ne
 * reste que cette lecture, pour les APERÇUS QUI FLOTTENT derrière le nom sur
 * l'accueil — ils montrent le travail, ils n'y conduisent pas : ce sont des
 * `<div>`, pas des liens, et `url` / `proxyUrl` ne sont utilisés nulle part.
 */
export type PortfolioMaquette = {
  slug: string;
  title: string;
  meta: string;
  url: string;
  proxyUrl: string;
  thumb: string;
};

async function fetchPortfolioMaquettes(): Promise<PortfolioMaquette[]> {
  const res = await fetch("/api/portfolio/maquettes");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PortfolioMaquette[];
}

export function usePortfolioMaquettes() {
  return useQuery({ queryKey: ["portfolio", "maquettes"], queryFn: fetchPortfolioMaquettes, staleTime: 60_000 });
}
