import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { useState } from "react";
import { CURRENCIES, ADDONS, Currency, convertCurrency, getBasePrice, getAddonPrice, ProjectType } from "@/lib/pricing";

const TIERS = [
  {
    key: "spark",
    name: "SPARK",
    subtitle: "Landing page",
    delivery: "24-48 hours",
    priceCAD: 390,
    priceUSD: 290,
    recommended: false,
    features: [
      "1 page (Hero · Features · Pricing/CTA · FAQ · Footer)",
      "Custom Next.js + Tailwind code, no templates",
      "Resend contact form",
      "Mobile-responsive",
      "1 revision round",
      "Source code transferred to your GitHub",
      "Guarantee: 48h or -50%",
    ],
    bestFor: "Indie hackers, Product Hunt launches, MVPs, short campaigns",
  },
  {
    key: "vitrine",
    name: "VITRINE",
    subtitle: "Showcase site",
    delivery: "3-5 days",
    priceCAD: 790,
    priceUSD: 590,
    recommended: true,
    features: [
      "3-5 pages (Home, About, Services, Contact, Blog or custom)",
      "Supabase-backed form (CSV export of leads)",
      "SEO setup (meta tags, Open Graph, sitemap, JSON-LD)",
      "Plausible Analytics",
      "2 revision rounds",
      "30-min brief call",
      "Guarantee: 5 days or -25%",
    ],
    bestFor: "TPE, coaches, consultants, freelancers, small studios",
  },
  {
    key: "vitrineplus",
    name: "VITRINE+",
    subtitle: "Showcase Plus",
    delivery: "5-7 days",
    priceCAD: 1290,
    priceUSD: 950,
    recommended: false,
    features: [
      "5-7 pages",
      "Newsletter signup (Resend Audiences + opt-in auto)",
      "Booking integration (Calendly or Supabase slots)",
      "Bilingual FR + EN included",
      "Extended SEO with per-page Open Graph",
      "2 revision rounds",
      "45-min onboarding call",
      "Guarantee: 7 days or -25%",
    ],
    bestFor: "Pros wanting more: lead capture, booking, bilingual presence",
  },
];

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>("CAD");

  function displayTierPrice(key: string): number {
    return getBasePrice(key as ProjectType, currency);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight max-w-3xl">
              PRICING — Transparent. Predictable. No surprises.
            </h1>
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
            {TIERS.map(tier => (
              <div
                key={tier.key}
                className={`relative flex flex-col p-8 gap-8 transition-all ${tier.recommended ? "border-2 border-primary bg-card shadow-xl shadow-primary/5" : "border border-border bg-card hover:border-primary/50"}`}
                data-testid={`card-tier-${tier.key}`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-mono px-3 py-1 uppercase">
                    Recommended
                  </div>
                )}
                <div>
                  <h4 className={`font-mono text-sm mb-1 ${tier.recommended ? "text-primary" : "text-muted-foreground"}`}>
                    {tier.name}
                  </h4>
                  <p className="text-muted-foreground text-sm mb-4">{tier.subtitle} / {tier.delivery}</p>
                  <div className="font-serif text-5xl mb-1">
                    ${displayTierPrice(tier.key).toLocaleString()}{" "}
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
                  Best for: {tier.bestFor}
                </p>
                <Link
                  href="/start"
                  data-testid={`link-start-${tier.key}`}
                  className={`inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors ${tier.recommended ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-background hover:bg-accent hover:text-accent-foreground"}`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>

          {/* Add-ons Table */}
          <div className="mb-24">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">AVAILABLE ADD-ONS</h2>
            <div className="border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-border">
                  {(Object.entries(ADDONS) as [keyof typeof ADDONS, (typeof ADDONS)[keyof typeof ADDONS]][]).map(([key, addon]) => (
                    <tr key={key} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 py-5 font-medium">{addon.label}</td>
                      <td className="p-4 py-5 text-right font-mono text-muted-foreground">
                          {`+$${getAddonPrice(key, currency)}${"recurring" in addon ? "/mo" : ""} ${currency}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Why Fixed Price */}
          <div className="mb-24">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-8">WHY FIXED PRICE?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">TIME IS NOT THE PRODUCT.</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Most freelancers bill hourly. You pay for slow days. With fixed price, the only person who pays for inefficiency is me — which is why I work fast.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">YOU KNOW THE BUDGET.</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No scope creep surprises, no "this will take 2 more weeks" conversations. The price is the price.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">YOU OWN THE CODE.</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fixed-price projects ship with full GitHub transfer at delivery. You're never trapped in a maintenance contract.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-24">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">COMPARISON</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 font-sans text-xs text-muted-foreground font-normal uppercase tracking-widest"></th>
                    <th className="p-4 font-sans text-xs text-primary font-bold uppercase tracking-widest bg-primary/5">Mehdi Jabry</th>
                    <th className="p-4 font-sans text-xs text-muted-foreground font-normal uppercase tracking-widest">Traditional Agency</th>
                    <th className="p-4 font-sans text-xs text-muted-foreground font-normal uppercase tracking-widest">Subscription (DesignJoy)</th>
                    <th className="p-4 font-sans text-xs text-muted-foreground font-normal uppercase tracking-widest">Webflow Freelancer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Starting price", "From $390 CAD", "$5,000+", "~$5k/month", "$500–$2k"],
                    ["Speed", "24h to 7 days", "4–12 weeks", "Task by task", "1–3 weeks"],
                    ["Custom code", "Yes — Next.js/React", "Sometimes (often WP)", "Webflow / Framer", "No — Webflow only"],
                    ["Code ownership", "100% yours", "Usually yours", "Tied to platform", "Tied to Webflow"],
                    ["Price model", "One-off, fixed", "Variable / Hourly", "Monthly recurring", "Variable"],
                  ].map(([label, ...cols]) => (
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
              → Configure your quote
            </Link>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
