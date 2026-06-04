import { Layout } from "@/components/layout/layout";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { CURRENCIES, convertCurrency } from "@/lib/pricing";

import { ScrambleText } from "@/components/effects/scramble-text";
import { Magnetic } from "@/components/effects/magnetic";
import { TiltCard } from "@/components/effects/tilt-card";
import { Marquee } from "@/components/effects/marquee";
import { Reveal, RevealWords } from "@/components/effects/reveal";
import { LiveTime } from "@/components/effects/live-time";

const TIERS = [
  {
    key: "spark",
    name: "SPARK",
    subtitle: "Landing page",
    delivery: "24–48h",
    priceCAD: 390,
    priceUSD: 290,
    recommended: false,
    features: ["1 page, custom Next.js", "Resend contact form", "Mobile-responsive", "1 revision round"],
  },
  {
    key: "vitrine",
    name: "VITRINE",
    subtitle: "Showcase site",
    delivery: "3–5 days",
    priceCAD: 790,
    priceUSD: 590,
    recommended: true,
    features: ["3–5 pages", "Supabase form + SEO", "Plausible Analytics", "2 revision rounds"],
  },
  {
    key: "vitrineplus",
    name: "VITRINE+",
    subtitle: "Showcase Plus",
    delivery: "5–7 days",
    priceCAD: 1290,
    priceUSD: 950,
    recommended: false,
    features: ["5–7 pages + booking", "Newsletter signup", "Bilingual FR + EN", "45-min onboarding call"],
  },
];

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

const FEATURED_WORK = [
  {
    title: "DS AI Manager",
    href: "https://ds-ai-manager.com",
    meta: "Personal project · 2026",
    blurb:
      "AI agent for serious marketers — 13 specialised skills brand-aligned to your studio.",
    stack: "Next.js · TypeScript · Supabase · Stripe",
  },
  {
    title: "Brooklyn Mobile Notary",
    href: "https://proposal.mehdijabry.dev/brooklyn-notary-x7k9p/",
    meta: "Service business · Brooklyn, NY · 2026",
    blurb:
      "Booking-driven notary site with admin dashboard and Resend transactional emails.",
    stack: "Next.js · Supabase · Resend · Cloudflare",
  },
  {
    title: "Ntaco Construction",
    href: "https://proposal.mehdijabry.dev/ntaco-c9k4m/",
    meta: "Construction studio · Cyprus · 2026",
    blurb:
      "Industrial-premium portfolio site with project portfolio CMS and lead pipeline.",
    stack: "Vite · React · Supabase · Tailwind",
  },
  {
    title: "Salwa El Jaouhari",
    href: "https://salwaeljaouhari.art",
    meta: "Art portfolio · Morocco · 2025",
    blurb:
      "Portfolio artistique — peinture, illustration et art contemporain.",
    stack: "Next.js · TypeScript · Tailwind",
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
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative container mx-auto px-4 pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        {/* subtle radial accent behind heading */}
        <div
          aria-hidden
          className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative z-10 max-w-5xl">
          <Reveal>
            <div className="inline-flex items-center border border-border/60 px-3 py-1 text-[10px] font-sans uppercase tracking-[0.2em] text-muted-foreground mb-8">
              <span className="opacity-70 mr-2">01 —</span>INDEPENDENT WEB STUDIO · TROIS-RIVIÈRES → WORLDWIDE
            </div>
          </Reveal>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] leading-[0.95] tracking-[-0.04em] mb-8">
            <ScrambleText
              text="Production-ready websites,"
              duration={750}
              delay={150}
              as="span"
              className="block"
            />
            <em className="text-primary italic font-display-wonk block mt-2">
              <ScrambleText text="shipped in 72 hours." duration={950} delay={650} as="span" />
            </em>
          </h1>

          <Reveal delay={1.3}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-3 leading-relaxed">
              Custom code. Production-grade. Source code yours from day one.
              No subscriptions, no templates, no monthly fees from me.
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/80 mb-10">
              From C$390 · Tier 1 ships in 24–48h
            </p>
          </Reveal>

          <Reveal delay={1.55}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Magnetic strength={0.4}>
                <Link
                  href="/start"
                  data-testid="link-hero-cta"
                  className="group inline-flex h-14 items-center justify-center whitespace-nowrap px-10 text-sm font-medium tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <span>Start a project</span>
                  <span className="ml-3 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <a
                  href="#work"
                  data-testid="link-hero-work"
                  className="inline-flex h-14 items-center justify-center whitespace-nowrap px-10 text-sm font-medium tracking-wide border border-border bg-transparent hover:bg-foreground/5 transition-colors"
                >
                  See selected work
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={1.8}>
            <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              <LiveTime />
              <span className="opacity-60">·</span>
              <span>Replies within 4 hours</span>
              <span className="opacity-60">·</span>
              <span>Scroll to explore ↓</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TRUST + MARQUEE ────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/30 py-14">
        <Reveal>
          <p className="text-center font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
            BUILT WITH THE SAME STACK I TRUST IN PRODUCTION
          </p>
        </Reveal>
        <Marquee duration={45} className="text-foreground/40">
          <div className="flex gap-12">
            {TECH_STACK.map((t) => (
              <span
                key={t}
                className="font-mono text-base tracking-[0.05em] whitespace-nowrap"
              >
                {t}
                <span className="ml-12 opacity-30">/</span>
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      {/* ── PROCESS ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                02 — HOW IT WORKS
              </p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                <em className="italic">Three days.</em><br />Zero ambiguity.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: "DAY 0", t: "BRIEF", d: "30-minute call. I capture scope, deadlines, and required assets." },
              { n: "DAY 1–2", t: "BUILD", d: "Custom Next.js + Supabase code. I share progress every evening." },
              { n: "DAY 3", t: "SHIP", d: "Live on your domain. Source code transferred to your GitHub." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={0.1 + i * 0.12}>
                <div className="flex flex-col gap-3 border-t border-border/60 pt-6">
                  <span className="font-display italic text-4xl text-primary/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.n}
                  </span>
                  <h3 className="font-sans font-medium text-lg">{s.t}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED WORK ──────────────────────────────────────── */}
      <section id="work" className="container mx-auto px-4 py-28 border-t border-border/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              03 — SELECTED WORK
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight max-w-2xl">
              <RevealWords text="A handful of recent builds." delay={0.1} />
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              href="/work"
              className="font-mono text-xs uppercase tracking-[0.2em] hover:text-primary transition-colors"
            >
              All work →
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURED_WORK.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.1}>
              <TiltCard className="h-full">
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full"
                >
                  <article className="border border-border bg-card p-8 h-full flex flex-col gap-5 transition-all duration-500 hover:border-primary/50">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-2xl md:text-3xl leading-tight tracking-tight group-hover:text-primary transition-colors">
                        <em className="italic">{w.title}</em>
                      </h3>
                      <span className="font-mono text-xs text-muted-foreground/70 shrink-0 mt-2 group-hover:translate-x-1 transition-transform">
                        ↗
                      </span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                      {w.meta}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {w.blurb}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/70 pt-5 border-t border-border/40">
                      {w.stack}
                    </p>
                  </article>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="bg-muted/30 py-28 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                04 — PRICING · TRANSPARENT
              </p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                <em className="italic">Predictable.</em> No surprises.
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex bg-background border border-border p-1">
                {(["CAD", "USD", "EUR", "GBP"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    data-testid={`button-home-currency-${c.toLowerCase()}`}
                    className={`px-3 py-1.5 text-xs font-mono tracking-wide transition-colors ${
                      currency === c
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <Reveal key={tier.key} delay={i * 0.12}>
                <div
                  className={`relative flex flex-col gap-6 p-8 h-full transition-all duration-300 hover:-translate-y-1 ${
                    tier.recommended
                      ? "border border-primary bg-background shadow-[0_0_0_1px] shadow-primary/40"
                      : "border border-border bg-background"
                  }`}
                  data-testid={`card-home-tier-${tier.key}`}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-8 bg-primary text-primary-foreground text-[10px] font-mono px-3 py-1 uppercase tracking-[0.18em]">
                      Most popular
                    </div>
                  )}
                  <div>
                    <h4
                      className={`font-mono text-xs tracking-[0.2em] mb-3 ${
                        tier.recommended ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {tier.name}
                    </h4>
                    <div className="font-display text-5xl tracking-tight mb-2">
                      ${displayPrice(tier.priceCAD, tier.priceUSD).toLocaleString()}
                      <span className="text-sm font-mono text-muted-foreground uppercase ml-2 align-top">
                        {currency}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tier.subtitle} · {tier.delivery}
                    </p>
                  </div>
                  <ul className="text-sm space-y-2.5 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex gap-3 text-muted-foreground">
                        <span className="text-primary shrink-0">→</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Magnetic strength={0.25}>
                    <Link
                      href="/start"
                      className={`inline-flex h-11 w-full items-center justify-center px-6 text-sm font-medium transition-colors ${
                        tier.recommended
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border hover:bg-foreground/5"
                      }`}
                    >
                      Choose {tier.name.toLowerCase()} →
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT TEASER ───────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-3">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                05 — ABOUT
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-9 max-w-3xl">
            <Reveal>
              <p className="font-display text-2xl md:text-3xl leading-[1.3] tracking-tight">
                I'm <em className="italic text-primary">Mohamed Mehdi Jabry</em>. 35. Based in Trois-Rivières, Québec.
                Three master's degrees, hands-on AI training since 2023.
                Marketing consultant at{" "}
                <a
                  href="https://cradly.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-primary/50 underline-offset-4 hover:text-primary transition-colors"
                >
                  Cradly UK
                </a>{" "}
                while running two products:{" "}
                <a
                  href="https://ds-ai-manager.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-primary/50 underline-offset-4 hover:text-primary transition-colors"
                >
                  ds-ai-manager.com
                </a>{" "}
                and this studio.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 text-muted-foreground leading-relaxed text-lg">
                I build websites the way I'd want one built for myself — fast,
                custom, with the code yours from day one. Bilingual French and
                English. I work with founders and service businesses worldwide.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 mt-8 text-primary font-mono text-xs uppercase tracking-[0.2em] hover:underline underline-offset-4"
              >
                → More about me
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-28 border-t border-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                06 — FAQ
              </p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                <em className="italic">Common</em> questions.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-9 max-w-3xl">
            <Reveal>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-display text-xl text-left">What's actually included in each tier?</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    Spark covers 1-page landings — shipped in 24–48h. Vitrine covers
                    3–5 page showcase sites — 3–5 days. Vitrine+ adds newsletter signup,
                    booking, and bilingual — 5–7 days. The clock starts the moment I
                    have your deposit AND all required assets.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-display text-xl text-left">Do I own the code?</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    Yes. Source code transferred to your GitHub on delivery day. Host anywhere, modify freely. No vendor lock-in, ever.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-display text-xl text-left">What if you miss the deadline?</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    I guarantee it in writing. Miss Spark deadline (48h) and the
                    project is reduced by 50%. Miss Vitrine or Vitrine+ deadline and
                    it's reduced by 25%. The clock starts when I have all your assets.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-display text-xl text-left">Can I host the site myself instead of using Render?</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    Absolutely. Deploy to Vercel, Render, your own VPS, anything Node-compatible. Portable code.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-display text-xl text-left">Do you do logo design and copywriting?</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    Logo: optional add-on (typographic, $120 CAD). Copy assist: +$150 CAD add-on, or you provide it.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="font-display text-xl text-left">What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    Stripe (cards CAD/USD/EUR/GBP) and Wise (bank transfer UK/US/EU/CA). 50% on order, 50% on delivery.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger className="font-display text-xl text-left">Why is your pricing so accessible compared to agencies?</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    Two reasons: (1) I'm a solo studio with low overhead, and (2) I
                    use AI to accelerate the build phase without sacrificing quality.
                    Same production-grade code an agency would ship, delivered in days
                    instead of weeks, at a fraction of the cost. I'm building my book
                    of business now — prices will increase as demand grows.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────── */}
      <section id="contact" className="bg-muted/30 py-32 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              07 — READY TO SHIP?
            </p>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[-0.03em] leading-[0.95] mb-12 max-w-4xl mx-auto">
              <em className="italic">Tell me</em> about your project.<br />
              I reply within 4 hours.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <Magnetic strength={0.4}>
                <Link
                  href="/start"
                  className="inline-flex h-16 items-center justify-center whitespace-nowrap px-12 text-base font-medium tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Configure your quote →
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <a
                  href="https://calendly.com/mehdijabry/discovery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-16 items-center justify-center whitespace-nowrap px-12 text-base font-medium tracking-wide border border-border hover:bg-foreground/5 transition-colors"
                >
                  Book a 15-min call
                </a>
              </Magnetic>
            </div>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              <LiveTime /> · Same-week availability
            </p>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
}
