import { useMemo } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Ouverture } from "@/components/instrument/ouverture";
import { Constellation, type Apercu } from "@/components/instrument/constellation";
import { usePortfolioMaquettes } from "@/components/maquettes-gallery";
import { useCopy, type Lang } from "@/lib/i18n";
import type { SectionRegle } from "@/components/layout/regle";

/**
 * L'ACCUEIL — « l'instrument », 21 octobre 2026.
 *
 * Portage de la maquette v2 (`site dev/mehdijabry-maquette-v2`). Quatre
 * repères, et ce sont ceux que gradue la règle de droite : studio, méthode,
 * tarifs, démarrer.
 *
 * CE QUI A DISPARU, ET C'EST UNE DÉCISION DE MEHDI, PAS UN OUBLI :
 * la galerie des maquettes. « Je ne veux pas que quelqu'un accède à une
 * maquette qui porte un nom légal » (21/10). Les aperçus continuent de flotter
 * derrière le nom — ils montrent le travail — mais ils ne sont plus des liens :
 * un clic les agrandit, il ne conduit nulle part. Voir `Constellation`.
 *
 * LES CHIFFRES SONT CEUX DE `/pricing`, et c'est la page des tarifs qui fait
 * foi : ici on résume, on ne redéclare pas. Trois formules, le détail là-bas.
 */

const SECTIONS: SectionRegle[] = [
  { id: "studio", fr: "Studio", en: "Studio" },
  { id: "methode", fr: "Méthode", en: "Process" },
  { id: "tarifs", fr: "Tarifs", en: "Pricing" },
  { id: "demarrer", fr: "Démarrer", en: "Get started" },
];

/* Les formes sont déclarées : sans elles, TypeScript infère des littéraux pour
   le français et refuse l'anglais, et surtout il infère une UNION pour les
   tableaux — `m.sup` n'existe alors sur aucun des membres. */
type Meta = { e: string; b: string; sup?: string; p: string };
type Etape = { bandeau: string; num: string; jour: string; h: string; p: string };
type Formule = { bandeau: string; num: string; delai: string; nom: string; prix: string; sup?: string; vedette?: boolean; lignes: string[]; cta: string };
type Copie = {
  sousTitre: [string, string];
  lede: string;
  cta: string;
  piedGauche: string;
  piedDroit: string;
  metas: Meta[];
  m: { num: string; note: string; titre: [string, string]; lede: string; etapes: Etape[] };
  t: { num: string; note: string; titre: [string, string]; formules: Formule[]; detail: string };
  d: { num: string; note: string; titre: [string, string]; lede: string; ecrire: string; infos: [string, string][] };
};

const COPY: Record<Lang, Copie> = {
  fr: {
    sousTitre: ["Le vôtre est peut-être ", "déjà construit."],
    lede: "Plutôt qu’un devis, je livre une maquette. Survolez-en une : c’est un vrai site, construit avant le premier appel.",
    cta: "Démarrer un projet",
    piedGauche: "(00) — Studio web indépendant",
    piedDroit: "Trois-Rivières, Québec",
    metas: [
      { e: "À partir de", b: "375 $", sup: "CA", p: "La première formule part en 24 à 48 h" },
      { e: "Statut", b: "Carnet ouvert", p: "Réponse en moins de 4 heures" },
      { e: "Technologies", b: "Next.js · Supabase", p: "Sans serveur par défaut" },
      { e: "Où", b: "À distance", p: "Europe et Amérique du Nord" },
    ],
    m: {
      num: "01 / Comment ça marche",
      note: "Une personne, une boîte de réception",
      titre: ["Trois jours. ", "Aucune ambiguïté."],
      lede: "Vous briefez le lundi, vous relisez chaque soir, le site est en ligne le mercredi. J’ai bâti ce système pour moi — je le mets à votre service.",
      etapes: [
        { bandeau: "Brief", num: "01", jour: "Jour 0", h: "Brief", p: "Appel de 30 minutes. Je note le périmètre, les échéances, les éléments à fournir. Vous repartez avec un compte rendu." },
        { bandeau: "Construction", num: "02", jour: "Jours 1–2", h: "Construction", p: "Next.js et Supabase sur mesure. Aperçu en ligne et vidéo chaque jour. Aucune surprise." },
        { bandeau: "Mise en ligne", num: "03", jour: "Jour 3", h: "Mise en ligne", p: "Déploiement sur Render ou votre infrastructure. Référencement, statistiques, supervision. Le code source est à vous." },
      ],
    },
    t: {
      num: "03 / Tarifs",
      note: "Code source · domaine · 7 jours de soutien",
      titre: ["Transparent. ", "Prévisible."],
      formules: [
        { bandeau: "Page unique", num: "01", delai: "Livré en 24–48 h", nom: "Spark", prix: "375 $", sup: "CA", lignes: ["Page unique Next.js, entièrement sur mesure", "Formulaire transactionnel Resend", "Adapté au mobile + mode sombre", "1 série de corrections"], cta: "Choisir Spark" },
        { bandeau: "Recommandé", num: "02", delai: "Livré en 3–5 jours", nom: "Vitrine", prix: "790 $", sup: "CA", vedette: true, lignes: ["3 à 5 pages, formulaire Supabase + référencement", "Statistiques Plausible + plan de site", "Animations discrètes + typographie sur mesure", "2 séries de corrections"], cta: "Choisir Vitrine" },
        { bandeau: "Site enrichi", num: "03", delai: "Livré en 5–7 jours", nom: "Vitrine+", prix: "1 290 $", sup: "CA", lignes: ["5 à 7 pages + module de réservation", "Bilingue FR + EN", "Infolettre + espace d’administration", "Appel de démarrage de 45 minutes"], cta: "Choisir Vitrine+" },
      ],
      detail: "Voir le détail des trois formules",
    },
    d: {
      num: "04 / Démarrer un projet",
      note: "Disponible cette semaine",
      titre: ["Vous briefez. ", "Je construis."],
      lede: "Appel de découverte de 30 minutes. Si le courant passe, vous avez un brief le jour même et un site en ligne avant la fin de la semaine.",
      ecrire: "Écrire directement",
      infos: [
        ["Courriel", "contact@mehdijabry.dev"],
        ["Téléphone", "438 525-7119"],
        ["Où", "Trois-Rivières, Québec"],
        ["Réponse", "Moins de 4 heures"],
        ["Langues", "Français · English · العربية"],
      ],
    },
  },
  en: {
    sousTitre: ["Yours may already be ", "built."],
    lede: "Instead of a quote, I deliver a mockup. Hover one — it is a real site, built before the first call.",
    cta: "Start a project",
    piedGauche: "(00) — Independent web studio",
    piedDroit: "Trois-Rivières, Quebec",
    metas: [
      { e: "From", b: "CA$375", p: "Tier one ships in 24–48h" },
      { e: "Status", b: "Booking open", p: "Replies under 4 hours" },
      { e: "Stack", b: "Next.js · Supabase", p: "Serverless by default" },
      { e: "Where", b: "Remote-first", p: "EU + North America" },
    ],
    m: {
      num: "01 / How it works",
      note: "One person, one inbox",
      titre: ["Three days. ", "Zero ambiguity."],
      lede: "You brief on Monday, you review every evening, you ship Wednesday. The system was built for me — I built the system for you.",
      etapes: [
        { bandeau: "Brief", num: "01", jour: "Day 0", h: "Brief", p: "30-minute call. I capture scope, deadlines and the assets you need to send. You leave with a writeup." },
        { bandeau: "Build", num: "02", jour: "Day 1–2", h: "Build", p: "Custom Next.js and Supabase. Live preview and a video every day. No surprises." },
        { bandeau: "Ship", num: "03", jour: "Day 3", h: "Ship", p: "Deployed to Render or your own infrastructure. SEO, analytics, monitoring. The source code is yours." },
      ],
    },
    t: {
      num: "03 / Pricing",
      note: "Source code · domain · 7 days of support",
      titre: ["Transparent. ", "Predictable."],
      formules: [
        { bandeau: "One page", num: "01", delai: "Ships in 24–48h", nom: "Spark", prix: "CA$375", lignes: ["One custom Next.js page", "Transactional form via Resend", "Mobile-ready + dark mode", "1 revision round"], cta: "Choose Spark" },
        { bandeau: "Recommended", num: "02", delai: "Ships in 3–5 days", nom: "Vitrine", prix: "CA$790", vedette: true, lignes: ["3–5 pages, Supabase form + SEO", "Plausible analytics + sitemap", "Subtle motion + custom type", "2 revision rounds"], cta: "Choose Vitrine" },
        { bandeau: "Full site", num: "03", delai: "Ships in 5–7 days", nom: "Vitrine+", prix: "CA$1,290", lignes: ["5–7 pages + booking module", "Bilingual FR + EN", "Newsletter + admin area", "45-minute kickoff call"], cta: "Choose Vitrine+" },
      ],
      detail: "See the three tiers in detail",
    },
    d: {
      num: "04 / Get started",
      note: "Available this week",
      titre: ["You brief. ", "I build."],
      lede: "A 30-minute discovery call. If it clicks, you get a brief the same day and a live site before the end of the week.",
      ecrire: "Email me directly",
      infos: [
        ["Email", "contact@mehdijabry.dev"],
        ["Phone", "438 525-7119"],
        ["Where", "Trois-Rivières, Quebec"],
        ["Reply", "Under 4 hours"],
        ["Languages", "Français · English · العربية"],
      ],
    },
  },
};

/** Les arcs : quatre valeurs de craie, seule l'opacité les distingue — c'est
 *  elle qui crée la profondeur. Mehdi, 21/10 : « on reste dans nos couleurs
 *  noir et blanc » (les arcs d'ArtCraft sont bleu, vert, indigo et rouge). */
function Arcs() {
  const anneaux = [
    { rx: 430, ry: 300, o: 0.16, d: 64, inv: false },
    { rx: 330, ry: 330, o: 0.1, d: 88, inv: true },
    { rx: 470, ry: 215, o: 0.07, d: 110, inv: false },
    { rx: 250, ry: 400, o: 0.05, d: 132, inv: true },
  ];
  return (
    <svg className="arcs" viewBox="0 0 1000 700" aria-hidden="true">
      {anneaux.map((a, i) => (
        <ellipse
          key={i}
          cx="500"
          cy="350"
          rx={a.rx}
          ry={a.ry}
          stroke="#F2F1EE"
          opacity={a.o}
          style={{
            transformOrigin: "500px 350px",
            animation: `tourne ${a.d}s linear infinite${a.inv ? " reverse" : ""}`,
          }}
        />
      ))}
    </svg>
  );
}

export default function Home() {
  const t = useCopy(COPY);
  const maquettes = usePortfolioMaquettes();

  /* Seize aperçus au plus : au-delà, l'anneau de 24 emplacements sature et les
     dalles se chevauchent. Celles sans capture sont écartées — une vignette
     vide dans la constellation se lit comme un trou, pas comme une discrétion. */
  const apercus = useMemo<Apercu[]>(
    () => (maquettes.data ?? []).filter((m) => m.thumb).slice(0, 16).map((m) => ({ titre: m.title, img: m.thumb })),
    [maquettes.data],
  );

  return (
    <Layout sections={SECTIONS}>
      <section className="ciel" id="studio">
        <Arcs />
        <Constellation apercus={apercus} />

        <div className="heros-texte">
          <Ouverture />
          <p className="sous-titre ouvre">
            {t.sousTitre[0]}
            <em>{t.sousTitre[1]}</em>
          </p>
          <p className="heros-lede ouvre">{t.lede}</p>
          <div className="actions ouvre">
            <Link href="/start" className="btn plein">
              {t.cta}
            </Link>
          </div>
        </div>

        <div className="heros-pied">
          <span className="mono">{t.piedGauche}</span>
          <span className="mono">{t.piedDroit}</span>
        </div>
      </section>

      <div className="cadre">
        <div className="metas">
          {t.metas.map((m) => (
            <div className="meta" key={m.e}>
              <span className="mono">{m.e}</span>
              <b>
                {m.b}
                {m.sup ? <sup>{m.sup}</sup> : null}
              </b>
              <p>{m.p}</p>
            </div>
          ))}
        </div>

        {/* ══ 01 — La méthode ══ */}
        <section className="section" id="methode">
          <div className="section-haut">
            <span className="mono">{t.m.num}</span>
            <span className="mono">{t.m.note}</span>
          </div>
          <div className="section-corps monte">
            <p className="titre">
              {t.m.titre[0]}
              <em>{t.m.titre[1]}</em>
            </p>
            <p className="lede">{t.m.lede}</p>
          </div>
          <div className="grille trois">
            {t.m.etapes.map((e) => (
              <div className="cellule" key={e.num}>
                <div className="cellule-bandeau">
                  <span>{e.bandeau}</span>
                  <span className="num">{e.num}</span>
                </div>
                <div className="etape">
                  <span className="mono jour">{e.jour}</span>
                  <h3>{e.h}</h3>
                  <p>{e.p}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 03 — Les tarifs. Le détail vit sur /pricing, qui fait foi. ══ */}
        <section className="section" id="tarifs">
          <div className="section-haut">
            <span className="mono">{t.t.num}</span>
            <span className="mono">{t.t.note}</span>
          </div>
          <div className="section-corps monte">
            <p className="titre">
              {t.t.titre[0]}
              <em>{t.t.titre[1]}</em>
            </p>
          </div>
          <div className="grille trois">
            {t.t.formules.map((f) => (
              <div className="cellule" key={f.nom}>
                <div className="cellule-bandeau">
                  <span>{f.bandeau}</span>
                  <span className="num">{f.num}</span>
                </div>
                <div className={`tarif${f.vedette ? " vedette" : ""}`}>
                  <span className="mono">{f.delai}</span>
                  <div className="tarif-nom">{f.nom}</div>
                  <div className="tarif-prix">
                    {f.prix}
                    {f.sup ? <sup>{f.sup}</sup> : null}
                  </div>
                  <ul>
                    {f.lignes.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  <Link href="/start" className={`btn${f.vedette ? " plein" : ""}`}>
                    {f.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="section-corps" style={{ paddingTop: 22, paddingBottom: 30 }}>
            <Link href="/pricing" className="btn">
              {t.t.detail}
            </Link>
          </div>
        </section>

        {/* ══ 04 — Démarrer ══ */}
        <section className="section" id="demarrer">
          <div className="section-haut">
            <span className="mono">{t.d.num}</span>
            <span className="mono">{t.d.note}</span>
          </div>
          <div className="contact">
            <div className="contact-bloc monte">
              <p className="titre">
                {t.d.titre[0]}
                <em>{t.d.titre[1]}</em>
              </p>
              <p className="lede">{t.d.lede}</p>
              <div className="actions" style={{ justifyContent: "flex-start" }}>
                <Link href="/start" className="btn plein">
                  {t.d.ecrire}
                </Link>
                <a className="btn" href="tel:+14385257119">
                  438 525-7119
                </a>
              </div>
            </div>
            <div className="contact-bloc">
              {t.d.infos.map(([k, v]) => (
                <div className="ligne-info" key={k}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
