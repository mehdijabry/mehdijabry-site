/**
 * Le référencement du site public, en un seul endroit.
 *
 * POURQUOI CE PAQUET EXISTE. mehdijabry.dev est une application React servie en bloc : le serveur
 * renvoyait le même `index.html` pour `/`, `/work`, `/pricing`, `/about`… Vu de Google, le site
 * n'avait donc qu'une seule page — même titre, même description, aucune URL canonique. Les pages
 * se concurrençaient entre elles au lieu de se compléter.
 *
 * Le serveur Express lit maintenant ces fiches et réécrit l'en-tête de la page AVANT de l'envoyer,
 * et le navigateur applique les mêmes valeurs quand on change de page sans recharger. Une seule
 * source, deux consommateurs : `artifacts/api-server` (ce que voit le robot) et
 * `artifacts/portfolio` (ce que voit l'onglet du visiteur).
 *
 * RÈGLE DE FOND, elle vaut pour tout ce fichier : aucun chiffre, aucune coordonnée et aucune
 * promesse n'est écrite ici sans être déjà publiée sur le site lui-même. Les prix viennent de
 * `artifacts/portfolio/src/lib/pricing.ts`, le téléphone et le courriel du pied de page et de la
 * page Contact, les villes desservies de la page Contact. Si une de ces sources change, cette
 * fiche change aussi — sinon Google affiche une promesse que le site ne tient pas.
 */

/** Ce que le site publie déjà de lui-même. Rien n'est inventé ici. */
export const SITE = {
  origine: "https://mehdijabry.dev",
  nom: "Mehdi Jabry",
  /** Le nom complet, tel qu'il est écrit sur la page À propos. */
  nomComplet: "Mohamed Mehdi Jabry",
  courriel: "contact@mehdijabry.dev",
  /** Affiché dans le pied de page et sur la page Contact. Jamais retapé de mémoire. */
  telephone: "+1-438-525-7119",
  /**
   * L'adresse, lue dans `GET /api/admin/settings` le 7 octobre 2026 — jamais retapée de mémoire,
   * comme le numéro de téléphone.
   *
   * LE NUMÉRO D'APPARTEMENT EST VOLONTAIREMENT ABSENT. Les réglages portent « Appartement 7 » ;
   * il ne sort ni dans un pied de page de courriel de prospection, ni ici. Rue, code postal et
   * ville suffisent à Google pour ancrer le commerce, et c'est tout ce qu'un visiteur a besoin
   * de savoir d'un studio qui se déplace chez ses clients.
   */
  rue: "3051, rue du Père-Bressani",
  codePostal: "G8Z 1T5",
  ville: "Trois-Rivières",
  region: "QC",
  pays: "CA",
  langue: "fr-CA",
  image: "/og.png",
  /** Les deux seuls profils que le site lui-même met en lien. */
  profils: [
    "https://www.linkedin.com/in/mehdijabry/",
    "https://github.com/mehdijabry/mehdijabry",
  ],
  /** Recopié de la section « Où je me déplace » de la page Contact. */
  dessert: [
    "Trois-Rivières",
    "Cap-de-la-Madeleine",
    "Trois-Rivières-Ouest",
    "Pointe-du-Lac",
    "Saint-Louis-de-France",
    "Sainte-Marthe-du-Cap",
    "Shawinigan",
    "Louiseville",
    "Drummondville",
    "Sorel-Tracy",
  ],
  /** Les trois formules de pricing.ts, en dollars canadiens : 375, 790, 1 290. */
  fourchettePrix: "CA$375-CA$1290",
} as const;

export type Fiche = {
  /** Moins de 60 caractères : au-delà, Google coupe. */
  titre: string;
  /** 120 à 160 caractères. Doit tenir la promesse du titre. */
  description: string;
  /** Le fil d'Ariane après l'accueil. Absent sur l'accueil. */
  fil?: string;
  /** Page utile mais à garder hors de l'index (remerciement, espace privé). */
  horsIndex?: boolean;
  /** Présence au plan du site. Absent = la page n'y figure pas. */
  plan?: { priorite: number; frequence: "daily" | "weekly" | "monthly" | "yearly" };
  /**
   * Le titre et la description en anglais, pour l'onglet du visiteur qui bascule la langue.
   * Ils ne partent JAMAIS dans l'en-tête servi au robot : le site n'a qu'une adresse par page,
   * elle est en français, et annoncer deux langues sur une seule URL est une erreur classique
   * qui fait disparaître la page des deux index au lieu de la faire apparaître dans les deux.
   */
  en?: { titre: string; description: string };
};

/**
 * Les pages publiques. L'ordre est celui du plan du site.
 *
 * Les titres sont écrits pour ce qu'un commerçant d'ici tape réellement dans Google — « création
 * site web Trois-Rivières », « tarif site web », « développeur web Trois-Rivières » — et non pour
 * répéter le nom du studio sur chaque page : `og:site_name` s'en charge, et Google l'ajoute
 * lui-même en fin de titre quand il juge que c'est utile.
 */
export const FICHES: Record<string, Fiche> = {
  "/": {
    titre: "Création de site web à Trois-Rivières · Mehdi Jabry",
    description:
      "Sites web pour les commerces de Trois-Rivières et de la Mauricie. Plutôt qu'un devis, je livre une maquette — et le site est en ligne en 48 heures.",
    plan: { priorite: 1.0, frequence: "weekly" },
    en: {
      titre: "Web design in Trois-Rivières · Mehdi Jabry",
      description:
        "Websites for local businesses in Trois-Rivières and the Mauricie region. Instead of a quote, I deliver a mockup — and the site is live within 48 hours.",
    },
  },
  "/work": {
    titre: "Réalisations — sites web pour commerces de la Mauricie",
    description:
      "Restaurants, cafés, boulangeries, gîtes et boutiques, de Trois-Rivières à Drummondville. Ouvrez un site : il s'affiche ici, sans quitter la page.",
    fil: "Réalisations",
    plan: { priorite: 0.9, frequence: "weekly" },
    en: {
      titre: "Selected work — websites for Mauricie businesses",
      description:
        "Restaurants, cafés, bakeries, inns and shops, from Trois-Rivières to Drummondville. Open one: it loads right here, without leaving the page.",
    },
  },
  "/pricing": {
    titre: "Tarifs — 375 $, 790 $ ou 1 290 $, sans surprise",
    description:
      "Trois formules : page unique 375 $, site vitrine 790 $, site vitrine enrichi 1 290 $. Options à la carte, délai annoncé, prix calculé devant vous.",
    fil: "Tarifs",
    plan: { priorite: 0.9, frequence: "monthly" },
    en: {
      titre: "Pricing — CA$375, CA$790 or CA$1,290, no surprises",
      description:
        "Three tiers: single page CA$375, brochure site CA$790, extended brochure site CA$1,290. À-la-carte options, stated lead time, price computed in front of you.",
    },
  },
  "/start": {
    titre: "Configurer votre devis en ligne, en 2 minutes",
    description:
      "Choisissez le type de site, les options et le délai : le prix s'affiche en direct. Pas de rendez-vous à prendre, pas de rappel commercial.",
    fil: "Devis",
    plan: { priorite: 0.8, frequence: "monthly" },
    en: {
      titre: "Configure your quote online, in 2 minutes",
      description:
        "Pick the type of site, the options and the deadline: the price updates live. No meeting to book, no sales call back.",
    },
  },
  "/about": {
    titre: "À propos — Mohamed Mehdi Jabry, développeur web",
    description:
      "35 ans, établi à Trois-Rivières. Trois maîtrises en gestion, en marketing et en projet, aucune en informatique — et des sites livrés en quelques jours.",
    fil: "À propos",
    plan: { priorite: 0.7, frequence: "monthly" },
    en: {
      titre: "About — Mohamed Mehdi Jabry, web developer",
      description:
        "35, based in Trois-Rivières, Quebec. Three master's degrees in management, branding and project management, none in computer science — and sites shipped in days.",
    },
  },
  "/contact": {
    titre: "Contact — développeur web à Trois-Rivières",
    description:
      "Écrivez à contact@mehdijabry.dev ou appelez le 438 525-7119. Réponse le jour même, souvent dans l'heure. Je me déplace de Trois-Rivières à Sorel-Tracy.",
    fil: "Contact",
    plan: { priorite: 0.8, frequence: "monthly" },
    en: {
      titre: "Contact — web developer in Trois-Rivières",
      description:
        "Write to contact@mehdijabry.dev or call 438 525-7119. Same-day reply, often within the hour. I travel from Trois-Rivières to Sorel-Tracy.",
    },
  },
  "/legal": {
    titre: "Mentions légales et vie privée",
    description:
      "Identité du studio, conditions de travail et traitement des renseignements personnels. Studio web indépendant établi à Trois-Rivières, au Québec.",
    fil: "Mentions légales",
    plan: { priorite: 0.3, frequence: "yearly" },
    en: {
      titre: "Legal notice and privacy",
      description:
        "Who runs the studio, the terms of the work and how personal information is handled. Independent web studio based in Trois-Rivières, Quebec.",
    },
  },
  "/thanks": {
    titre: "Merci — votre message est parti",
    description: "Confirmation d'envoi.",
    fil: "Merci",
    horsIndex: true,
    en: {
      titre: "Thank you — your message is on its way",
      description:
        "Send confirmation.",
    },
  },
};

/** Ce que reçoit une adresse inconnue : un vrai 404, jamais une page vide renvoyée avec un 200. */
export const FICHE_INTROUVABLE: Fiche = {
  titre: "Page introuvable",
  description: "Cette adresse n'existe pas sur mehdijabry.dev.",
  horsIndex: true,
};

/** L'espace d'administration et les liens de facture : utiles, privés, jamais indexés. */
const PREFIXES_PRIVES = ["/admin", "/f/", "/o/", "/go/", "/api/", "/maquette-v1/"];

/** Enlève la barre oblique finale et la chaîne de requête. `/work/` et `/work?x=1` sont `/work`. */
export function normaliser(chemin: string): string {
  const sansRequete = chemin.split("?")[0]!.split("#")[0]!;
  if (sansRequete === "/" || sansRequete === "") return "/";
  return sansRequete.replace(/\/+$/, "") || "/";
}

export function estPrive(chemin: string): boolean {
  const c = normaliser(chemin);
  return PREFIXES_PRIVES.some((p) => c === p.replace(/\/$/, "") || c.startsWith(p));
}

/** La fiche d'une adresse. `null` quand l'adresse n'existe pas — l'appelant répond alors 404. */
export function fiche(chemin: string): Fiche | null {
  const c = normaliser(chemin);
  if (estPrive(c)) {
    return { titre: "Espace privé", description: "Accès réservé.", horsIndex: true };
  }
  return FICHES[c] ?? null;
}

/** Les adresses du plan du site, dans l'ordre de déclaration. */
export function cheminsDuPlan(): Array<{ chemin: string; priorite: number; frequence: string }> {
  return Object.entries(FICHES)
    .filter(([, f]) => f.plan)
    .map(([chemin, f]) => ({ chemin, priorite: f.plan!.priorite, frequence: f.plan!.frequence }));
}

// ───────────────────────────── Données structurées ─────────────────────────────

/** Une maquette telle que l'expose /api/portfolio/maquettes. */
export type MaquettePourSeo = { slug: string; title: string; meta: string; proxyUrl: string };

/**
 * Le studio lui-même, décrit une seule fois et référencé partout ailleurs par son identifiant.
 *
 * L'adresse est celle des réglages de facturation, sans le numéro d'appartement (voir SITE.rue).
 * Elle ouvre le résultat enrichi « commerce local » : sans `streetAddress` ni `postalCode`, Google
 * accepte la fiche mais la signale incomplète. Ce qu'elle ne doit JAMAIS contenir, c'est une
 * adresse approchée — un faux détail de localisation se retourne contre un commerce local.
 */
function studio() {
  return {
    "@type": "ProfessionalService",
    "@id": `${SITE.origine}/#studio`,
    name: SITE.nom,
    url: `${SITE.origine}/`,
    image: `${SITE.origine}${SITE.image}`,
    email: SITE.courriel,
    telephone: SITE.telephone,
    priceRange: SITE.fourchettePrix,
    description:
      "Studio web indépendant établi à Trois-Rivières : sites vitrines et pages de lancement pour les commerces de la Mauricie et du Centre-du-Québec.",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.rue,
      postalCode: SITE.codePostal,
      addressLocality: SITE.ville,
      addressRegion: SITE.region,
      addressCountry: SITE.pays,
    },
    areaServed: SITE.dessert.map((ville) => ({ "@type": "City", name: ville })),
    founder: {
      "@type": "Person",
      name: SITE.nomComplet,
      jobTitle: "Développeur web",
      url: `${SITE.origine}/about`,
      sameAs: [...SITE.profils],
    },
    knowsLanguage: ["fr-CA", "en-CA"],
    sameAs: [...SITE.profils],
  };
}

function siteWeb() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.origine}/#site`,
    url: `${SITE.origine}/`,
    name: SITE.nom,
    inLanguage: SITE.langue,
    publisher: { "@id": `${SITE.origine}/#studio` },
  };
}

/**
 * Les trois formules, aux prix réellement affichés sur /pricing.
 *
 * Deux pièges relevés par validator.schema.org le 7 octobre 2026, et ils sont généraux :
 * `position` n'existe pas sur une `Offer` (c'est une propriété de `ListItem` — l'ordre du tableau
 * suffit), et `deliveryLeadTime` attend une `QuantitativeValue`, pas une phrase. « 24 à 48 h »
 * devient donc 1 à 2 jours, en code d'unité normalisé.
 */
function catalogue() {
  const offres: Array<[string, string, number, number, number]> = [
    ["SPARK", "Page unique", 375, 1, 2],
    ["VITRINE", "Site vitrine", 790, 3, 5],
    ["VITRINE+", "Site vitrine enrichi", 1290, 5, 7],
  ];
  return {
    "@type": "OfferCatalog",
    name: "Formules de site web",
    itemListElement: offres.map(([nom, sous, prix, jourMin, jourMax]) => ({
      "@type": "Offer",
      name: `${nom} — ${sous}`,
      price: String(prix),
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        minValue: jourMin,
        maxValue: jourMax,
        unitCode: "DAY",
      },
      itemOffered: {
        "@type": "Service",
        name: sous,
        serviceType: "Création de site web",
        // Le territoire desservi est déclaré une seule fois, sur le studio, et référencé ici par
        // son identifiant : le répéter sur chacune des trois offres triplait le bloc pour rien.
        provider: { "@id": `${SITE.origine}/#studio` },
      },
    })),
  };
}

/**
 * Le bloc JSON-LD d'une page. Le robot le lit sans exécuter une ligne de React — c'est tout
 * l'intérêt : le corps de la page, lui, dépend d'un paquet JavaScript de 800 ko.
 */
export function donneesStructurees(
  chemin: string,
  options: { maquettes?: MaquettePourSeo[] } = {},
): unknown {
  const c = normaliser(chemin);
  const f = fiche(c);
  if (!f || f.horsIndex) return null;

  const url = `${SITE.origine}${c === "/" ? "/" : c}`;
  const graphe: unknown[] = [studio(), siteWeb()];

  const page: Record<string, unknown> = {
    "@type": c === "/" ? "WebPage" : c === "/work" ? "CollectionPage" : "WebPage",
    "@id": `${url}#page`,
    url,
    name: f.titre,
    description: f.description,
    inLanguage: SITE.langue,
    isPartOf: { "@id": `${SITE.origine}/#site` },
    about: { "@id": `${SITE.origine}/#studio` },
    primaryImageOfPage: `${SITE.origine}${SITE.image}`,
  };

  if (f.fil) {
    page["breadcrumb"] = { "@id": `${url}#fil` };
    graphe.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#fil`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE.origine}/` },
        { "@type": "ListItem", position: 2, name: f.fil, item: url },
      ],
    });
  }

  if (c === "/pricing") page["mainEntity"] = catalogue();

  // La liste des réalisations est lue en base, jamais recopiée à la main : une maquette suspendue
  // depuis /admin/maquettes disparaît du site public, elle doit disparaître d'ici au même moment.
  if (c === "/work" && options.maquettes?.length) {
    page["mainEntity"] = {
      "@type": "ItemList",
      numberOfItems: options.maquettes.length,
      itemListElement: options.maquettes.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${m.title} — ${m.meta}`,
        url: m.proxyUrl,
      })),
    };
  }

  graphe.push(page);
  return { "@context": "https://schema.org", "@graph": graphe };
}

// ───────────────────────────── Fabrication de l'en-tête ─────────────────────────────

/** Échappe ce qui part dans un attribut HTML. Les titres contiennent des apostrophes et des tirets cadratins. */
export function echapper(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Les balises d'en-tête d'une page, prêtes à être injectées dans `index.html`.
 *
 * Le JSON-LD est sérialisé puis son `<` est neutralisé : sans ça, une chaîne contenant
 * « </script> » fermerait la balise et casserait la page.
 */
export function enTete(
  chemin: string,
  options: { maquettes?: MaquettePourSeo[]; indentation?: string } = {},
): string {
  const c = normaliser(chemin);
  const f = fiche(c) ?? FICHE_INTROUVABLE;
  const url = `${SITE.origine}${c === "/" ? "/" : c}`;
  const i = options.indentation ?? "    ";
  const lignes: string[] = [];

  lignes.push(`<title>${echapper(f.titre)}</title>`);
  lignes.push(`<meta name="description" content="${echapper(f.description)}" />`);
  lignes.push(
    f.horsIndex
      ? `<meta name="robots" content="noindex, follow" />`
      : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
  );
  if (!f.horsIndex) lignes.push(`<link rel="canonical" href="${echapper(url)}" />`);

  lignes.push(`<meta property="og:site_name" content="${echapper(SITE.nom)}" />`);
  lignes.push(`<meta property="og:locale" content="fr_CA" />`);
  // Le site bascule en anglais sur la même adresse, sans URL distincte : on signale la langue
  // de remplacement, mais surtout pas de `hreflang`, qui promettrait une autre page.
  lignes.push(`<meta property="og:locale:alternate" content="en_CA" />`);
  lignes.push(`<meta property="og:type" content="website" />`);
  lignes.push(`<meta property="og:url" content="${echapper(url)}" />`);
  lignes.push(`<meta property="og:title" content="${echapper(f.titre)}" />`);
  lignes.push(`<meta property="og:description" content="${echapper(f.description)}" />`);
  lignes.push(`<meta property="og:image" content="${SITE.origine}${SITE.image}" />`);
  lignes.push(`<meta property="og:image:width" content="1200" />`);
  lignes.push(`<meta property="og:image:height" content="630" />`);
  lignes.push(`<meta name="twitter:card" content="summary_large_image" />`);
  lignes.push(`<meta name="twitter:title" content="${echapper(f.titre)}" />`);
  lignes.push(`<meta name="twitter:description" content="${echapper(f.description)}" />`);
  lignes.push(`<meta name="twitter:image" content="${SITE.origine}${SITE.image}" />`);

  const donnees = donneesStructurees(c, options);
  if (donnees) {
    const json = JSON.stringify(donnees).replace(/</g, "\\u003c");
    lignes.push(`<script type="application/ld+json">${json}</script>`);
  }

  return lignes.join(`\n${i}`);
}

/** Le plan du site, au format que Google attend. `dateModifiee` est la date du dernier déploiement. */
export function planDuSite(dateModifiee: string): string {
  const entrees = cheminsDuPlan()
    .map(({ chemin, priorite, frequence }) => {
      const url = `${SITE.origine}${chemin === "/" ? "/" : chemin}`;
      return [
        "  <url>",
        `    <loc>${url}</loc>`,
        `    <lastmod>${dateModifiee}</lastmod>`,
        `    <changefreq>${frequence}</changefreq>`,
        `    <priority>${priorite.toFixed(1)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entrees}\n</urlset>\n`;
}
