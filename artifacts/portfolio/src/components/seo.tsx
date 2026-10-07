import { useEffect } from "react";
import { useLocation } from "wouter";
import { fiche, FICHE_INTROUVABLE, SITE, normaliser } from "@workspace/seo";
import { useLang } from "@/lib/i18n";

/**
 * Tient l'en-tête à jour quand on change de page sans recharger.
 *
 * Le serveur envoie déjà le bon titre, la bonne description et la bonne adresse canonique à la
 * première requête — c'est ce que lit un robot d'indexation. Mais ensuite la navigation se fait
 * en JavaScript : sans ce composant, l'onglet garderait le titre de la page d'arrivée pendant
 * toute la visite, et l'adresse canonique pointerait vers la mauvaise page si le visiteur
 * partageait le lien depuis un outil qui relit le DOM.
 *
 * Il ne rend rien. L'anglais ne change que ce que voit le visiteur : l'adresse canonique et les
 * données structurées restent celles que le serveur a posées, en français — le site n'a qu'une
 * adresse par page, et prétendre le contraire ferait plus de mal que de bien.
 */
export function Seo() {
  const [emplacement] = useLocation();
  const { lang } = useLang();

  useEffect(() => {
    const chemin = normaliser(emplacement || "/");
    const f = fiche(chemin) ?? FICHE_INTROUVABLE;
    const textes = lang === "en" && f.en ? f.en : { titre: f.titre, description: f.description };

    document.title = textes.titre;
    document.documentElement.lang = lang === "en" ? "en" : "fr";

    poser("meta[name='description']", "content", textes.description);
    poser("meta[property='og:title']", "content", textes.titre);
    poser("meta[property='og:description']", "content", textes.description);
    poser("meta[name='twitter:title']", "content", textes.titre);
    poser("meta[name='twitter:description']", "content", textes.description);

    const url = `${SITE.origine}${chemin === "/" ? "/" : chemin}`;
    poser("meta[property='og:url']", "content", url);
    if (!f.horsIndex) poser("link[rel='canonical']", "href", url);
  }, [emplacement, lang]);

  return null;
}

/** Met à jour une balise existante, ou la crée si le serveur ne l'a pas posée (cas du serveur de dev). */
function poser(selecteur: string, attribut: string, valeur: string) {
  let el = document.head.querySelector(selecteur);
  if (!el) {
    const estLien = selecteur.startsWith("link");
    el = document.createElement(estLien ? "link" : "meta");
    const cle = selecteur.match(/\[([^=]+)='([^']+)'\]/);
    if (cle) el.setAttribute(cle[1]!, cle[2]!);
    document.head.appendChild(el);
  }
  el.setAttribute(attribut, valeur);
}
