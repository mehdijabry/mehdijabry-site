import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { useCopy } from "@/lib/i18n";

/**
 * À propos — page de prose, donc entièrement pilotée par le dictionnaire plutôt que par du balisage
 * dupliqué en deux langues. Les segments **entre doubles astérisques** sortent en gras et ceux _entre
 * tirets bas_ en italique ; c'est tout ce dont le texte a besoin.
 *
 * Le lien vers ds-ai-manager.com a été retiré le 06/10/2026 (le site répond 404) : le projet reste
 * mentionné, sans lien mort. La ville a été corrigée en Trois-Rivières, conforme aux réglages de
 * production et au reste du site.
 */
const COPY = {
  fr: {
    eyebrow: "Fondateur",
    title: "À propos",
    tagline: "Le développeur qui livre en 72 heures.",
    role: "Fondateur · Studio web indépendant",
    intro: [
      "Je m'appelle Mohamed Mehdi Jabry, 35 ans. Basé à Trois-Rivières, au Québec.",
      "Trois maîtrises : gestion d'entreprise, marketing de marque, gestion de projet. Aucune en informatique. J'ai appris à coder comme j'ai appris tout le reste qui en valait la peine — _parce que j'avais quelque chose à livrer, et qu'attendre après quelqu'un d'autre n'était plus une option._",
    ],
    pathTitle: "Mon parcours",
    path: [
      "**2021–2024.** J'ai travaillé dans plusieurs secteurs — marketing, opérations, conseil. Je cherchais la bonne combinaison de compétences pour faire ce qui m'intéressait vraiment. Ces années m'ont surtout appris ce que je ne voulais pas faire.",
      "**2023.** Je me suis plongé dans l'IA. Pas en utilisateur, en opérateur : formation, certifications, projets concrets. Le rythme du domaine m'a dit une chose clairement — l'écart entre ce que l'IA sait faire et ce que les entreprises livrent réellement va se creuser. Ceux qui savent combler cet écart seront recherchés.",
      "**2025 à aujourd'hui.** J'ai rejoint Cradly UK comme consultant marketing, responsable de la stratégie sur les réseaux sociaux et de l'automatisation par IA : je construis des compétences sur mesure alignées sur l'identité et les processus de la marque. De l'IA en production, pas des démonstrations — des agents qui produisent des livrables publiables tels quels.",
      "**2025.** J'ai lancé ds-ai-manager.com, un agent IA packagé pour les équipes marketing. Treize compétences spécialisées, conscientes de la marque, avec validation des sources. La preuve que je sais transformer des flux d'IA complexes en un produit cohérent, et pas seulement en automatisations isolées.",
      "**2026.** J'ai lancé ce studio, mehdijabry.dev. Le bras exécutant de tout ce qui précède, concentré sur une chose : livrer des sites — pages de lancement, sites vitrines et présences en ligne pour petites équipes, en ligne en quelques jours plutôt qu'en quelques semaines.",
    ],
    whyTitle: "Pourquoi j'ai lancé ce studio",
    whyIntro: "J'ai vu trop de petits commerces et de fondateurs indépendants se faire servir le mauvais deal :",
    why: [
      "Payer **4 000 $ pour un site WordPress livré en 8 semaines** qu'ils auraient pu monter eux-mêmes en un week-end.",
      "Engager des « indépendants rapides » et recevoir un gabarit Webflow avec trois couleurs changées.",
      "Subir une **consultation payante à 500 $** avec une agence québécoise avant même d'obtenir un prix.",
    ],
    whyClose: "La voie du milieu — rapide, sur mesure, à prix affiché, livrée en quelques jours — n'existe pas pour la plupart des clients. _C'est exactement ce studio._",
    howTitle: "Comment je travaille",
    how: [
      "**Pas de brief flou.** Pas de brief clair, pas de devis. Cette règle m'a coûté trois contrats. Je la garde.",
      "**Code source transféré sur votre GitHub le jour de la livraison.** Ce n'est ni une option, ni un supplément, ni une ligne en petits caractères.",
      "**Aucun constructeur de pages. Ni Wix, ni Squarespace.** Du React sur mesure, à chaque fois. Le code est à vous : portable, lisible, modifiable.",
      "**La qualité avant le volume.** Je préfère livrer cette semaine un site qui convertit vraiment que trois sites qui ont l'air « corrects » et ne convertissent pas.",
    ],
    mapTitle: "Ce que mon parcours apporte à votre site",
    mapIntro: "Je n'ai pas pris le chemin habituel pour arriver au développement web. Le détour s'est avéré utile.",
    map: [
      { icon: "📊", title: "Maîtrise en gestion d'entreprise", body: "Je comprends ce qu'un site doit réellement faire pour votre commerce : amener des demandes, remplir un carnet de rendez-vous, vendre — pas seulement bien paraître." },
      { icon: "🎯", title: "MBA en marketing de marque", body: "Je lis votre marque comme un système cohérent avant de toucher au code. Identité visuelle, ton, positionnement : ce sont eux qui dictent la structure, et non l'inverse." },
      { icon: "⚙️", title: "Maîtrise en gestion de projet", body: "Une livraison en 72 heures n'arrive pas par hasard. Elle arrive parce que le périmètre est précis, le processus pensé, et les dépendances cartographiées avant le jour zéro." },
      { icon: "🤖", title: "Exécution accélérée par l'IA (depuis 2023)", body: "J'utilise l'IA comme un binôme expérimenté, pas comme un substitut au métier. C'est ce qui me permet de livrer en quelques jours ce que la plupart des agences livrent en semaines, sans bâcler ce qui compte." },
    ],
    goingTitle: "Où je m'en vais",
    goingIntro: "Ce studio est le premier maillon d'un plan plus large :",
    going: [
      "**Passer à une équipe de deux ou trois** — un designer et un second développeur — pour tenir la promesse de délai à mesure que la demande monte.",
      "**Me spécialiser.** Aujourd'hui je sers tout petit commerce ou fondateur indépendant ; d'ici douze mois, je veux être le choix évident pour un ou deux secteurs précis.",
      "**Relier le studio à ds-ai-manager.** Des sites livrés en quelques jours, de l'automatisation IA qui les fait vivre — un même studio, deux produits. Le client prend les deux, ou l'un, ou ce dont il a besoin.",
    ],
    goingClose: "Le fil qui relie tout ça : _les petites équipes ne devraient pas avoir à choisir entre la vitesse et la qualité, entre le sur-mesure et l'abordable, entre « livré » et « bien livré »._ Je construis l'alternative.",
    signature: "— Mohamed Mehdi Jabry, fondateur",
    connect: "Me suivre",
    email: "Courriel",
  },
  en: {
    eyebrow: "Founder",
    title: "About me",
    tagline: "The developer who ships in 72 hours.",
    role: "Founder · Independent web studio",
    intro: [
      "I'm Mohamed Mehdi Jabry, 35. Based in Trois-Rivières, Québec.",
      "Three master's degrees: Business Management, Brand Marketing, Project Management. None of them in computer science. I learned to code the way I learned everything else worth knowing — _because I needed to ship something, and waiting on someone else was no longer an option._",
    ],
    pathTitle: "My path",
    path: [
      "**2021–2024.** I worked across several industries — marketing, operations, consulting. I was looking for the right combination of skills to work on what I actually cared about. Most of those years were spent learning what I didn't want to do as much as what I did.",
      "**2023.** I went deep on AI. Not as a user — as an operator. Formal training, certifications, hands-on building. The pace of the field told me one thing clearly: the gap between what AI can do and what businesses actually ship is going to widen. The people who can close that gap will be in unusual demand.",
      "**2025–now.** I joined Cradly UK as marketing consultant, responsible for social media strategy and AI automation: I build custom AI skills aligned to the brand's identity and operational workflows. Production AI, not demos — agents that ship deliverables a marketer can publish without rewriting.",
      "**2025.** I launched ds-ai-manager.com — a productized AI agent for serious marketers. 13 specialised skills, brand-aware, source-validated. It's the proof I can package complex AI workflows into a coherent product, not just one-off automations.",
      "**2026.** I launched this studio, mehdijabry.dev. The execution arm of everything above — focused on shipping websites: landing pages, showcase sites, and small-team digital fronts that go live in days, not weeks.",
    ],
    whyTitle: "Why I launched this studio",
    whyIntro: "I've watched too many small businesses and indie founders get the wrong deal:",
    why: [
      "Pay **$4,000 for a WordPress site delivered in 8 weeks** they could have built themselves in a weekend.",
      "Hire \"fast freelancers\" only to receive Webflow templates with three colors swapped.",
      "Sit through a **$500 paid consultation** with a Québec agency before they'll even quote a price.",
    ],
    whyClose: "The middle path — fast, custom, transparently priced, ships in days — doesn't exist for most clients. _That's what this studio is._",
    howTitle: "How I work",
    how: [
      "**No fuzzy briefs.** No clear brief, no quote. I've lost three deals on this rule. I keep it.",
      "**Source code transferred to your GitHub on delivery day.** Not optional. Not a paywall. Not buried in fine print.",
      "**No page builders. No Wix. No Squarespace.** Custom React, every time. The code is yours, portable, debuggable, modifiable.",
      "**Quality over volume.** I'd rather ship one site this week that actually converts than three sites that look \"fine\" and don't.",
    ],
    mapTitle: "How my background maps to your website",
    mapIntro: "I didn't take the standard path to building websites. The detour turned out to matter.",
    map: [
      { icon: "📊", title: "Master's in Business Management", body: "I understand what a website actually has to do for your business: capture leads, book demos, close sales — not just look good." },
      { icon: "🎯", title: "MBA in Brand Marketing", body: "I read your brand as a coherent system before I touch the code. Visual identity, tone, positioning — they inform the structure, not the other way around." },
      { icon: "⚙️", title: "Master's in Project Management", body: "72-hour deliveries don't happen by accident. They happen because the scope is precise, the workflow is engineered, and the dependencies are mapped before Day 0." },
      { icon: "🤖", title: "AI-accelerated execution (since 2023)", body: "I use AI as a senior pair, not as a replacement for craft. It's what lets me ship in days what most agencies ship in weeks — without cutting corners on the parts that matter." },
    ],
    goingTitle: "Where I'm going",
    goingIntro: "This studio is the first node of a larger plan:",
    going: [
      "**Grow to a 2–3 person team** — a designer and a second developer — so I can keep the delivery promise as demand grows.",
      "**Specialise vertically.** Right now I serve any small business or indie founder; in 12 months I want to be the obvious choice for one or two specific verticals.",
      "**Integrate with ds-ai-manager.** Websites that ship in days, AI automation that runs them — same studio, two products. The same client gets both, or one, or whatever they need.",
    ],
    goingClose: "The thread connecting it all: _small teams shouldn't have to pick between speed and quality, between custom and affordable, between \"shipped\" and \"shipped right.\"_ I'm building the alternative.",
    signature: "— Mohamed Mehdi Jabry, Founder",
    connect: "Connect",
    email: "Email",
  },
};

/** **gras** et _italique_ dans une chaîne du dictionnaire. */
function Rich({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|_(.+?)_/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(m[1] ? <strong key={i++}>{m[1]}</strong> : <em key={i++}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function Arrows({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-5 text-lg leading-relaxed">
      {items.map((line) => (
        <li key={line} className="flex gap-3">
          <span className="text-primary shrink-0 mt-1">→</span>
          <span><Rich text={line} /></span>
        </li>
      ))}
    </ul>
  );
}

export default function About() {
  const t = useCopy(COPY);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-24 md:py-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h1 className="font-display text-4xl md:text-6xl mt-4 tracking-tight">{t.title}</h1>
            <p className="font-display-wonk text-xl md:text-2xl text-muted-foreground mt-2 italic">{t.tagline}</p>

            <div className="mt-12 flex flex-col sm:flex-row gap-8 items-start">
              <img
                src="/founder.jpg"
                alt="Mohamed Mehdi Jabry"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover object-top grayscale"
                data-testid="img-founder"
              />
              <div className="flex flex-col justify-center">
                <p className="font-serif text-2xl">Mohamed Mehdi Jabry</p>
                <p className="font-sans text-sm uppercase tracking-widest text-muted-foreground mt-1">{t.role}</p>
              </div>
            </div>

            {t.intro.map((p) => <p key={p} className="mt-6 first:mt-12 text-lg leading-relaxed"><Rich text={p} /></p>)}

            <hr className="border-border my-16" />

            <Eyebrow>{t.pathTitle}</Eyebrow>
            {t.path.map((p) => <p key={p} className="mt-6 text-lg leading-relaxed"><Rich text={p} /></p>)}

            <hr className="border-border my-16" />

            <Eyebrow>{t.whyTitle}</Eyebrow>
            <p className="mt-6 text-lg leading-relaxed">{t.whyIntro}</p>
            <Arrows items={t.why} />
            <p className="mt-8 text-lg leading-relaxed"><Rich text={t.whyClose} /></p>

            <hr className="border-border my-16" />

            <Eyebrow>{t.howTitle}</Eyebrow>
            <Arrows items={t.how} />

            <hr className="border-border my-16" />

            <Eyebrow>{t.mapTitle}</Eyebrow>
            <p className="mt-6 text-muted-foreground italic text-base">{t.mapIntro}</p>
            <div className="mt-8 space-y-10">
              {t.map.map((m) => (
                <div key={m.title} className="flex gap-5">
                  <span className="text-2xl shrink-0" aria-hidden>{m.icon}</span>
                  <div>
                    <p className="font-medium text-lg"><strong>{m.title}</strong></p>
                    <p className="mt-2 text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-primary shrink-0">→</span> {m.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-border my-16" />

            <Eyebrow>{t.goingTitle}</Eyebrow>
            <p className="mt-6 text-lg leading-relaxed">{t.goingIntro}</p>
            <Arrows items={t.going} />
            <p className="mt-8 text-lg leading-relaxed"><Rich text={t.goingClose} /></p>

            <p className="mt-10 font-serif text-lg text-center">{t.signature}</p>

            <hr className="border-border my-16" />

            <Eyebrow>{t.connect}</Eyebrow>
            <div className="mt-6 space-y-3 text-lg">
              {[
                { label: "LinkedIn", href: "https://www.linkedin.com/in/mehdijabry/", external: true },
                { label: "GitHub", href: "https://github.com/mehdijabry/mehdijabry", external: true },
                { label: "Twitter / X", href: "https://x.com/mehdijabry", external: true },
                { label: t.email, href: "mailto:contact@mehdijabry.dev", external: false },
              ].map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  data-testid={`link-connect-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="text-primary">→</span>
                  <span className="underline-offset-4 group-hover:underline">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
