import type { Lang } from "@/lib/i18n";
import type { AddonKey, ProjectType, Timeline } from "@/lib/pricing";

/**
 * Libellés du configurateur de devis, en français et en anglais (2026-10-06).
 *
 * lib/pricing.ts garde les montants et le calcul ; ce fichier ne porte que les mots. Les deux sont
 * indexés par les mêmes clés, donc ajouter une option revient à l'ajouter aux deux endroits — TypeScript
 * le rappelle, les Record ci-dessous étant complets par construction.
 */
type Tri = { label: string; subtitle: string; bestFor: string; deliveryStandard: string; deliveryExpress: string };

export const PROJECT_COPY: Record<Lang, Record<ProjectType, Tri>> = {
  fr: {
    spark: {
      label: "Spark — Page unique",
      subtitle: "Une page, livrée en 24 à 48 h",
      bestFor: "Créateurs indépendants, lancements, produits minimum viables, campagnes courtes",
      deliveryStandard: "24 à 48 h",
      deliveryExpress: "12 à 24 h",
    },
    vitrine: {
      label: "Vitrine — Site vitrine",
      subtitle: "3 à 5 pages, livrées en 3 à 5 jours",
      bestFor: "TPE, coachs, consultants, travailleurs autonomes, petits ateliers",
      deliveryStandard: "3 à 5 jours",
      deliveryExpress: "1 à 2 jours",
    },
    vitrineplus: {
      label: "Vitrine+ — Site vitrine enrichi",
      subtitle: "5 à 7 pages avec fonctionnalités, livrées en 5 à 7 jours",
      bestFor: "Professionnels qui veulent plus : collecte de prospects, réservation, site bilingue",
      deliveryStandard: "5 à 7 jours",
      deliveryExpress: "2 à 3 jours",
    },
  },
  en: {
    spark: {
      label: "Spark — Landing page",
      subtitle: "Single page, shipped in 24–48h",
      bestFor: "Indie hackers, Product Hunt launches, MVPs, short campaigns",
      deliveryStandard: "24–48 hours",
      deliveryExpress: "12–24 hours",
    },
    vitrine: {
      label: "Vitrine — Showcase site",
      subtitle: "3–5 pages, shipped in 3–5 days",
      bestFor: "Small businesses, coaches, consultants, freelancers, small studios",
      deliveryStandard: "3–5 days",
      deliveryExpress: "1–2 days",
    },
    vitrineplus: {
      label: "Vitrine+ — Showcase Plus",
      subtitle: "5–7 pages with features, shipped in 5–7 days",
      bestFor: "Pros wanting more: lead capture, booking, bilingual presence",
      deliveryStandard: "5–7 days",
      deliveryExpress: "2–3 days",
    },
  },
};

export const TIMELINE_COPY: Record<Lang, Record<Timeline, string>> = {
  fr: { standard: "Livraison standard", express: "Express (délai divisé par deux)" },
  en: { standard: "Standard delivery", express: "Express (delivery time ÷ 2)" },
};

export const ADDON_COPY: Record<Lang, Record<AddonKey, string>> = {
  fr: {
    extraPage: "Page supplémentaire (Vitrine et Vitrine+ seulement)",
    newsletter: "Infolettre (Resend Audiences + double opt-in)",
    bilingual: "Bilingue FR + EN (Spark ou Vitrine seulement)",
    migration: "Migration depuis Wix, Squarespace ou WordPress",
    logo: "Logo simple (typographique + monogramme)",
    copyAssist: "Aide à la rédaction (j'écris les textes avec vous)",
    stockPhotos: "Photos de banque sélectionnées (10 à 15)",
    stripeCheckout: "Paiement Stripe pour un produit (sans tableau de bord)",
    training: "Formation d'une heure pour modifier le contenu",
    maintenance: "Entretien mensuel (hébergement + 1 h de développement/mois)",
  },
  en: {
    extraPage: "Extra page (Vitrine / Vitrine+ only)",
    newsletter: "Newsletter signup (Resend Audiences + opt-in)",
    bilingual: "Bilingual FR + EN (Spark or Vitrine only)",
    migration: "Migration from Wix / Squarespace / WordPress",
    logo: "Simple logo (typographic + monogram)",
    copyAssist: "Copy assist (I write content with you)",
    stockPhotos: "Curated stock photos (10–15)",
    stripeCheckout: "Stripe Checkout one-product (no dashboard)",
    training: "1h training for content updates",
    maintenance: "Monthly maintenance (hosting + 1h dev/mo)",
  },
};
