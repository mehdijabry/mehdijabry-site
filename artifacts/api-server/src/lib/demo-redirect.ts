import type { Request, Response } from "express";

/**
 * « /maquette-v1/:slug » (2026-10-02) — un lien de maquette montré au prospect doit pointer vers mehdijabry.dev,
 * pas vers un sous-domaine *.pages.dev : les guides anti-hameçonnage classent justement ces sous-domaines
 * d'hébergement gratuit comme un signal de méfiance pour un destinataire qui ne nous connaît pas encore.
 * Cette route fait la redirection ; elle est enregistrée avant le SPA catch-all dans app.ts.
 * Chaque maquette ajoutée doit être ajoutée ici (le nom à gauche est celui utilisé dans siteUrl/mockUrl).
 */
const DEMOS: Record<string, { target: string; title: string }> = {
  lebette: { target: "https://lebette-demo.pages.dev", title: "Le Bette" },
  orelys: { target: "https://orelys-demo.pages.dev", title: "Orélys" },
  delormier: { target: "https://delormier-demo.pages.dev", title: "Maison Parc Delormier" },
  chack: { target: "https://chack-demo.pages.dev", title: "Le Chack" },
  canadien: { target: "https://canadien-demo.pages.dev", title: "Motel Canadien" },
  bellefeuille: { target: "https://bellefeuille-demo.pages.dev", title: "Motel Bellefeuille" },
  trefle: { target: "https://trefle-demo.pages.dev", title: "Le Trèfle" },
  zenob: { target: "https://zenob-demo.pages.dev", title: "Café-Bar Zénob" },
  lepanetier: { target: "https://lepanetier-demo.pages.dev", title: "Le Panetier" },
  seaudecrabe: { target: "https://seaudecrabe-demo.pages.dev", title: "Seau de Crabe" },
  sacrecoeurcafe: { target: "https://sacrecoeurcafe-demo.pages.dev", title: "Café Sacré-Cœur" },
  ocentro: { target: "https://ocentro-demo.pages.dev", title: "O'Centro" },
  bistrohabibi: { target: "https://bistrohabibi-demo.pages.dev", title: "Bistro Habibi" },
  samson: { target: "https://samson-demo.pages.dev", title: "Chocolaterie Samson" },
  rubisushi: { target: "https://rubisushi-demo.pages.dev", title: "Rubi Sushi" },
  cafetm: { target: "https://cafetm-demo.pages.dev", title: "Café T&M" },
  saveursdumonde: { target: "https://saveursdumonde-demo.pages.dev", title: "Pâtisserie Saveurs du Monde" },
  encreur: { target: "https://encreur-demo.pages.dev", title: "L'Encreur Tatouage" },
};

// Les robots d'aperçu de lien (Gmail, iMessage, WhatsApp, Slack…) font une requête GET et lisent le HTML
// renvoyé — ils ne suivent pas forcément la redirection 302 jusqu'au site réel pour y lire ses balises
// og:*. Pour eux, on sert directement une page avec les bonnes balises (et son image) ; pour une vraie
// personne, on redirige tout de suite vers la maquette, sans étape intermédiaire visible.
const BOT_UA_RE = /facebookexternalhit|meta-externalagent|twitterbot|slackbot|whatsapp|telegrambot|discordbot|linkedinbot|applebot|skypeuripreview|imessage|pinterest|redditbot|vkshare|embedly|iframely|w3c_validator|googlebot|bingbot|yandex|mastodon|bluesky|gmailimageproxy|ggpht/i;

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

function ogHtml(opts: { title: string; description: string; image: string; url: string; redirectTo: string }): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Mehdi Jabry — Independent Web Studio">
<meta property="og:title" content="${esc(opts.title)}">
<meta property="og:description" content="${esc(opts.description)}">
<meta property="og:image" content="${esc(opts.image)}">
<meta property="og:url" content="${esc(opts.url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(opts.title)}">
<meta name="twitter:description" content="${esc(opts.description)}">
<meta name="twitter:image" content="${esc(opts.image)}">
<meta name="robots" content="noindex">
</head><body><p><a href="${esc(opts.redirectTo)}">${esc(opts.redirectTo)}</a></p></body></html>`;
}

/**
 * Rend absolue (vers `origin`) chaque référence relative href/src d'un document HTML — feuille de style,
 * scripts, images, favicon, et le lien « /admin » du pied de page. Les URL déjà absolues (http/https),
 * les ancres (#…) et mailto:/tel: ne sont pas touchées. Un seul passage regex : pas de dépendance à un
 * analyseur HTML pour un besoin aussi ciblé (ces gabarits n'ont que ce genre d'attributs à réécrire).
 */
function absolutize(html: string, origin: string): string {
  return html.replace(/((?:href|src)=")(?!https?:|\/\/|#|mailto:|tel:)([^"]*)(")/g, (_m, pre: string, path: string, post: string) => {
    const abs = path.startsWith("/") ? `${origin}${path}` : `${origin}/${path}`;
    return `${pre}${abs}${post}`;
  });
}

/**
 * Pour une vraie personne, on PROXIE le contenu de la maquette plutôt que de rediriger : l'adresse du
 * navigateur doit rester mehdijabry.dev/maquette-v1/<slug> (pas le sous-domaine *.pages.dev) — un lien de
 * maquette montré à un prospect ne doit jamais faire quitter notre propre domaine. Les ressources
 * (style.css, app.js, images) restent chargées depuis le sous-domaine *.pages.dev — un chargement de
 * ressource ne change pas l'adresse affichée, seule une navigation le ferait. Si la maquette ne répond
 * pas, on bascule sur l'ancienne redirection plutôt que d'afficher une page cassée.
 */
async function proxy(req: Request, res: Response, entry: { target: string; title: string }, suffix: string): Promise<void> {
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const upstream = `${entry.target}${suffix}${qs}`;
  try {
    const r = await fetch(upstream, { headers: { "user-agent": String(req.headers["user-agent"] ?? "") } });
    const html = await r.text();
    res.status(r.status).set("cache-control", "public, max-age=60").type("html").send(absolutize(html, entry.target));
  } catch {
    res.redirect(302, upstream);
  }
}

function respond(req: Request, res: Response, entry: { target: string; title: string } | undefined, suffix: string): void {
  if (!entry) {
    res.redirect(302, "/");
    return;
  }
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const redirectTo = `${entry.target}${suffix}${qs}`;
  const ua = String(req.headers["user-agent"] ?? "");
  if (BOT_UA_RE.test(ua)) {
    res.set("cache-control", "public, max-age=300");
    res.status(200).type("html").send(ogHtml({
      title: `${entry.title} — aperçu du site`,
      description: `Proposition de site web pour ${entry.title}, par Mehdi Jabry — Independent Web Studio.`,
      image: `${entry.target}/img/apercu-courriel.jpg`,
      url: `https://mehdijabry.dev${req.path}`,
      redirectTo,
    }));
    return;
  }
  void proxy(req, res, entry, suffix);
}

export function voirHandler(req: Request, res: Response): void {
  const slug = String(req.params["slug"] ?? "").toLowerCase().trim();
  respond(req, res, DEMOS[slug], "");
}

/** « /maquette-v1/:slug/admin » — même raisonnement, pour le lien vers l'espace d'administration de démonstration. */
export function voirAdminHandler(req: Request, res: Response): void {
  const slug = String(req.params["slug"] ?? "").toLowerCase().trim();
  respond(req, res, DEMOS[slug], "/admin/");
}
