import { Router, type IRouter } from "express";
import { DEMOS } from "../lib/demo-redirect";
import { loadMaquetteStates, maquetteState } from "../lib/maquettes";
import { PUBLIC_BASE_URL } from "../lib/tracking";

/**
 * Portfolio public (2026-10-06) — GET /api/portfolio/maquettes, sans session.
 * La galerie « Réalisations » du site public y lit les maquettes à montrer : celles de DEMOS qui ne sont ni
 * suspendues ni retirées du portfolio depuis /admin/maquettes, la plus récente en premier. Le visiteur ouvre
 * chacune dans une fenêtre du site — un iframe sur l'hébergement réel (`url`), marqué ?src=portfolio pour
 * que le suivi ne le prenne pas pour le prospect (voir lib/tracking.ts). `proxyUrl` sert au bouton
 * « ouvrir dans un onglet ». La miniature est une capture statique posée par scripts/capture-maquettes.sh.
 */
const router: IRouter = Router();

export type PortfolioMaquette = { slug: string; title: string; meta: string; url: string; proxyUrl: string; thumb: string };

router.get("/portfolio/maquettes", async (_req, res) => {
  const states = await loadMaquetteStates();
  const list: PortfolioMaquette[] = Object.entries(DEMOS)
    .filter(([slug]) => { const s = maquetteState(states, slug); return !s.suspendedAt && s.portfolio; })
    .map(([slug, d]) => ({
      slug, title: d.title, meta: d.meta, url: d.target,
      proxyUrl: `${PUBLIC_BASE_URL}/maquette-v1/${slug}`, thumb: `/maquettes/${slug}.jpg`,
    }))
    .reverse();
  res.set("cache-control", "public, max-age=60").json(list);
});

export default router;
