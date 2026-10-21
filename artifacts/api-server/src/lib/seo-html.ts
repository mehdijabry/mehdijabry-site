import { readFileSync, statSync } from "node:fs";
import { enTete, fiche, planDuSite } from "@workspace/seo";
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

/* LA LISTE DES MAQUETTES N'EST PLUS LUE ICI (21/10/2026).
   Elle alimentait le JSON-LD de `/work`, la page des réalisations. Mehdi a
   demandé de retirer cette partie du site : « je ne veux pas que quelqu'un
   accède à une maquette qui porte un nom légal ». La page a disparu, et avec
   elle l'ItemList qui donnait à Google l'adresse de chaque maquette. */

/** La page complète pour un chemin donné. */
export async function pagePour(cheminIndexHtml: string, chemin: string): Promise<string> {
  const g = chargerGabarit(cheminIndexHtml);
  if (!g.balise) return g.avant;
  return g.avant + enTete(chemin) + g.apres;
}

/** `true` quand l'adresse n'existe pas : le serveur répond alors 404 au lieu d'un 200 trompeur. */
export function introuvable(chemin: string): boolean {
  return fiche(chemin) === null;
}

export function sitemap(cheminIndexHtml: string): string {
  return planDuSite(chargerGabarit(cheminIndexHtml).dateModifiee);
}
