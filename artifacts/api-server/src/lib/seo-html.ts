import { readFileSync, statSync } from "node:fs";
import { DEMOS } from "./demo-redirect";
import { loadMaquetteStates, maquetteState } from "./maquettes";
import { PUBLIC_BASE_URL } from "./tracking";
import { enTete, fiche, planDuSite, type MaquettePourSeo } from "@workspace/seo";
import { logger } from "./logger";

/**
 * Réécriture de l'en-tête de `index.html`, page par page, avant l'envoi.
 *
 * Le site public est une application React servie en bloc : la même page HTML pour `/`, `/work`,
 * `/pricing`… Un robot d'indexation voyait donc un seul titre et une seule description pour tout le
 * site, et aucune adresse canonique. Il faut au moins 800 ko de JavaScript pour que la page
 * ressemble à quelque chose — Google sait le faire, mais au second passage, et sans garantie.
 *
 * Le fichier construit par Vite porte deux marques de commentaire autour de son bloc SEO. On le lit
 * une fois au démarrage, on le coupe en deux, et chaque requête recolle les deux moitiés autour des
 * balises de SA page. Coût : une concaténation de chaînes.
 *
 * Si les marques manquent — vieux build, fichier modifié à la main — on sert la page telle quelle
 * plutôt que de risquer une page blanche. Le journal le signale une seule fois.
 */

const MARQUE_DEBUT = "<!-- ══ seo ══";
const MARQUE_FIN = "<!-- ══ /seo ══ -->";

type Gabarit = { avant: string; apres: string; balise: boolean; dateModifiee: string };

let gabarit: Gabarit | null = null;

export function chargerGabarit(cheminIndexHtml: string): Gabarit {
  if (gabarit) return gabarit;
  const brut = readFileSync(cheminIndexHtml, "utf8");
  const dateModifiee = statSync(cheminIndexHtml).mtime.toISOString().slice(0, 10);
  const i = brut.indexOf(MARQUE_DEBUT);
  const j = brut.indexOf(MARQUE_FIN);
  if (i === -1 || j === -1 || j < i) {
    logger.warn(
      { cheminIndexHtml },
      "Marques SEO absentes de index.html — les pages partent toutes avec le même en-tête",
    );
    gabarit = { avant: brut, apres: "", balise: false, dateModifiee };
    return gabarit;
  }
  gabarit = {
    avant: brut.slice(0, i),
    apres: brut.slice(j + MARQUE_FIN.length),
    balise: true,
    dateModifiee,
  };
  return gabarit;
}

/**
 * Les réalisations publiées, dans la forme qu'attend le JSON-LD de `/work`.
 *
 * Même source que `GET /api/portfolio/maquettes` : une maquette suspendue ou retirée du portfolio
 * depuis `/admin/maquettes` disparaît de la page ET des données structurées au même instant. En
 * cas de panne de base, on renvoie une liste vide — une page sans liste vaut mieux qu'une page
 * qui annonce à Google des réalisations qui ne s'affichent pas.
 */
async function maquettesPubliees(): Promise<MaquettePourSeo[]> {
  try {
    const etats = await loadMaquetteStates();
    return Object.entries(DEMOS)
      .filter(([slug]) => {
        const e = maquetteState(etats, slug);
        return !e.suspendedAt && e.portfolio;
      })
      .map(([slug, d]) => ({
        slug,
        title: d.title,
        meta: d.meta,
        proxyUrl: `${PUBLIC_BASE_URL}/maquette-v1/${slug}`,
      }))
      .reverse();
  } catch (err) {
    logger.warn({ err }, "Liste des maquettes indisponible pour le JSON-LD de /work");
    return [];
  }
}

/** La page complète pour un chemin donné. */
export async function pagePour(cheminIndexHtml: string, chemin: string): Promise<string> {
  const g = chargerGabarit(cheminIndexHtml);
  if (!g.balise) return g.avant;
  const maquettes = chemin === "/work" ? await maquettesPubliees() : undefined;
  return g.avant + enTete(chemin, maquettes ? { maquettes } : {}) + g.apres;
}

/** `true` quand l'adresse n'existe pas : le serveur répond alors 404 au lieu d'un 200 trompeur. */
export function introuvable(chemin: string): boolean {
  return fiche(chemin) === null;
}

export function sitemap(cheminIndexHtml: string): string {
  return planDuSite(chargerGabarit(cheminIndexHtml).dateModifiee);
}
