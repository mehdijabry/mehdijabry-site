import { Layout } from "@/components/layout/layout";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { CURRENCIES, convertCurrency } from "@/lib/pricing";

import { TiltCard } from "@/components/effects/tilt-card";
import { Reveal, RevealWords } from "@/components/effects/reveal";
import { CtaButton } from "@/components/effects/cta-button";
import { Ticker } from "@/components/effects/ticker";
import { MaquettesGallery, usePortfolioMaquettes } from "@/components/maquettes-gallery";
import { useCopy, useLang } from "@/lib/i18n";
import { BandeauVivant } from "@/components/effects/bandeau-vivant";
import { Halo } from "@/components/effects/halo";

/* ─────────────────────── DATA ─────────────────────── */

const TIERS = [
  { key: "spark", name: "Spark", priceCAD: 375, priceUSD: 290, recommended: false },
  { key: "vitrine", name: "Vitrine", priceCAD: 790, priceUSD: 590, recommended: true },
  { key: "vitrineplus", name: "Vitrine+", priceCAD: 1290, priceUSD: 950, recommended: false },
] as const;

const TECH_STACK = [
  "Next.js",
  "TypeScript",
  "Supabase",
  "Resend",
  "Cloudflare Workers",
  "Tailwind",
  "Framer Motion",
  "Lenis",
  "Postgres",
  "Stripe",
  "Render",
  "Vercel",
  "Figma",
  "shadcn/ui",
];

// `hidden` : un site livré mais hors ligne pour le moment reste ici (en bas), sans lien mort sur la page.
// Le numéro affiché est calculé sur les entrées visibles.
const FEATURED_WORK: { key: string; title: string; href: string; stack: string; hidden?: boolean }[] = [
  {
    key: "brooklyn",
    title: "Brooklyn Mobile Notary",
    href: "https://proposal.mehdijabry.dev/brooklyn-notary-x7k9p/",
    stack: "Next.js / Supabase / Resend / Cloudflare",
  },
  {
    key: "dsai",
    title: "DS AI Manager",
    href: "https://ds-ai-manager.com",
    stack: "Next.js / TS / Supabase / Stripe",
    hidden: true, // site hors ligne (404) le 06/10/2026 — remettre en ligne ici quand il répond
  },
  {
    key: "salwa",
    title: "Salwa El Jaouhari",
    href: "https://salwaeljaouhari.art",
    stack: "Next.js / TS / Tailwind",
    hidden: true, // site hors ligne (404) le 06/10/2026 — remettre en ligne ici quand il répond
  },
  {
    key: "ntaco",
    title: "Ntaco Construction",
    href: "https://proposal.mehdijabry.dev/ntaco-c9k4m/",
    stack: "Vite / React / Supabase / Tailwind",
    hidden: true, // proposal.mehdijabry.dev répond 503 le 06/10/2026 — remettre en ligne ici quand il répond
  },
];
const VISIBLE_WORK = FEATURED_WORK.filter((w) => !w.hidden);



/* ─────────────────────── COPY (FR / EN) ─────────────────────── */

const COPY = {
  fr: {
    booking: "Carnet ouvert · 3e trimestre 2026",
    studio: "Studio web indépendant",
    h1a: "Le vôtre est peut-être ",
    h1b: "déjà construit.",
    lede: "Plutôt qu'un devis, je livre une maquette. Des sites complets pour des commerces d'ici, construits avant le premier appel. Ouvrez-en un : il s'affiche ici même, sans quitter la page.",
    coteGauche: "(01) — Studio web indépendant",
    coteDroite: "Trois-Rivières, Québec",
    ctaStart: "Démarrer un projet", ctaStartHover: "On en parle",
    ctaWork: "Voir les réalisations", ctaWorkHover: "Montrez-moi",
    metaFrom: "À partir de", metaFromSub: "La première formule part en 24 à 48 h",
    metaStatus: "Statut", metaStatusSub: "Réponse en moins de 4 heures",
    metaStack: "Technologies", metaStackSub: "Sans serveur par défaut",
    metaWhere: "Où", metaWhereSub: "À distance, Europe et Amérique du Nord",
    tickerStudio: "Studio web indépendant", tickerSince: "depuis 2025",
    processChip: "(02) — Comment ça marche",
    processTitleA: "Trois jours. ", processTitleB: "Aucune ambiguïté.",
    processLede: "Une personne, un processus, une seule boîte de réception. Vous briefez le lundi, vous relisez chaque soir, le site est en ligne le mercredi. J'ai bâti ce système pour moi — je le mets à votre service.",
    process: [
      { day: "Jour 0", title: "Brief", body: "Appel de 30 minutes. Je note le périmètre, les échéances, les éléments à fournir. Vous repartez avec un compte rendu." },
      { day: "Jours 1–2", title: "Construction", body: "Next.js et Supabase sur mesure. Aperçu en ligne et vidéo chaque jour. Aucune surprise." },
      { day: "Jour 3", title: "Mise en ligne", body: "Déploiement sur Render ou votre infrastructure. Référencement, statistiques, supervision. Le code source est à vous." },
    ],
    workChip: "(03) — Réalisations",
    workTitleA: "Conçu de bout en bout. ", workTitleB: "En production.",
    workLede: "Des sites que j'ai livrés seul — conception, code, déploiement, textes. Chacun envoie de vrais courriels dans une vraie boîte de réception.",
    work: {
      brooklyn: { meta: "Service · Brooklyn, NY · 2026", blurb: "Site de notaire centré sur la prise de rendez-vous, avec tableau de bord et courriels Resend." },
      dsai: { meta: "Projet personnel · 2026", blurb: "Agent IA pour les équipes marketing — 13 compétences spécialisées." },
      salwa: { meta: "Portfolio artistique · Maroc · 2025", blurb: "Portfolio peinture et illustration — minimal, expressif." },
      ntaco: { meta: "Construction · Chypre · 2026", blurb: "Portfolio industriel haut de gamme, avec gestion de projets et suivi des demandes." },
    } as Record<string, { meta: string; blurb: string }>,
    localChip: "Commerces de proximité — Québec",
    localTitle: (n: number) => (n ? `${n} sites conçus avant le premier appel.` : "Des sites conçus avant le premier appel."),
    localLede: "Des propositions complètes et fonctionnelles pour de vrais commerces : boutiques, cafés, restaurants et gîtes. Cliquez sur l'un d'eux — il s'ouvre ici même, dans une fenêtre, sur ordinateur comme sur téléphone.",
    seeAll: (n: number) => `Voir les ${n} →`,
    pricingChip: "(04) — Tarifs",
    pricingTitleA: "Transparent. ", pricingTitleB: "Prévisible.",
    recommended: "Recommandé", shipsIn: "Livré en", choose: (n: string) => `Choisir ${n}`, get: (n: string) => `Prendre ${n}`,
    pricingNote: "Toutes les formules comprennent le code source · la configuration du domaine · 7 jours de soutien après la mise en ligne",
    tiers: {
      spark: { subtitle: "Page unique", delivery: "24–48 h", features: ["Page unique Next.js, entièrement sur mesure", "Formulaire transactionnel Resend", "Adapté au mobile + mode sombre", "1 série de corrections"] },
      vitrine: { subtitle: "Site vitrine", delivery: "3–5 jours", features: ["3 à 5 pages, formulaire Supabase + référencement", "Statistiques Plausible + plan de site", "Animations discrètes + typographie sur mesure", "2 séries de corrections"] },
      vitrineplus: { subtitle: "Site vitrine enrichi", delivery: "5–7 jours", features: ["5 à 7 pages + module de réservation", "Bilingue FR + EN", "Infolettre + espace d'administration", "Appel de démarrage de 45 minutes"] },
    } as Record<string, { subtitle: string; delivery: string; features: string[] }>,
    aboutChip: "(05) — À propos",
    aboutMark: ["Le vigneron boit", "son propre vin."],
    aboutBodyA: "Je suis ", aboutBodyB: ". Trois maîtrises, et une pratique de l'IA depuis 2023. Consultant marketing chez ",
    aboutBodyC: " tout en menant deux produits à moi : ds-ai-manager.com et ce studio.",
    aboutCta: "Mon parcours", aboutCtaHover: "Qui je suis",
    faqChip: "(06) — Questions",
    faqTitleA: "Questions ", faqTitleB: "fréquentes.",
    faq: [
      { q: "Qu'est-ce qui est vraiment compris dans chaque formule ?", a: "Une conception et un code sur mesure, le mode sombre par défaut, l'adaptation au mobile, le code source sur votre GitHub dès le premier jour, la configuration du domaine et 7 jours de soutien après la mise en ligne. Aucun gabarit, aucun constructeur de pages." },
      { q: "Est-ce que le code m'appartient ?", a: "Oui. Le dépôt est transféré sur votre GitHub à la livraison. Vous pouvez l'héberger, le modifier, ou confier son entretien à quelqu'un d'autre. Aucune dépendance à mon égard." },
      { q: "Et si vous dépassez l'échéance ?", a: "Je rembourse 50 $ CA par jour de retard jusqu'à la livraison. Ce n'est jamais arrivé — mais la clause est au contrat." },
      { q: "Puis-je héberger le site moi-même plutôt que sur Render ?", a: "Bien sûr. Je déploie là où ça vous arrange : Render, Vercel, Cloudflare Pages, Netlify, ou votre propre serveur." },
      { q: "Faites-vous des logos et de la rédaction ?", a: "Un polissage léger des textes, oui. L'identité de marque et la rédaction longue, non — je travaille avec deux designers de confiance si vous en avez besoin." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Stripe (carte, Apple Pay, Google Pay), Interac (Canada) ou virement. 50 % au démarrage et 50 % à la livraison pour Vitrine+ ; la totalité d'avance pour Spark et Vitrine." },
      { q: "Pourquoi vos prix sont-ils si accessibles comparés à une agence ?", a: "Je suis seul, avec une pile technique resserrée et un flux de travail accéléré par l'IA. Aucun chargé de compte, aucune présentation à rallonge, aucun contrat logiciel à répercuter. Vous payez la construction, pas l'agence." },
    ],
    contactChip: "(07) — Démarrer un projet",
    contactTitleA: "Vous briefez. ", contactTitleB: "Je construis.",
    contactLede: "Appel de découverte de 30 minutes. Si le courant passe, vous avez un brief le jour même et un site en ligne avant la fin de la semaine.",
    contactCta: "Configurer votre devis", contactCtaHover: "On s'y met",
    contactEmail: "Écrire directement", contactEmailHover: "Un petit mot",
    availability: "Disponible cette semaine",
    floatingMark: "On livre",
  },
  en: {
    booking: "Booking · Q3 2026",
    studio: "Independent Web Studio",
    h1a: "Yours may already be ",
    h1b: "built.",
    lede: "Instead of a quote, I deliver a mockup. Complete websites for local businesses, built before the first call. Open one — it loads right here, without leaving the page.",
    coteGauche: "(01) — Independent web studio",
    coteDroite: "Trois-Rivières, Quebec",
    ctaStart: "Start a project", ctaStartHover: "Let's talk",
    ctaWork: "See selected work", ctaWorkHover: "Show me",
    metaFrom: "From", metaFromSub: "Tier 1 ships in 24–48h",
    metaStatus: "Status", metaStatusSub: "Replies under 4 hours",
    metaStack: "Stack", metaStackSub: "Serverless by default",
    metaWhere: "Where", metaWhereSub: "Remote-first, EU + NA",
    tickerStudio: "Independent web studio", tickerSince: "since 2025",
    processChip: "(02) — How it works",
    processTitleA: "Three days. ", processTitleB: "Zero ambiguity.",
    processLede: "One person, one process, one inbox. You brief on Monday, you review every evening, you ship Wednesday. The system was built for me — I built the system for you.",
    process: [
      { day: "Day 0", title: "Brief", body: "30-minute call. I capture scope, deadlines, required assets. You leave with a writeup." },
      { day: "Day 1–2", title: "Build", body: "Custom Next.js + Supabase. Daily video + live preview. No surprises." },
      { day: "Day 3", title: "Ship", body: "Deploy on Render or your infra. SEO, analytics, monitoring. Source code yours." },
    ],
    workChip: "(03) — Selected work",
    workTitleA: "Built end-to-end. ", workTitleB: "Live in production.",
    workLede: "Sites I shipped solo — design, code, deploy, copy. Every one sends real emails to a real inbox today.",
    work: {
      brooklyn: { meta: "Service · Brooklyn, NY · 2026", blurb: "Booking-driven notary site with admin dashboard + Resend mailers." },
      dsai: { meta: "Personal · 2026", blurb: "AI agent for serious marketers — 13 specialised skills." },
      salwa: { meta: "Art portfolio · Morocco · 2025", blurb: "Painting & illustration portfolio — minimal, expressive." },
      ntaco: { meta: "Construction · Cyprus · 2026", blurb: "Industrial-premium portfolio with project CMS + lead pipeline." },
    } as Record<string, { meta: string; blurb: string }>,
    localChip: "Local businesses — Québec",
    localTitle: (n: number) => (n ? `${n} sites built before the first call.` : "Sites built before the first call."),
    localLede: "Complete, working proposals for real shops, cafés, restaurants and inns. Click one — it opens right here, in a window, on desktop or phone.",
    seeAll: (n: number) => `See all ${n} →`,
    pricingChip: "(04) — Pricing",
    pricingTitleA: "Transparent. ", pricingTitleB: "Predictable.",
    recommended: "Recommended", shipsIn: "Ships in", choose: (n: string) => `Choose ${n}`, get: (n: string) => `Get ${n}`,
    pricingNote: "All tiers include source code · domain setup · 7 days post-launch support",
    tiers: {
      spark: { subtitle: "Landing page", delivery: "24–48h", features: ["Single-page Next.js, fully custom", "Resend transactional form", "Mobile-responsive + dark mode", "1 revision round"] },
      vitrine: { subtitle: "Showcase site", delivery: "3–5 days", features: ["3–5 pages, Supabase form + SEO", "Plausible analytics + sitemap", "Subtle motion + custom typography", "2 revision rounds"] },
      vitrineplus: { subtitle: "Showcase Plus", delivery: "5–7 days", features: ["5–7 pages + booking module", "Bilingual FR + EN", "Newsletter signup + admin panel", "45-min onboarding call"] },
    } as Record<string, { subtitle: string; delivery: string; features: string[] }>,
    aboutChip: "(05) — About",
    aboutMark: ["The vintner drinks", "his own wine."],
    aboutBodyA: "I'm ", aboutBodyB: ". Three master's degrees, hands-on AI training since 2023. Marketing consultant at ",
    aboutBodyC: " while running two products of my own: ds-ai-manager.com and this studio.",
    aboutCta: "Full background", aboutCtaHover: "Meet Mehdi",
    faqChip: "(06) — FAQ",
    faqTitleA: "Common ", faqTitleB: "questions.",
    faq: [
      { q: "What's actually included in each tier?", a: "Custom design, custom code, dark mode by default, mobile responsive, source code on GitHub yours from day one, domain setup, and 7 days post-launch support. No templates, no page builders." },
      { q: "Do I own the code?", a: "Yes. The repository is transferred to your GitHub on delivery. You can host, fork, modify or hire someone else to maintain it. No vendor lock-in." },
      { q: "What if you miss the deadline?", a: "I refund the difference at C$50/day until delivery. It's never happened — but the policy is in the contract." },
      { q: "Can I host the site myself instead of using Render?", a: "Of course. I deploy to whatever fits your infrastructure: Render, Vercel, Cloudflare Pages, Netlify, even your own server." },
      { q: "Do you do logo design and copywriting?", a: "Light copy polish yes. Brand identity & long-form copywriting no — I partner with two designers I trust if you need it." },
      { q: "What payment methods do you accept?", a: "Stripe (card / Apple Pay / Google Pay), Interac (CA), or wire transfer. 50% to start, 50% on delivery for Vitrine+; full upfront for Spark & Vitrine." },
      { q: "Why is your pricing so accessible vs. agencies?", a: "I'm one person, with a tight stack and an AI-augmented workflow. No account managers, no slide decks, no SaaS contracts under my umbrella. You pay for the build, not the agency." },
    ],
    contactChip: "(07) — Start a project",
    contactTitleA: "You brief. ", contactTitleB: "I build.",
    contactLede: "30-minute discovery call. If we click, you have a brief the same day and a live site by the end of the week.",
    contactCta: "Configure your quote", contactCtaHover: "Build it now",
    contactEmail: "Email directly", contactEmailHover: "Say hi",
    availability: "Same-week availability",
    floatingMark: "Let's ship",
  },
};

/* ────────────────────── COMPONENT ────────────────────── */

export default function Home() {
  const { lang } = useLang();
  const t = useCopy(COPY);
  const maquettes = usePortfolioMaquettes();
  const nMaquettes = maquettes.data?.length ?? 0;
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>("CAD");

  function displayPrice(priceCAD: number, priceUSD: number): number {
    if (currency === "CAD") return priceCAD;
    return convertCurrency(priceUSD, currency);
  }

  return (
    <Layout>
      {/* ════════════════════════════════════════════════════════════
          L'ACCROCHE — « le vôtre est peut-être déjà construit »

          Le titre ne promet rien, il annonce un fait vérifiable deux écrans
          plus bas. « déjà construit » est posé sur un aplat d'encre : c'est le
          seul élément plein de la page, et le plein veut dire bâti.

          Pas d'effet de brouillage sur le titre : il affichait du charabia
          pendant presque une seconde, et sur le site d'un artisan du web la
          première impression ne peut pas être un texte cassé.
      ════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden pt-16 pb-14 md:pt-24 md:pb-20">
        <Halo />
        <div className="relative z-10 container mx-auto px-4 ouverture">

          {/* la cote de plan : l'étiquette mange le trait, comme sur un dessin technique */}
          <div className="cote mb-8 md:mb-10">
            <span className="cote__label" data-bloc data-delai="1">{t.coteGauche}</span>
            <span className="cote__trait" data-trait data-delai="1" />
            <span className="cote__label hidden sm:inline" data-bloc data-delai="1">{t.coteDroite}</span>
          </div>

          {/* la seule zone dorée de la page : trois données réellement allées chercher */}
          <div data-bloc data-delai="2">
            <BandeauVivant className="mb-7 md:mb-9" />
          </div>

          <h1
            className="text-display-xl text-[clamp(44px,8vw,122px)] max-w-[16ch]"
            data-bloc
            data-delai="3"
          >
            {t.h1a}
            <span className="inline-block bg-foreground text-background px-[0.14em] pb-[0.06em] -mx-[0.03em]">
              {t.h1b}
            </span>
          </h1>

          <div className="mt-8 md:mt-11 grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-10">
            <p
              className="lg:col-span-7 xl:col-span-6 max-w-[58ch] text-[17px] md:text-[19px] leading-[1.6] text-muted-foreground"
              data-bloc
              data-delai="4"
            >
              {t.lede}
            </p>
            <div
              className="lg:col-span-5 xl:col-span-6 flex flex-col sm:flex-row sm:items-center gap-3 lg:justify-end"
              data-bloc
              data-delai="5"
            >
              <CtaButton to="/start" variant="primary" hoverLabel={t.ctaStartHover} data-testid="link-hero-cta">
                {t.ctaStart}
              </CtaButton>
              <CtaButton href="#local-businesses" variant="ghost" hoverLabel={t.ctaWorkHover} data-testid="link-hero-work">
                {t.ctaWork}
              </CtaButton>
            </div>
          </div>

          <div className="cote mt-12 md:mt-16" data-bloc data-delai="6">
            <span className="cote__trait" data-trait data-delai="6" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LE MUR — remonté juste sous l'accroche (6 octobre 2026)

          C'est la preuve, elle ne peut pas attendre trois écrans. Le titre dit
          « peut-être déjà construit » ; la ligne suivante doit montrer le mur
          de ceux qui le sont. Ces miniatures sont le produit : sur l'ancien
          fond brun elles se noyaient, c'est l'autre raison du passage au clair.
      ════════════════════════════════════════════════════════════ */}
      <section id="local-businesses" className="relative scroll-mt-24 pb-16 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="cote mb-8 md:mb-10">
            <span className="cote__label">{t.localChip}</span>
            <span className="cote__trait" />
            <span className="cote__label hidden sm:inline tabular-nums">
              {nMaquettes ? `${String(nMaquettes).padStart(2, "0")} / ${String(nMaquettes).padStart(2, "0")}` : ""}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-12 md:items-end mb-8 md:mb-12">
            <Reveal className="md:col-span-7">
              <h2 className="text-display text-[clamp(30px,4vw,60px)]">
                {t.localTitle(nMaquettes)}
              </h2>
            </Reveal>
            <Reveal className="md:col-span-5" delay={0.1}>
              <p className="text-[15px] md:text-base leading-relaxed text-muted-foreground max-w-[46ch] md:ml-auto">
                {t.localLede}
              </p>
            </Reveal>
          </div>

          <MaquettesGallery limit={8} />

          {nMaquettes > 8 && (
            <div className="mt-6 flex justify-end">
              <a href="/work#local-businesses" className="lien font-mono text-[11px] uppercase tracking-[0.18em]" data-testid="link-all-maquettes">
                {t.seeAll(nMaquettes)}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LA MÉTHODE — une frise de temps, plus des cartons numérotés

          Le 01 / 02 / 03 est parti. Il n'encodait rien : trois nombres posés
          sur trois cartes parce que c'est ce que font toutes les pages de ce
          genre. Ce qui est vrai ici, c'est le TEMPS — jour 0, jours 1-2,
          jour 3 — et il était relégué en petit dans un coin. Il devient donc
          la structure : une frise, dont chaque étape est une graduation.
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-28 lg:py-36">
        <div className="container mx-auto px-4">
          <div className="cote mb-10 md:mb-14">
            <span className="cote__label">{t.processChip}</span>
            <span className="cote__trait" />
          </div>

          <div className="grid gap-10 md:grid-cols-12 mb-14 md:mb-20">
            <Reveal className="md:col-span-5">
              <h2 className="text-display text-[clamp(34px,4.4vw,68px)]">
                {t.processTitleA}{t.processTitleB}
              </h2>
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" delay={0.12}>
              <p className="text-[16px] md:text-[18px] leading-[1.65] text-muted-foreground max-w-[52ch]">
                {t.processLede}
              </p>
            </Reveal>
          </div>

          {/* La frise. Le trait horizontal porte les graduations ; chaque étape
              est ancrée dessus par son repère, comme sur une règle. */}
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-0">
            <span
              aria-hidden
              className="hidden md:block absolute left-0 right-0 top-[7px] h-px bg-trait-fort"
            />
            {t.process.map((etape, i) => (
              <Reveal key={etape.day} delay={i * 0.1}>
                <li className="relative md:pr-10">
                  <div className="flex items-center gap-3 md:block">
                    {/* le repère sur la règle */}
                    <span
                      aria-hidden
                      className="block h-[15px] w-px bg-foreground shrink-0 md:mb-5"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:block">
                      {etape.day}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-[28px] tracking-[-0.03em] mt-3 md:mt-4 mb-2.5">
                    {etape.title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.65] text-muted-foreground max-w-[38ch]">
                    {etape.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SELECTED WORK — editorial list, no thumbnails (yet)
      ════════════════════════════════════════════════════════════ */}
      <section id="work" className="relative py-16 md:py-28 lg:py-40 border-t border-border/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-24">
            <Reveal className="md:col-span-7">
              <div className="cote mb-6"><span className="cote__label">{t.workChip}</span><span className="cote__trait" /></div>
              <h2 className="text-display text-[clamp(40px,5vw,84px)] leading-[0.95]">
                {t.workTitleA}<span className="font-extrabold">{t.workTitleB}</span>
              </h2>
            </Reveal>
            <Reveal className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t.workLede}
              </p>
            </Reveal>
          </div>

          <div className="space-y-px bg-border/40 border border-border/40">
            {VISIBLE_WORK.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-background hover:bg-muted/40 transition-colors duration-500 group"
                  data-testid={`link-work-${w.title.toLowerCase().replace(/\s+/g, '-')}`}
                  data-magnetic
                >
                  <div className="container mx-auto px-5 md:px-10 py-6 md:py-10 grid grid-cols-12 gap-x-4 gap-y-3 items-baseline">
                    <span className="col-span-2 md:col-span-1 text-mark text-muted-foreground self-start mt-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="col-span-10 md:col-span-5">
                      <h3 className="font-display text-2xl md:text-4xl lg:text-5xl tracking-[-0.035em] flex items-baseline gap-3 transition-transform duration-500 group-hover:translate-x-2">
                        {w.title}
                        <span className="text-primary inline-block transition-transform duration-500 group-hover:rotate-45 text-xl md:text-2xl">↗</span>
                      </h3>
                      <p className="text-mark text-muted-foreground mt-2">{t.work[w.key]?.meta}</p>
                    </div>
                    <p className="col-span-10 col-start-3 md:col-span-4 md:col-start-auto text-sm text-muted-foreground leading-relaxed">
                      {t.work[w.key]?.blurb}
                    </p>
                    <p className="col-span-10 col-start-3 md:col-span-2 md:col-start-auto text-mark text-muted-foreground/80 md:text-right">
                      {w.stack}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          TICKER #2 — tech stack with italic dividers
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-10 md:py-14 border-y border-border/40 overflow-hidden bg-background/60">
        <Ticker duration={50}>
          {TECH_STACK.concat(TECH_STACK).map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="font-mono text-base md:text-xl tracking-[-0.01em] text-foreground/60 inline-flex items-center gap-12"
            >
              {t}
              <span className="text-primary text-2xl md:text-3xl">·</span>
            </span>
          ))}
        </Ticker>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PRICING — three tiers, ink-on-bone, currency toggle
      ════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-16 md:py-28 lg:py-40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16 md:mb-24 items-end">
            <Reveal className="md:col-span-7">
              <div className="cote mb-6"><span className="cote__label">{t.pricingChip}</span><span className="cote__trait" /></div>
              <h2 className="text-display text-[clamp(40px,5vw,84px)] leading-[0.95]">
                {t.pricingTitleA}<span className="font-extrabold">{t.pricingTitleB}</span>
              </h2>
            </Reveal>
            <Reveal className="md:col-span-5 flex md:justify-end" delay={0.15}>
              <CurrencyToggle currency={currency} setCurrency={setCurrency} />
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40 border border-border/40">
            {TIERS.map((tier) => {
              const price = displayPrice(tier.priceCAD, tier.priceUSD);
              return (
                <Reveal key={tier.key}>
                  <div
                    className={`relative h-full bg-background p-8 md:p-10 flex flex-col gap-6 transition-colors duration-500 ${
                      tier.recommended
                        ? "ring-1 ring-primary/40 bg-primary/[0.03]"
                        : "hover:bg-muted/40"
                    }`}
                    data-testid={`card-tier-${tier.key}`}
                  >
                    {tier.recommended && (
                      <div className="absolute -top-px right-6 bg-primary text-primary-foreground text-mark px-3 py-1">
                        {t.recommended}
                      </div>
                    )}
                    <div>
                      <p className="text-mark text-muted-foreground">{t.tiers[tier.key]!.subtitle}</p>
                      <h3 className="font-display text-5xl md:text-6xl mt-1 tracking-[-0.04em]">
                        {tier.name}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-[clamp(56px,8vw,96px)] leading-none tracking-[-0.045em]">
                        ${price}
                      </span>
                      <span className="text-mark text-muted-foreground">{currency}</span>
                    </div>
                    <p className="text-mark text-muted-foreground">
                      {t.shipsIn} {t.tiers[tier.key]!.delivery}
                    </p>
                    <ul className="space-y-3 mt-2 mb-8 flex-1">
                      {t.tiers[tier.key]!.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-3 text-sm text-foreground/80"
                        >
                          <span className="text-primary mt-1.5 shrink-0">→</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <CtaButton
                      to={`/start?tier=${tier.key}`}
                      variant={tier.recommended ? "primary" : "ghost"}
                      size="md"
                      hoverLabel={t.get(tier.name)}
                      data-testid={`button-select-${tier.key}`}
                    >
                      {t.choose(tier.name)}
                    </CtaButton>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.3}>
            <p className="mt-10 text-center text-mark text-muted-foreground">
              {t.pricingNote}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          ABOUT — editorial body, asymmetric grid
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-28 lg:py-40 border-t border-border/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <Reveal className="md:col-span-3">
              <div className="cote mb-6"><span className="cote__label">{t.aboutChip}</span><span className="cote__trait" /></div>
              <p className="text-mark text-muted-foreground">
                {t.aboutMark[0]}
                <br />
                {t.aboutMark[1]}
              </p>
            </Reveal>
            <Reveal className="md:col-span-9 md:col-start-4" delay={0.15}>
              <p className="font-display text-[clamp(28px,3.4vw,52px)] leading-[1.15] tracking-[-0.025em] text-foreground">
                {t.aboutBodyA}<span className="text-primary">Mohamed Mehdi Jabry</span>{t.aboutBodyB}
                <span className="underline decoration-primary/60 underline-offset-[6px] decoration-from-font">
                  Cradly UK
                </span>
                {t.aboutBodyC}
              </p>
              <div className="mt-12">
                <CtaButton to="/about" variant="ghost" size="md" hoverLabel={t.aboutCtaHover}>
                  {t.aboutCta}
                </CtaButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-28 lg:py-40 border-t border-border/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
            <Reveal className="md:col-span-4">
              <div className="cote mb-6"><span className="cote__label">{t.faqChip}</span><span className="cote__trait" /></div>
              <h2 className="text-display text-[clamp(40px,4.5vw,72px)] leading-[0.95]">
                {t.faqTitleA}<span className="font-extrabold">{t.faqTitleB}</span>
              </h2>
            </Reveal>
            <Reveal className="md:col-span-8" delay={0.15}>
              <Accordion type="single" collapsible className="w-full">
                {t.faq.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="border-border/40"
                  >
                    <AccordionTrigger className="text-left font-display text-lg md:text-2xl tracking-[-0.02em] hover:text-primary hover:no-underline py-6">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 pr-12">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FINAL CTA — full bleed with secondary aurora
      ════════════════════════════════════════════════════════════ */}
      <section id="contact" className="relative py-20 md:py-32 lg:py-48 border-t border-border/40 overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <Reveal>
            <div className="chip mx-auto mb-10 inline-flex border-foreground/25">
              {t.contactChip}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-display text-[clamp(48px,7vw,110px)] leading-[0.95] tracking-[-0.045em]">
              {t.contactTitleA}<span className="font-extrabold">{t.contactTitleB}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-10 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t.contactLede}
            </p>
          </Reveal>
          <Reveal delay={0.45}>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton to="/start" variant="primary" hoverLabel={t.contactCtaHover} data-testid="button-cta-quote">
                {t.contactCta}
              </CtaButton>
              <CtaButton href="mailto:contact@mehdijabry.dev" variant="ghost" hoverLabel={t.contactEmailHover} data-testid="button-cta-call">
                {t.contactEmail}
              </CtaButton>
            </div>
          </Reveal>
          {/* Même bandeau qu'en haut de page : les mêmes données, la même règle du doré.
              L'ancien bloc affichait une pastille verte et une horloge en double, hors palette. */}
          <Reveal delay={0.6}>
            <BandeauVivant className="mt-16 justify-center" />
          </Reveal>
        </div>
      </section>
    </Layout>
  );
}

/* ──────────────── helpers ──────────────── */

function Meta({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-mark text-muted-foreground/70">{label}</span>
      <span className="font-mono text-sm md:text-base text-foreground/90">
        {value}
      </span>
      {sub && (
        <span className="text-mark text-muted-foreground/60">{sub}</span>
      )}
    </div>
  );
}

function CurrencyToggle({
  currency,
  setCurrency,
}: {
  currency: keyof typeof CURRENCIES;
  setCurrency: (c: keyof typeof CURRENCIES) => void;
}) {
  return (
    <div className="inline-flex border border-border/60 rounded-full p-1 bg-background/60 ">
      {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          data-magnetic
          className={`px-4 py-2 text-mark rounded-full transition-colors duration-300 ${
            currency === c
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid={`button-currency-${c}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

/* TiltCard kept available in repo for re-use on /work pages */
void TiltCard;
void Link;
