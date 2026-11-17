import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useLang } from "@/lib/i18n";
import { REGLES, accepte, lire, poser, poserPlausible, quandAccepte, surChangement, surOuverture, type Choix } from "@/lib/consentement";

/**
 * LE BANDEAU ET LE PANNEAU DE CONSENTEMENT (17/11/2026).
 *
 * Le texte est celui de Mehdi, mot pour mot. Trois boutons de même poids :
 * accepter, refuser, configurer — le refus coûte exactement un clic, comme
 * l'acceptation. Le panneau montre chaque chose que le site peut écrire,
 * rangée par catégorie, avec un interrupteur par catégorie non nécessaire.
 *
 * Il n'apparaît qu'après le montage, et une seconde après : l'ouverture
 * animée de l'accueil doit d'abord se jouer — un bandeau qui tombe au
 * milieu du monogramme serait la première chose vue du site.
 */
const COPY = {
  fr: {
    titre: "Avant de compiler la page : un mot sur mes cookies (les miens sont sans bugs).",
    corps: "Comme tout bon développeur, j'aime quand les choses tournent rond : code propre, chargement rapide et zéro mauvaise surprise. J'utilise quelques cookies pour assurer la fluidité de ce portfolio, mesurer l'audience de mes projets et optimiser l'expérience utilisateur.",
    corps2: "Ici, c'est vous qui avez les droits `admin` sur vos données : vous choisissez exactement ce que vous autorisez à s'exécuter.",
    accepter: "Tout accepter (`return true;`)",
    refuser: "Tout refuser (`return false;`)",
    configurer: "Configurer les paramètres (`config.json`)",
    doc: "Besoin de lire la documentation complète ? Consultez ma ",
    politique: "Politique de confidentialité",
    panneauTitre: "config.json — ce que ce site écrit dans votre navigateur",
    necessaire: "Nécessaires",
    necessaireDesc: "Toujours actifs : sans eux, le site ne fonctionne pas. Aucun ne vous suit.",
    mesure: "Mesure d'audience",
    mesureDesc: "Un script Plausible Analytics, chargé seulement si vous l'acceptez : il compte les visites sans cookie ni identifiant. Refusé, rien n'est chargé.",
    toujours: "toujours actif",
    enregistrer: "Enregistrer (`save`)",
    fermer: "Fermer",
    ou: { local: "stockage local", session: "stockage de session", cookie: "cookie", "*": "stockage" },
  },
  en: {
    titre: "Before compiling the page: a word about my cookies (mine are bug-free).",
    corps: "Like any good developer, I like things running smoothly: clean code, fast loading and no bad surprises. I use a few cookies to keep this portfolio fluid, measure the audience of my projects and improve the experience.",
    corps2: "Here, you hold the `admin` rights on your data: you choose exactly what is allowed to run.",
    accepter: "Accept all (`return true;`)",
    refuser: "Refuse all (`return false;`)",
    configurer: "Configure settings (`config.json`)",
    doc: "Need the full documentation? Read my ",
    politique: "Privacy policy",
    panneauTitre: "config.json — what this site writes in your browser",
    necessaire: "Necessary",
    necessaireDesc: "Always on: without them the site does not work. None of them follows you.",
    mesure: "Audience measurement",
    mesureDesc: "A Plausible Analytics script, loaded only if you accept it: it counts visits without cookies or identifiers. Refused, nothing is loaded.",
    toujours: "always on",
    enregistrer: "Save (`save`)",
    fermer: "Close",
    ou: { local: "local storage", session: "session storage", cookie: "cookie", "*": "storage" },
  },
};

/** « `code` » dans le texte devient une vraie balise code. */
function Code({ texte }: { texte: string }) {
  return <>{texte.split(/`([^`]+)`/g).map((p, i) => (i % 2 ? <code key={i}>{p}</code> : <span key={i}>{p}</span>))}</>;
}

export function Consentement() {
  const { lang } = useLang();
  const t = COPY[lang];
  const [choix, setChoix] = useState<Choix | null>(null);
  const [pret, setPret] = useState(false);
  const [panneau, setPanneau] = useState(false);
  const [mesure, setMesure] = useState(false);

  useEffect(() => {
    setChoix(lire());
    const minuterie = window.setTimeout(() => setPret(true), 1000);
    const stop1 = surChangement((c) => setChoix(c));
    const stop2 = surOuverture(() => { setMesure(accepte("mesure")); setPanneau(true); });
    const stop3 = quandAccepte("mesure", () => poserPlausible());
    return () => { window.clearTimeout(minuterie); stop1(); stop2(); stop3(); };
  }, []);

  useEffect(() => {
    if (!panneau) return;
    const clavier = (e: KeyboardEvent) => { if (e.key === "Escape") setPanneau(false); };
    window.addEventListener("keydown", clavier);
    return () => window.removeEventListener("keydown", clavier);
  }, [panneau]);

  const decider = (m: boolean) => { poser({ mesure: m }); setPanneau(false); };
  const montrerBandeau = pret && choix === null && !panneau;

  return (
    <>
      {montrerBandeau && (
        <aside className="cs-bandeau" role="dialog" aria-live="polite" aria-labelledby="cs-titre" data-consentement>
          <img className="cs-icone" src="/cookies.svg" alt="" width="48" height="48" />
          <h2 id="cs-titre" className="cs-titre">{t.titre}</h2>
          <p className="cs-corps">{t.corps}</p>
          <p className="cs-corps"><Code texte={t.corps2} /></p>
          <div className="cs-actions">
            <button type="button" className="cs-bouton" data-cs="accepter" onClick={() => decider(true)}><Code texte={t.accepter} /></button>
            <button type="button" className="cs-bouton" data-cs="refuser" onClick={() => decider(false)}><Code texte={t.refuser} /></button>
            <button type="button" className="cs-bouton" data-cs="configurer" onClick={() => { setMesure(false); setPanneau(true); }}><Code texte={t.configurer} /></button>
          </div>
          <p className="cs-doc">{t.doc}<Link href="/legal">{t.politique}</Link>.</p>
        </aside>
      )}

      {panneau && (
        <div className="cs-voile" onClick={(e) => { if (e.target === e.currentTarget) setPanneau(false); }}>
          <div className="cs-panneau" role="dialog" aria-modal="true" aria-labelledby="cs-panneau-titre">
            <div className="cs-panneau-tete">
              <h2 id="cs-panneau-titre" className="mono">{t.panneauTitre}</h2>
              <button type="button" className="cs-fermer" aria-label={t.fermer} onClick={() => setPanneau(false)}>×</button>
            </div>

            <section className="cs-categorie">
              <div className="cs-categorie-tete">
                <h3>{t.necessaire}</h3>
                <span className="mono cs-etat">{t.toujours}</span>
              </div>
              <p className="cs-categorie-desc">{t.necessaireDesc}</p>
              <ul className="cs-liste">
                {REGLES.filter((r) => r.categorie === "necessaire").map((r) => (
                  <li key={String(r.cle)}><code>{String(r.cle)}</code> · {t.ou[r.ou]} — {r.quoi[lang]}</li>
                ))}
              </ul>
            </section>

            <section className="cs-categorie">
              <div className="cs-categorie-tete">
                <h3>{t.mesure}</h3>
                <label className="cs-interrupteur">
                  <input type="checkbox" checked={mesure} onChange={(e) => setMesure(e.target.checked)} data-cs="mesure" />
                  <span className="cs-glissiere" aria-hidden="true" />
                </label>
              </div>
              <p className="cs-categorie-desc">{t.mesureDesc}</p>
              <ul className="cs-liste">
                {REGLES.filter((r) => r.categorie === "mesure").map((r) => (
                  <li key={String(r.cle)}><code>{String(r.cle)}</code> · {t.ou[r.ou]} — {r.quoi[lang]}</li>
                ))}
              </ul>
            </section>

            <div className="cs-actions">
              <button type="button" className="cs-bouton" data-cs="enregistrer" onClick={() => decider(mesure)}><Code texte={t.enregistrer} /></button>
              <button type="button" className="cs-bouton" data-cs="accepter" onClick={() => decider(true)}><Code texte={t.accepter} /></button>
              <button type="button" className="cs-bouton" data-cs="refuser" onClick={() => decider(false)}><Code texte={t.refuser} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
