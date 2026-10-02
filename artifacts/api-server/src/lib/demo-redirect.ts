import type { Request, Response } from "express";

/**
 * « /voir/:slug » (2026-10-02) — un lien de maquette montré au prospect doit pointer vers mehdijabry.dev,
 * pas vers un sous-domaine *.pages.dev : les guides anti-hameçonnage classent justement ces sous-domaines
 * d'hébergement gratuit comme un signal de méfiance pour un destinataire qui ne nous connaît pas encore.
 * Cette route fait juste la redirection ; elle est enregistrée avant le SPA catch-all dans app.ts.
 * Chaque maquette ajoutée doit être ajoutée ici (le nom à gauche est celui utilisé dans siteUrl/mockUrl).
 */
const DEMOS: Record<string, string> = {
  lebette: "https://lebette-demo.pages.dev",
  orelys: "https://orelys-demo.pages.dev",
  delormier: "https://delormier-demo.pages.dev",
  chack: "https://chack-demo.pages.dev",
  canadien: "https://canadien-demo.pages.dev",
  bellefeuille: "https://bellefeuille-demo.pages.dev",
  trefle: "https://trefle-demo.pages.dev",
  zenob: "https://zenob-demo.pages.dev",
  lepanetier: "https://lepanetier-demo.pages.dev",
  seaudecrabe: "https://seaudecrabe-demo.pages.dev",
  sacrecoeurcafe: "https://sacrecoeurcafe-demo.pages.dev",
  ocentro: "https://ocentro-demo.pages.dev",
  bistrohabibi: "https://bistrohabibi-demo.pages.dev",
};

export function voirHandler(req: Request, res: Response): void {
  const slug = String(req.params["slug"] ?? "").toLowerCase().trim();
  const target = DEMOS[slug];
  if (!target) {
    res.redirect(302, "/");
    return;
  }
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(302, `${target}${qs}`);
}

/** « /voir/:slug/admin » — même raisonnement, pour le lien vers l'espace d'administration de démonstration. */
export function voirAdminHandler(req: Request, res: Response): void {
  const slug = String(req.params["slug"] ?? "").toLowerCase().trim();
  const target = DEMOS[slug];
  if (!target) {
    res.redirect(302, "/");
    return;
  }
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(302, `${target}/admin/${qs}`);
}
