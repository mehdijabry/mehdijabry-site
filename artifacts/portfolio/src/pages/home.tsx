import { Layout } from "@/components/layout/layout";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { CURRENCIES, convertCurrency } from "@/lib/pricing";

import { ScrambleText } from "@/components/effects/scramble-text";
import { TiltCard } from "@/components/effects/tilt-card";
import { Reveal } from "@/components/effects/reveal";
import { LiveTime } from "@/components/effects/live-time";
import { CtaButton } from "@/components/effects/cta-button";
import { Spotlight } from "@/components/effects/spotlight";
import { Ticker } from "@/components/effects/ticker";
import { FloatingMark } from "@/components/effects/floating-mark";

/* ─────────────────────── DATA ─────────────────────── */

const TIERS = [
  {
    key: "spark",
    name: "Spark",
    subtitle: "Landing page",
    delivery: "24–48h",
    priceCAD: 390,
    priceUSD: 290,
    recommended: false,
    features: [
      "Single-page Next.js, fully custom",
      "Resend transactional form",
      "Mobile-responsive + dark mode",
      "1 revision round",
    ],
  },
  {
    key: "vitrine",
    name: "Vitrine",
    subtitle: "Showcase site",
    delivery: "3–5 days",
    priceCAD: 790,
    priceUSD: 590,
    recommended: true,
    features: [
      "3–5 pages, Supabase form + SEO",
      "Plausible analytics + sitemap",
      "Subtle motion + custom typography",
      "2 revision rounds",
    ],
  },
  {
    key: "vitrineplus",
    name: "Vitrine+",
    subtitle: "Showcase Plus",
    delivery: "5–7 days",
    priceCAD: 1290,
    priceUSD: 950,
    recommended: false,
    features: [
      "5–7 pages + booking module",
      "Bilingual FR + EN",
      "Newsletter signup + admin panel",
      "45-min onboarding call",
    ],
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
    n: "01",
    title: "DS AI Manager",
    href: "https://ds-ai-manager.com",
    meta: "Personal · 2026",
    blurb: "AI agent for serious marketers — 13 specialised skills.",
    stack: "Next.js / TS / Supabase / Stripe",
  },
  {
    n: "02",
    title: "Brooklyn Mobile Notary",
    href: "https://proposal.mehdijabry.dev/brooklyn-notary-x7k9p/",
    meta: "Service · Brooklyn, NY · 2026",
    blurb: "Booking-driven notary site with admin dashboard + Resend mailers.",
    stack: "Next.js / Supabase / Resend / Cloudflare",
  },
  {
    n: "03",
    title: "Ntaco Construction",
    href: "https://proposal.mehdijabry.dev/ntaco-c9k4m/",
    meta: "Construction · Cyprus · 2026",
    blurb: "Industrial-premium portfolio with project CMS + lead pipeline.",
    stack: "Vite / React / Supabase / Tailwind",
  },
  {
    n: "04",
    title: "Salwa El Jaouhari",
    href: "https://salwaeljaouhari.art",
    meta: "Art portfolio · Morocco · 2025",
    blurb: "Portfolio peinture & illustration — minimal, expressif.",
    stack: "Next.js / TS / Tailwind",
  },
];

const PROCESS = [
  {
    n: "01",
    day: "Day 0",
    title: "Brief",
    body:
      "30-minute call. I capture scope, deadlines, required assets. You leave with a writeup.",
  },
  {
    n: "02",
    day: "Day 1–2",
    title: "Build",
    body:
      "Custom Next.js + Supabase. Daily Loom + Vercel preview. No surprises.",
  },
  {
    n: "03",
    day: "Day 3",
    title: "Ship",
    body:
      "Deploy on Render or your infra. SEO, analytics, monitoring. Source code yours.",
  },
];

/* ────────────────────── COMPONENT ────────────────────── */

export default function Home() {
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>("CAD");

  function displayPrice(priceCAD: number, priceUSD: number): number {
    if (currency === "CAD") return priceCAD;
    return convertCurrency(priceUSD, currency);
  }

  return (
    <Layout>
      {/* ════════════════════════════════════════════════════════════
          HERO — full-bleed aurora, cursor spotlight, oversized type
      ════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden flex items-center pt-24 pb-16 md:pt-28 md:pb-20">
        <Spotlight size={520} />
        <FloatingMark />

        <div className="relative z-10 container mx-auto px-4">
          {/* eyebrow row */}
          <Reveal>
            <div className="flex items-center justify-between gap-4 mb-8 md:mb-12">
              <div className="chip">
                <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                <span>Booking · Q3 2026</span>
              </div>
              <div className="hidden md:flex items-center gap-3 text-mark text-muted-foreground">
                <span>(01)</span>
                <span>—</span>
                <span>Independent Web Studio</span>
              </div>
            </div>
          </Reveal>

          {/* headline — half the previous size, fits above the fold */}
          <h1 className="text-display text-[clamp(40px,6.5vw,96px)] max-w-[1100px] leading-[0.95]">
            <ScrambleText
              text="Production-ready websites, "
              duration={700}
              delay={120}
              as="span"
            />
            <span className="text-primary">
              <ScrambleText
                text="shipped in 72 hours."
                duration={900}
                delay={620}
                as="span"
              />
            </span>
          </h1>

          {/* sub-row */}
          <Reveal delay={1.4}>
            <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <p className="md:col-span-6 text-base md:text-lg leading-relaxed text-muted-foreground max-w-xl">
                Custom code, no templates, no monthly fee from me.
                Source yours from day one. Built solo, in Quebec,
                for founders who care about craft.
              </p>

              <div className="md:col-span-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
                <CtaButton to="/start" variant="primary" hoverLabel="Let's talk" data-testid="link-hero-cta">
                  Start a project
                </CtaButton>
                <CtaButton href="#work" variant="ghost" hoverLabel="Show me" data-testid="link-hero-work">
                  See selected work
                </CtaButton>
              </div>
            </div>
          </Reveal>

          {/* meta row */}
          <Reveal delay={1.6}>
            <div className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-border/40 pt-6">
              <Meta label="From" value="C$390" sub="Tier 1 ships in 24–48h" />
              <Meta label="Status" value={<LiveTime />} sub="Replies under 4 hours" />
              <Meta label="Stack" value="Next · Supabase" sub="Serverless by default" />
              <Meta label="Where" value="Trois-Rivières → ∞" sub="Remote-first, EU + NA" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          TICKER DIVIDER — oversized brand banner
      ════════════════════════════════════════════════════════════ */}
      <section className="relative border-y border-border/40 bg-background/50  py-6 md:py-8 overflow-hidden">
        <Ticker duration={42}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="font-display font-bold text-[clamp(28px,4vw,56px)] leading-none tracking-[-0.04em] flex items-center gap-8 text-foreground/70"
            >
              <span>Independent web studio</span>
              <span className="text-primary text-[0.7em]">✦</span>
              <span className="text-primary">since 2025</span>
              <span className="text-primary text-[0.7em]">✦</span>
            </span>
          ))}
        </Ticker>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PROCESS — three numbered cards, layered ink + rule lines
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-20">
            <Reveal className="md:col-span-4">
              <div className="chip mb-6">(02) — How it works</div>
              <h2 className="text-display text-[clamp(40px,4.5vw,72px)] leading-[0.95]">
                Three days. <span className="text-primary not-italic">Zero ambiguity.</span>
              </h2>
            </Reveal>
            <Reveal className="md:col-span-7 md:col-start-6" delay={0.15}>
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                One person, one process, one inbox. You brief on Monday,
                you review every evening, you ship Wednesday. The system was
                built for me — I built the system for you.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40 border border-border/40">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.12}>
                <div className="relative bg-background p-8 md:p-10 h-full flex flex-col gap-6 group hover:bg-muted/40 transition-colors duration-500">
                  <div className="flex items-start justify-between">
                    <span className="text-display text-6xl md:text-7xl text-primary leading-none">
                      {p.n}
                    </span>
                    <span className="text-mark text-muted-foreground">{p.day}</span>
                  </div>
                  <div className="mt-auto pt-12">
                    <h3 className="font-display text-3xl md:text-4xl mb-3">
                      {p.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
                      {p.body}
                    </p>
                  </div>
                  <div className="absolute top-0 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-700" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SELECTED WORK — editorial list, no thumbnails (yet)
      ════════════════════════════════════════════════════════════ */}
      <section id="work" className="relative py-28 md:py-40 border-t border-border/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-24">
            <Reveal className="md:col-span-7">
              <div className="chip mb-6">(03) — Selected work</div>
              <h2 className="text-display text-[clamp(40px,5vw,84px)] leading-[0.95]">
                Built end-to-end.{" "}
                <span className="text-primary not-italic">Live in production.</span>
              </h2>
            </Reveal>
            <Reveal className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
              <p className="text-base text-muted-foreground leading-relaxed">
                Four sites I shipped solo — design, code, deploy, copy.
                Every project below sends real emails to a real inbox today.
              </p>
            </Reveal>
          </div>

          <div className="space-y-px bg-border/40 border border-border/40">
            {FEATURED_WORK.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-background hover:bg-muted/40 transition-colors duration-500 group"
                  data-testid={`link-work-${w.title.toLowerCase().replace(/\s+/g, '-')}`}
                  data-magnetic
                >
                  <div className="container mx-auto px-6 md:px-10 py-8 md:py-10 grid grid-cols-12 gap-4 items-baseline">
                    <span className="col-span-2 md:col-span-1 text-mark text-muted-foreground self-start mt-2">
                      {w.n}
                    </span>
                    <div className="col-span-10 md:col-span-5">
                      <h3 className="font-display text-2xl md:text-4xl lg:text-5xl tracking-[-0.035em] flex items-baseline gap-3 transition-transform duration-500 group-hover:translate-x-2">
                        {w.title}
                        <span className="text-primary inline-block transition-transform duration-500 group-hover:rotate-45 text-xl md:text-2xl">↗</span>
                      </h3>
                      <p className="text-mark text-muted-foreground mt-2">{w.meta}</p>
                    </div>
                    <p className="hidden md:block md:col-span-4 text-sm text-muted-foreground leading-relaxed">
                      {w.blurb}
                    </p>
                    <p className="hidden md:block md:col-span-2 text-mark text-muted-foreground/80 text-right">
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
      <section id="pricing" className="relative py-28 md:py-40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16 md:mb-24 items-end">
            <Reveal className="md:col-span-7">
              <div className="chip mb-6">(04) — Pricing</div>
              <h2 className="text-display text-[clamp(40px,5vw,84px)] leading-[0.95]">
                Transparent.{" "}
                <span className="text-primary not-italic">Predictable.</span>
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
                        Recommended
                      </div>
                    )}
                    <div>
                      <p className="text-mark text-muted-foreground">{tier.subtitle}</p>
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
                      Ships in {tier.delivery}
                    </p>
                    <ul className="space-y-3 mt-2 mb-8 flex-1">
                      {tier.features.map((f) => (
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
                      hoverLabel={`Get ${tier.name}`}
                      data-testid={`button-select-${tier.key}`}
                    >
                      Choose {tier.name}
                    </CtaButton>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.3}>
            <p className="mt-10 text-center text-mark text-muted-foreground">
              All tiers include source code · domain setup · 7 days post-launch support
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          ABOUT — editorial body, asymmetric grid
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 md:py-40 border-t border-border/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <Reveal className="md:col-span-3">
              <div className="chip mb-6">(05) — About</div>
              <p className="text-mark text-muted-foreground">
                The vintner drinks
                <br />
                his own wine.
              </p>
            </Reveal>
            <Reveal className="md:col-span-9 md:col-start-4" delay={0.15}>
              <p className="font-display text-[clamp(28px,3.4vw,52px)] leading-[1.15] tracking-[-0.025em] text-foreground">
                I'm <span className="text-primary">Mohamed Mehdi Jabry</span>.
                Three masters' degrees, hands-on AI training since 2023.
                Marketing consultant at{" "}
                <span className="underline decoration-primary/60 underline-offset-[6px] decoration-from-font">
                  Cradly UK
                </span>{" "}
                while running two products of my own:{" "}
                <a
                  href="https://ds-ai-manager.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-primary/60 underline-offset-[6px] hover:decoration-primary transition-colors"
                >
                  ds-ai-manager.com
                </a>{" "}
                and this studio.
              </p>
              <div className="mt-12">
                <CtaButton to="/about" variant="ghost" size="md" hoverLabel="Meet Mehdi">
                  Full background
                </CtaButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 md:py-40 border-t border-border/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
            <Reveal className="md:col-span-4">
              <div className="chip mb-6">(06) — FAQ</div>
              <h2 className="text-display text-[clamp(40px,4.5vw,72px)] leading-[0.95]">
                Common <span className="text-primary not-italic">questions.</span>
              </h2>
            </Reveal>
            <Reveal className="md:col-span-8" delay={0.15}>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "What's actually included in each tier?",
                    a: "Custom design, custom code, dark mode by default, mobile responsive, source code on GitHub yours from day one, domain setup, and 7 days post-launch support. No templates, no page builders.",
                  },
                  {
                    q: "Do I own the code?",
                    a: "Yes. The repository is transferred to your GitHub on delivery. You can host, fork, modify or hire someone else to maintain it. No vendor lock-in.",
                  },
                  {
                    q: "What if you miss the deadline?",
                    a: "I refund the difference at C$50/day until delivery. It's never happened — but the policy is in the contract.",
                  },
                  {
                    q: "Can I host the site myself instead of using Render?",
                    a: "Of course. I deploy to whatever fits your infrastructure: Render, Vercel, Cloudflare Pages, Netlify, even your own server.",
                  },
                  {
                    q: "Do you do logo design and copywriting?",
                    a: "Light copy polish yes. Brand identity & long-form copywriting no — I partner with two designers I trust if you need it.",
                  },
                  {
                    q: "What payment methods do you accept?",
                    a: "Stripe (card / Apple Pay / Google Pay), Interac (CA), or wire transfer. 50% to start, 50% on delivery for VITRINE+; full upfront for SPARK & VITRINE.",
                  },
                  {
                    q: "Why is your pricing so accessible vs. agencies?",
                    a: "I'm one person, with a tight stack and an AI-augmented workflow. No account managers, no slide decks, no SaaS contracts under my umbrella. You pay for the build, not the agency.",
                  },
                ].map((item, i) => (
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
      <section id="contact" className="relative py-32 md:py-48 border-t border-border/40 overflow-hidden">
        <Spotlight size={720} />
        <FloatingMark text="Let's ship" />
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <Reveal>
            <div className="chip mx-auto mb-10 inline-flex">
              (07) — Start a project
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-display text-[clamp(48px,7vw,110px)] leading-[0.95] tracking-[-0.045em]">
              You brief. <span className="text-primary not-italic">I build.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-10 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              30-minute discovery call. If we click, you have a brief
              the same day and a live site by the end of the week.
            </p>
          </Reveal>
          <Reveal delay={0.45}>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton to="/start" variant="primary" hoverLabel="Build it now" data-testid="button-cta-quote">
                Configure your quote
              </CtaButton>
              <CtaButton href="mailto:hi@mehdijabry.dev" variant="ghost" hoverLabel="Say hi" data-testid="button-cta-call">
                Email directly
              </CtaButton>
            </div>
          </Reveal>
          <Reveal delay={0.6}>
            <div className="mt-16 flex items-center justify-center gap-4 text-mark text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
              <LiveTime />
              <span className="opacity-50">·</span>
              <span>Same-week availability</span>
            </div>
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
