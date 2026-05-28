export const PROJECT_TYPES = {
  landing:  { label: 'Landing page (1 page)',             baseUSD: 990 },
  showcase: { label: 'Showcase site (3-5 pages)',         baseUSD: 1890 },
  booking:  { label: 'Site with booking/forms (5+)',      baseUSD: 2790 },
  app:      { label: 'Mini-app or custom (login/dash)',   baseUSD: 3790 }
} as const;

export const TIMELINES = {
  standard: { label: 'Standard (72h to 14 days)', multiplier: 1.0 },
  express:  { label: 'Express (-2 days)',         multiplier: 1.3 },
  rush:     { label: 'Rush (50% faster)',         multiplier: 1.5 }
} as const;

export const ADDONS = {
  copywriting: { label: 'Copywriting included (FR or EN)', usd: 400 },
  language:    { label: 'Additional language',             usd: 320 },
  stripe_int:  { label: 'Stripe payment integration',      usd: 320 },
  migration:   { label: 'Migration from existing platform',usd: 250 },
  logo:        { label: 'Logo (typographic, simple)',       usd: 250 },
  photos:      { label: 'Curated stock photos (10-20)',     usd: 120 },
  resend_int:  { label: 'Resend transactional emails',      usd: 250 },
  training:    { label: '1h training for content updates',  usd: 120 },
  maintenance: { label: 'Monthly maintenance retainer',     usd: 129, recurring: true }
} as const;

export const CURRENCIES = {
  CAD: { symbol: 'CAD', rate: 1.36 },
  USD: { symbol: 'USD', rate: 1.00 },
  EUR: { symbol: 'EUR', rate: 0.92 },
  GBP: { symbol: 'GBP', rate: 0.79 }
} as const;

export type ProjectType = keyof typeof PROJECT_TYPES;
export type Timeline = keyof typeof TIMELINES;
export type AddonKey = keyof typeof ADDONS;
export type Currency = keyof typeof CURRENCIES;

export function calculateQuote(projectType: ProjectType, timeline: Timeline, addonKeys: AddonKey[]) {
  const base = PROJECT_TYPES[projectType].baseUSD;
  const oneOffAddons = addonKeys.filter(k => !('recurring' in ADDONS[k])).reduce((sum, k) => sum + ADDONS[k].usd, 0);
  const recurring = addonKeys.filter(k => 'recurring' in ADDONS[k]).reduce((sum, k) => sum + ADDONS[k].usd, 0);
  const subtotal = base + oneOffAddons;
  const total = subtotal * TIMELINES[timeline].multiplier;
  return { baseUSD: base, addonsUSD: oneOffAddons, subtotalUSD: subtotal, totalUSD: total, recurringUSD: recurring };
}

export function convertCurrency(amountUSD: number, currency: Currency): number {
  return Math.round(amountUSD * CURRENCIES[currency].rate);
}
