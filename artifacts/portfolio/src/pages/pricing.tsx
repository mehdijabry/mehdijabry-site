import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { useState } from "react";
import { ADDONS, Currency, getBasePrice, getAddonPrice, ProjectType } from "@/lib/pricing";
import { ADDON_COPY } from "@/lib/pricing-copy";
import { useCopy, useLang } from "@/lib/i18n";

type Tier = { key: ProjectType; name: string; subtitle: string; delivery: string; recommended: boolean; features: string[]; bestFor: string };

const COPY: Record<"fr" | "en", {
  title: string; recommended: string; bestFor: string; start: string; addons: string; perMonth: string;
  whyTitle: string; why: { h: string; p: string }[]; comparison: string; columns: string[]; rows: string[][];
  cta: string; tiers: Tier[];
}> = {
  fr: {
    title: "Tarifs — transparents, prévisibles, sans surprise.",
    recommended: "Recommandé",
    bestFor: "Pour qui :",
    start: "Commencer",
    addons: "Options disponibles",
    perMonth: "/mois",
    whyTitle: "Pourquoi un prix fixe ?",
    why: [
      { h: "Le temps n'est pas le produit.", p: "La plupart des indépendants facturent à l'heure : vous payez leurs journées lentes. Avec un prix fixe, la seule personne qui paie l'inefficacité, c'est moi — c'est pour ça que je travaille vite." },
      { h: "Vous connaissez le budget.", p: "Pas de dérive de périmètre, pas de conversation « il faudrait deux semaines de plus ». Le prix annoncé est le prix payé." },
      { h: "Le code vous appartient.", p: "Chaque projet à prix fixe est livré avec le transfert complet du dépôt GitHub. Vous n'êtes jamais prisonnier d'un contrat d'entretien." },
    ],
    comparison: "Comparaison",
    columns: ["", "Mehdi Jabry", "Agence traditionnelle", "Abonnement (DesignJoy)", "Indépendant Webflow"],
    rows: [
      ["Prix de départ", "À partir de 375 $ CA", "5 000 $ et plus", "~5 000 $/mois", "500 à 2 000 $"],
      ["Délai", "24 h à 7 jours", "4 à 12 semaines", "Tâche par tâche", "1 à 3 semaines"],
      ["Code sur mesure", "Oui — Next.js/React", "Parfois (souvent WordPress)", "Webflow / Framer", "Non — Webflow seulement"],
      ["Propriété du code", "100 % à vous", "Habituellement à vous", "Lié à la plateforme", "Lié à Webflow"],
      ["Modèle de prix", "Une fois, fixe", "Variable / horaire", "Mensuel récurrent", "Variable"],
    ],
    cta: "→ Configurer votre devis",
    tiers: [
      {
        key: "spark", name: "SPARK", subtitle: "Page unique", delivery: "24 à 48 h", recommended: false,
        features: [
          "1 page (accroche · fonctionnalités · tarifs · questions · pied de page)",
          "Code Next.js + Tailwind sur mesure, sans gabarit",
          "Formulaire de contact Resend",
          "Adapté au mobile",
          "1 série de corrections",
          "Code source transféré sur votre GitHub",
          "Garantie : 48 h ou −50 %",
        ],
        bestFor: "Créateurs indépendants, lancements, produits minimum viables, campagnes courtes",
      },
      {
        key: "vitrine", name: "VITRINE", subtitle: "Site vitrine", delivery: "3 à 5 jours", recommended: true,
        features: [
          "3 à 5 pages (accueil, à propos, services, contact, blogue ou sur mesure)",
          "Formulaire relié à Supabase (export CSV des demandes)",
          "Référencement (balises meta, Open Graph, plan de site, JSON-LD)",
          "Statistiques Plausible",
          "2 séries de corrections",
          "Appel de cadrage de 30 minutes",
          "Garantie : 5 jours ou −25 %",
        ],
        bestFor: "TPE, coachs, consultants, travailleurs autonomes, petits ateliers",
      },
      {
        key: "vitrineplus", name: "VITRINE+", subtitle: "Site vitrine enrichi", delivery: "5 à 7 jours", recommended: false,
        features: [
          "5 à 7 pages",
          "Inscription à l'infolettre (Resend Audiences + confirmation automatique)",
          "Prise de rendez-vous (Calendly ou plages Supabase)",
          "Bilingue FR + EN inclus",
          "Référencement étendu, Open Graph par page",
          "2 séries de corrections",
          "Appel de démarrage de 45 minutes",
          "Garantie : 7 jours ou −25 %",
        ],
        bestFor: "Professionnels qui veulent plus : collecte de prospects, réservation, site bilingue",
      },
    ],
  },
  en: {
    title: "Pricing — transparent, predictable, no surprises.",
    recommended: "Recommended",
    bestFor: "Best for:",
    start: "Get started",
    addons: "Available add-ons",
    perMonth: "/mo",
    whyTitle: "Why fixed price?",
    why: [
      { h: "Time is not the product.", p: "Most freelancers bill hourly. You pay for slow days. With fixed price, the only person who pays for inefficiency is me — which is why I work fast." },
      { h: "You know the budget.", p: "No scope creep surprises, no \"this will take 2 more weeks\" conversations. The price is the price." },
      { h: "You own the code.", p: "Fixed-price projects ship with full GitHub transfer at delivery. You're never trapped in a maintenance contract." },
    ],
    comparison: "Comparison",
    columns: ["", "Mehdi Jabry", "Traditional agency", "Subscription (DesignJoy)", "Webflow freelancer"],
    rows: [
      ["Starting price", "From $375 CAD", "$5,000+", "~$5k/month", "$500–$2k"],
      ["Speed", "24h to 7 days", "4–12 weeks", "Task by task", "1–3 weeks"],
      ["Custom code", "Yes — Next.js/React", "Sometimes (often WP)", "Webflow / Framer", "No — Webflow only"],
      ["Code ownership", "100% yours", "Usually yours", "Tied to platform", "Tied to Webflow"],
      ["Price model", "One-off, fixed", "Variable / hourly", "Monthly recurring", "Variable"],
    ],
    cta: "→ Configure your quote",
    tiers: [
      {
        key: "spark", name: "SPARK", subtitle: "Landing page", delivery: "24–48 hours", recommended: false,
        features: [
          "1 page (Hero · Features · Pricing/CTA · FAQ · Footer)",
          "Custom Next.js + Tailwind code, no templates",
          "Resend contact form",
          "Mobile-responsive",
          "1 revision round",
          "Source code transferred to your GitHub",
          "Guarantee: 48h or −50%",
        ],
        bestFor: "Indie hackers, Product Hunt launches, MVPs, short campaigns",
      },
      {
        key: "vitrine", name: "VITRINE", subtitle: "Showcase site", delivery: "3–5 days", recommended: true,
        features: [
          "3–5 pages (Home, About, Services, Contact, Blog or custom)",
          "Supabase-backed form (CSV export of leads)",
          "SEO setup (meta tags, Open Graph, sitemap, JSON-LD)",
          "Plausible Analytics",
          "2 revision rounds",
          "30-min brief call",
          "Guarantee: 5 days or −25%",
        ],
        bestFor: "Small businesses, coaches, consultants, freelancers, small studios",
      },
      {
        key: "vitrineplus", name: "VITRINE+", subtitle: "Showcase Plus", delivery: "5–7 days", recommended: false,
        features: [
          "5–7 pages",
          "Newsletter signup (Resend Audiences + auto opt-in)",
          "Booking integration (Calendly or Supabase slots)",
          "Bilingual FR + EN included",
          "Extended SEO with per-page Open Graph",
          "2 revision rounds",
          "45-min onboarding call",
          "Guarantee: 7 days or −25%",
        ],
        bestFor: "Pros wanting more: lead capture, booking, bilingual presence",
      },
    ],
  },
};

export default function Pricing() {
  const { lang } = useLang();
  const t = useCopy(COPY);
  const addonLabel = ADDON_COPY[lang];
  const [currency, setCurrency] = useState<Currency>("CAD");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <h1 className="font-display text-4xl md:text-6xl tracking-tight max-w-3xl uppercase">{t.title}</h1>
            <div className="flex bg-card border border-border p-1 shrink-0">
              {(["CAD", "USD", "EUR", "GBP"] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  data-testid={`button-currency-${c.toLowerCase()}`}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${currency === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {t.tiers.map(tier => (
              <div
                key={tier.key}
                className={`relative flex flex-col p-8 gap-8 transition-all ${tier.recommended ? "border-2 border-primary bg-card shadow-xl shadow-primary/5" : "border border-border bg-card hover:border-primary/50"}`}
                data-testid={`card-tier-${tier.key}`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-mono px-3 py-1 uppercase">
                    {t.recommended}
                  </div>
                )}
                <div>
                  <h4 className={`font-mono text-sm mb-1 ${tier.recommended ? "text-primary" : "text-muted-foreground"}`}>
                    {tier.name}
                  </h4>
                  <p className="text-muted-foreground text-sm mb-4">{tier.subtitle} / {tier.delivery}</p>
                  <div className="font-serif text-5xl mb-1">
                    ${getBasePrice(tier.key, currency).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA")}{" "}
                    <span className="text-sm font-sans text-muted-foreground uppercase">{currency}</span>
                  </div>
                </div>
                <ul className="text-sm space-y-3 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary shrink-0">→</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground border-t border-border pt-4">
                  {t.bestFor} {tier.bestFor}
                </p>
                <Link
                  href="/start"
                  data-testid={`link-start-${tier.key}`}
                  className={`inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors ${tier.recommended ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-background hover:bg-accent hover:text-accent-foreground"}`}
                >
                  {t.start}
                </Link>
              </div>
            ))}
          </div>

          {/* Add-ons Table */}
          <div className="mb-24">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">{t.addons}</h2>
            <div className="border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-border">
                  {(Object.entries(ADDONS) as [keyof typeof ADDONS, (typeof ADDONS)[keyof typeof ADDONS]][]).map(([key, addon]) => (
                    <tr key={key} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 py-5 font-medium">{addonLabel[key]}</td>
                      <td className="p-4 py-5 text-right font-mono text-muted-foreground">
                        {`+$${getAddonPrice(key, currency)}${"recurring" in addon ? t.perMonth : ""} ${currency}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Why Fixed Price */}
          <div className="mb-24">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-8">{t.whyTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {t.why.map((w) => (
                <div key={w.h} className="space-y-4">
                  <h3 className="font-serif text-2xl uppercase">{w.h}</h3>
                  <p className="text-muted-foreground leading-relaxed">{w.p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-24">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">{t.comparison}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    {t.columns.map((c, i) => (
                      <th key={c || i} className={`p-4 font-sans text-xs uppercase tracking-widest ${i === 1 ? "text-primary font-bold bg-primary/5" : "text-muted-foreground font-normal"}`}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {t.rows.map(([label, ...cols]) => (
                    <tr key={label}>
                      <td className="p-4 text-muted-foreground">{label}</td>
                      <td className="p-4 bg-primary/5 font-medium">{cols[0]}</td>
                      <td className="p-4 text-muted-foreground">{cols[1]}</td>
                      <td className="p-4 text-muted-foreground">{cols[2]}</td>
                      <td className="p-4 text-muted-foreground">{cols[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <Link href="/start" className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-none px-12 text-lg font-serif transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
              {t.cta}
            </Link>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
