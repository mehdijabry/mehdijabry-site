export const PROJECT_TYPES = {
  spark: {
    label: 'Spark — Landing page',
    subtitle: 'Single page, shipped in 24-48h',
    baseUSD: 290,
    baseCAD: 390,
    deliveryStandard: '24-48 hours',
    deliveryExpress: '12-24 hours',
    bestFor: 'Indie hackers, Product Hunt launches, MVPs, short campaigns',
  },
  vitrine: {
    label: 'Vitrine — Showcase site',
    subtitle: '3-5 pages, shipped in 3-5 days',
    baseUSD: 590,
    baseCAD: 790,
    deliveryStandard: '3-5 days',
    deliveryExpress: '1-2 days',
    bestFor: 'TPE, coaches, consultants, freelancers, small studios',
  },
  vitrineplus: {
    label: 'Vitrine+ — Showcase Plus',
    subtitle: '5-7 pages with features, shipped in 5-7 days',
    baseUSD: 950,
    baseCAD: 1290,
    deliveryStandard: '5-7 days',
    deliveryExpress: '2-3 days',
    bestFor: 'Pros wanting more: lead capture, booking, bilingual presence',
  },
} as const;

export const TIMELINES = {
  standard: { label: 'Standard delivery',           multiplier: 1.0 },
  express:  { label: 'Express (delivery time ÷ 2)', multiplier: 1.3 },
} as const;

export const ADDONS = {
  extraPage:      { label: 'Extra page (Vitrine / Vitrine+ only)',          usd: 60,  cad: 80                       },
  newsletter:     { label: 'Newsletter signup (Resend Audiences + opt-in)', usd: 90,  cad: 120                      },
  bilingual:      { label: 'Bilingual FR + EN (Spark or Vitrine only)',      usd: 110, cad: 150                      },
  migration:      { label: 'Migration from Wix / Squarespace / WordPress',  usd: 90,  cad: 120                      },
  logo:           { label: 'Simple logo (typographic + monogram)',           usd: 90,  cad: 120                      },
  copyAssist:     { label: 'Copy assist (I write content with you)',         usd: 110, cad: 150                      },
  stockPhotos:    { label: 'Curated stock photos (10-15)',                   usd: 45,  cad: 60                       },
  stripeCheckout: { label: 'Stripe Checkout one-product (no dashboard)',     usd: 90,  cad: 120                      },
  training:       { label: '1h training for content updates',                usd: 60,  cad: 80                       },
  maintenance:    { label: 'Monthly maintenance (hosting + 1h dev/mo)',      usd: 45,  cad: 59,  recurring: true     },
} as const;

export const CURRENCIES = {
  CAD: { symbol: 'CAD', rate: 1.36 },
  USD: { symbol: 'USD', rate: 1.00 },
  EUR: { symbol: 'EUR', rate: 0.92 },
  GBP: { symbol: 'GBP', rate: 0.79 },
} as const;

export const DEFAULT_CURRENCY = 'CAD' as const;

export type ProjectType = keyof typeof PROJECT_TYPES;
export type Timeline = keyof typeof TIMELINES;
export type AddonKey = keyof typeof ADDONS;
export type Currency = keyof typeof CURRENCIES;

export function calculateQuote(projectType: ProjectType, timeline: Timeline, addonKeys: AddonKey[]) {
  const base = PROJECT_TYPES[projectType].baseUSD;
  const oneOffAddons = addonKeys
    .filter(k => !('recurring' in ADDONS[k]))
    .reduce((sum, k) => sum + (ADDONS[k] as { usd: number }).usd, 0);
  const recurringAddons = addonKeys
    .filter(k => 'recurring' in ADDONS[k])
    .reduce((sum, k) => sum + (ADDONS[k] as { usd: number }).usd, 0);
  const subtotal = base + oneOffAddons;
  const total = Math.round(subtotal * TIMELINES[timeline].multiplier * 100) / 100;
  return { baseUSD: base, addonsUSD: oneOffAddons, subtotalUSD: subtotal, totalUSD: total, recurringUSD: recurringAddons };
}

export function convertCurrency(amountUSD: number, currency: Currency): number {
  return Math.round(amountUSD * CURRENCIES[currency].rate);
}

export function getBasePrice(projectType: ProjectType, currency: Currency): number {
  if (currency === 'CAD') return PROJECT_TYPES[projectType].baseCAD;
  return Math.round(PROJECT_TYPES[projectType].baseUSD * CURRENCIES[currency].rate);
}

export function getAddonPrice(key: AddonKey, currency: Currency): number {
  const addon = ADDONS[key] as { usd: number; cad: number };
  if (currency === 'CAD') return addon.cad;
  return Math.round(addon.usd * CURRENCIES[currency].rate);
}

export function calculateQuoteDisplay(
  projectType: ProjectType,
  timeline: Timeline,
  addonKeys: AddonKey[],
  currency: Currency,
): { base: number; addons: number; total: number; recurring: number } {
  if (currency === 'CAD') {
    const base = PROJECT_TYPES[projectType].baseCAD;
    const oneOff = addonKeys
      .filter(k => !('recurring' in ADDONS[k]))
      .reduce((s, k) => s + (ADDONS[k] as { cad: number }).cad, 0);
    const rec = addonKeys
      .filter(k => 'recurring' in ADDONS[k])
      .reduce((s, k) => s + (ADDONS[k] as { cad: number }).cad, 0);
    const total = Math.round((base + oneOff) * TIMELINES[timeline].multiplier);
    return { base, addons: oneOff, total, recurring: rec };
  }
  const usd = calculateQuote(projectType, timeline, addonKeys);
  const rate = CURRENCIES[currency].rate;
  return {
    base: Math.round(usd.baseUSD * rate),
    addons: Math.round(usd.addonsUSD * rate),
    total: Math.round(usd.totalUSD * rate),
    recurring: Math.round(usd.recurringUSD * rate),
  };
}
