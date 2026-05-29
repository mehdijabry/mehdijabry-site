import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { CURRENCIES, convertCurrency } from "@/lib/pricing";

const TIERS = [
  {
    key: "spark",
    name: "SPARK",
    subtitle: "Landing page",
    delivery: "24-48h",
    priceCAD: 390,
    priceUSD: 290,
    recommended: false,
    features: ["1 page, custom Next.js", "Resend contact form", "Mobile-responsive", "1 revision round"],
  },
  {
    key: "vitrine",
    name: "VITRINE",
    subtitle: "Showcase site",
    delivery: "3-5 days",
    priceCAD: 790,
    priceUSD: 590,
    recommended: true,
    features: ["3-5 pages", "Supabase form + SEO", "Plausible Analytics", "2 revision rounds"],
  },
  {
    key: "vitrineplus",
    name: "VITRINE+",
    subtitle: "Showcase Plus",
    delivery: "5-7 days",
    priceCAD: 1290,
    priceUSD: 950,
    recommended: false,
    features: ["5-7 pages + booking", "Newsletter signup", "Bilingual FR + EN", "45-min onboarding call"],
  },
];

export default function Home() {
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>("CAD");

  function displayPrice(priceCAD: number, priceUSD: number): number {
    if (currency === "CAD") return priceCAD;
    return convertCurrency(priceUSD, currency);
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <FadeIn>
          <div className="inline-flex items-center border border-border/60 px-3 py-1 text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-6">
            INDEPENDENT WEB STUDIO · MONTRÉAL
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl mb-6">
            Production-ready websites,<br />
            <em className="text-primary italic font-display-wonk">shipped in 72 hours.</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            Custom code. No subscription. No templates. From $390 CAD.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/start"
              data-testid="link-hero-cta"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Try a quote →
            </Link>
            <a
              href="#work"
              data-testid="link-hero-work"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              See my work
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border/50 bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">
              BUILT WITH THE SAME STACK I TRUST IN PRODUCTION
            </p>
            <div className="flex flex-wrap justify-center gap-8 font-mono text-sm text-foreground/80 mb-6">
              <span>next.js</span>
              <span>supabase</span>
              <span>stripe</span>
              <span>resend</span>
              <span>render</span>
            </div>
            <a
              href="https://ds-ai-manager.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all duration-300"
            >
              See an example I shipped — ds-ai-manager.com →
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Process */}
      <section className="container mx-auto px-4 py-24">
        <FadeIn>
          <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-12">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="font-serif text-3xl">DAY 0</div>
              <h3 className="font-sans font-medium text-lg">BRIEF</h3>
              <p className="text-muted-foreground">30-minute call. I capture the scope, deadlines, and required assets.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="font-serif text-3xl">DAY 1-2</div>
              <h3 className="font-sans font-medium text-lg">BUILD</h3>
              <p className="text-muted-foreground">Custom Next.js + Supabase code. I share progress on Day 1 evening.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="font-serif text-3xl text-primary">DAY 3</div>
              <h3 className="font-sans font-medium text-lg text-primary">SHIP</h3>
              <p className="text-muted-foreground">Live on your domain. Source code transferred to your GitHub.</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Featured Work */}
      <section id="work" className="container mx-auto px-4 py-24 border-t border-border/50">
        <FadeIn>
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground">FEATURED WORK</h2>
            <Link href="/work" className="text-sm hover:text-primary transition-colors">All work →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <a href="https://ds-ai-manager.com" target="_blank" rel="noopener noreferrer" className="group block h-full">
              <div className="border border-border bg-card p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg">
                <h3 className="font-serif text-2xl group-hover:text-primary transition-colors">DS AI Manager</h3>
                <p className="text-muted-foreground text-sm flex-1">AI agent for serious marketers — 13 specialised skills</p>
                <div className="font-mono text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  Next.js · TypeScript · Supabase · Stripe
                </div>
              </div>
            </a>
            <a href="https://salwaeljaouhari.art" target="_blank" rel="noopener noreferrer" className="group block h-full">
              <div className="border border-border bg-card p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg">
                <h3 className="font-serif text-2xl group-hover:text-primary transition-colors">Salwa El Jaouhari</h3>
                <p className="text-muted-foreground text-sm flex-1">Portfolio artistique — peinture, illustration et art contemporain</p>
                <div className="font-mono text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  Next.js · TypeScript · Tailwind
                </div>
              </div>
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-muted/30 py-24 border-y border-border/50">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-4">PRICING — TRANSPARENT</h2>
                <h3 className="font-serif text-3xl md:text-4xl">Predictable. No surprises.</h3>
              </div>
              <div className="flex bg-background border border-border p-1">
                {(["CAD", "USD", "EUR", "GBP"] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    data-testid={`button-home-currency-${c.toLowerCase()}`}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${currency === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TIERS.map(tier => (
                <div
                  key={tier.key}
                  className={`relative flex flex-col gap-6 p-8 ${tier.recommended ? "border-2 border-primary bg-background shadow-lg shadow-primary/5" : "border border-border bg-background"}`}
                  data-testid={`card-home-tier-${tier.key}`}
                >
                  {tier.recommended && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-mono px-3 py-1 uppercase">Recommended</div>
                  )}
                  <div>
                    <h4 className={`font-mono text-sm mb-2 ${tier.recommended ? "text-primary" : ""}`}>{tier.name}</h4>
                    <div className="font-serif text-4xl mb-1">
                      ${displayPrice(tier.priceCAD, tier.priceUSD).toLocaleString()}{" "}
                      <span className="text-sm font-sans text-muted-foreground uppercase">{currency}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.subtitle} / {tier.delivery}</p>
                  </div>
                  <ul className="text-sm space-y-2 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex gap-2 text-muted-foreground">
                        <span className="text-primary shrink-0">→</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/start"
                className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Configure your quote →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* About Teaser */}
      <section className="container mx-auto px-4 py-24">
        <FadeIn>
          <div className="max-w-3xl">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">ABOUT</h2>
            <p className="font-serif text-lg leading-relaxed mt-4">
              I'm Mohamed Mehdi Jabry. 35. Based in Montréal.
              Three master's degrees (Business · Brand Marketing · Project Management),
              hands-on AI training since 2023, and right now I serve as marketing
              consultant at{" "}
              <a href="https://cradly.co.uk" target="_blank" rel="noopener noreferrer" className="underline decoration-primary/50 underline-offset-4 hover:text-primary transition-colors">
                Cradly UK
              </a>{" "}
              while running two products:{" "}
              <a href="https://ds-ai-manager.com" target="_blank" rel="noopener noreferrer" className="underline decoration-primary/50 underline-offset-4 hover:text-primary transition-colors">
                ds-ai-manager.com
              </a>{" "}
              and this studio.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              I build websites the way I'd want one built for myself — fast,
              custom, the code is yours from day one.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 mt-6 text-primary hover:underline underline-offset-4 font-medium transition-all">
              <span className="text-primary">→</span> More about me
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-24 border-t border-border/50">
        <FadeIn>
          <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-12">FAQ</h2>
          <div className="max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-serif text-xl">What's actually included in each tier?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Spark covers 1-page landings — shipped in 24-48h. Vitrine covers
                  3-5 page showcase sites — 3-5 days. Vitrine+ adds newsletter signup,
                  booking, and bilingual — 5-7 days. The clock starts the moment I
                  have your deposit AND all required assets.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-serif text-xl">Do I own the code?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Yes. Source code transferred to your GitHub on delivery day. Host anywhere, modify freely. No vendor lock-in, ever.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-serif text-xl">What if you miss the deadline?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  I guarantee it in writing. Miss Spark deadline (48h) and the
                  project is reduced by 50%. Miss Vitrine or Vitrine+ deadline and
                  it's reduced by 25%. The clock starts when I have all your assets.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="font-serif text-xl">Can I host the site myself instead of using Render?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Absolutely. Deploy to Vercel, Render, your own VPS, anything Node-compatible. Portable code.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="font-serif text-xl">Do you do logo design and copywriting?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Logo: optional add-on (typographic, $120 CAD). Copy assist: +$150 CAD add-on, or you provide it.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="font-serif text-xl">Do you do e-commerce (Shopify)?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Not at the moment. I focus on landing pages and showcase sites
                  shipped fast. For full e-commerce or custom dashboards, I'll refer
                  you to specialists I trust.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger className="font-serif text-xl">What payment methods do you accept?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Stripe (cards CAD/USD/EUR/GBP) and Wise (bank transfer UK/US/EU/CA). 50% on order, 50% on delivery.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger className="font-serif text-xl">Do you sign NDAs?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Yes. Mutual NDA template available on request. Happy to sign yours if reasonable.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-9">
                <AccordionTrigger className="font-serif text-xl">Why is your pricing so accessible compared to agencies?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Two reasons: (1) I'm a solo studio with low overhead, and (2) I
                  use AI to accelerate the build phase without sacrificing quality.
                  The result: the same production-grade code an agency would ship,
                  delivered in days instead of weeks, at a fraction of the cost. I
                  own this fully — I'm building my book of business now, prices
                  will increase as the demand grows.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </FadeIn>
      </section>

      {/* Final CTA */}
      <section id="contact" className="bg-muted/30 py-32 border-t border-border/50 text-center">
        <FadeIn>
          <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-8">READY TO SHIP?</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center">
              <Link
                href="/start"
                className="inline-flex h-16 items-center justify-center whitespace-nowrap rounded-none px-12 text-lg font-serif transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                → Configure your quote
              </Link>
              <span className="text-xs text-muted-foreground mt-3">5 minutes · Instant pricing</span>
            </div>
            <div className="flex flex-col items-center">
              <a
                href="https://calendly.com/mehdijabry/discovery"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-16 items-center justify-center whitespace-nowrap rounded-none px-12 text-lg font-serif transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                → Book a 15-min discovery call
              </a>
              <span className="text-xs text-muted-foreground mt-3">Calendly · Same-week availability</span>
            </div>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
}
