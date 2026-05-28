import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { CURRENCIES } from "@/lib/pricing";

export default function Home() {
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>("CAD");

  return (
    <Layout>
      {/* Hero */}
      <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <FadeIn>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6 font-sans uppercase tracking-widest text-[10px]">
            INDEPENDENT WEB STUDIO · MONTRÉAL
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl mb-6">
            Production-ready websites,<br />
            <em className="text-primary italic">shipped in 72 hours.</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            Custom code. No subscription. No templates. From $1,290 CAD.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/start" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
              Try a quote →
            </Link>
            <a href="#work" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground">
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
            <a href="https://ds-ai-manager.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all duration-300">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="https://ds-ai-manager.com" target="_blank" rel="noopener noreferrer" className="group block h-full">
              <div className="border border-border bg-card p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg">
                <h3 className="font-serif text-2xl group-hover:text-primary transition-colors">DS AI Manager</h3>
                <p className="text-muted-foreground text-sm flex-1">AI agent for serious marketers — 13 specialised skills</p>
                <div className="font-mono text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  Next.js · TypeScript · Supabase · Stripe
                </div>
              </div>
            </a>
            
            <div className="group block h-full cursor-not-allowed">
              <div className="border border-border bg-card p-6 h-full flex flex-col gap-4 transition-all duration-300">
                <h3 className="font-serif text-2xl text-muted-foreground">Project Placeholder</h3>
                <p className="text-muted-foreground text-sm flex-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <div className="font-mono text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  React · Node.js
                </div>
              </div>
            </div>

            <div className="group block h-full cursor-not-allowed">
              <div className="border border-border bg-card p-6 h-full flex flex-col gap-4 transition-all duration-300">
                <h3 className="font-serif text-2xl text-muted-foreground">Project Placeholder</h3>
                <p className="text-muted-foreground text-sm flex-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <div className="font-mono text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  Vue · Firebase
                </div>
              </div>
            </div>
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
                    className={`px-3 py-1 text-xs font-medium transition-colors ${currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Launchpad */}
              <div className="border border-border bg-background p-8 flex flex-col gap-6">
                <div>
                  <h4 className="font-mono text-sm mb-2">LAUNCHPAD</h4>
                  <div className="font-serif text-4xl mb-1">${Math.round(990 * CURRENCIES[currency].rate).toLocaleString()} <span className="text-sm font-sans text-muted-foreground uppercase">{currency}</span></div>
                  <p className="text-sm text-muted-foreground">Landing page / 72h</p>
                </div>
                <ul className="text-sm space-y-3 flex-1">
                  <li className="flex gap-2"><span>·</span> Custom Next.js</li>
                  <li className="flex gap-2"><span>·</span> Mobile-responsive</li>
                  <li className="flex gap-2"><span>·</span> Resend form</li>
                  <li className="flex gap-2"><span>·</span> 1 revision</li>
                </ul>
              </div>

              {/* Studio */}
              <div className="border-2 border-primary bg-background p-8 flex flex-col gap-6 relative shadow-lg shadow-primary/5">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-mono px-3 py-1 uppercase">Recommended</div>
                <div>
                  <h4 className="font-mono text-sm mb-2 text-primary">STUDIO</h4>
                  <div className="font-serif text-4xl mb-1">${Math.round(1890 * CURRENCIES[currency].rate).toLocaleString()} <span className="text-sm font-sans text-muted-foreground uppercase">{currency}</span></div>
                  <p className="text-sm text-muted-foreground">Showcase site 3-5p / 5-7d</p>
                </div>
                <ul className="text-sm space-y-3 flex-1">
                  <li className="flex gap-2"><span>·</span> All Launchpad + 3-5 pages</li>
                  <li className="flex gap-2"><span>·</span> Supabase form</li>
                  <li className="flex gap-2"><span>·</span> 2 revisions</li>
                  <li className="flex gap-2"><span>·</span> SEO & Plausible Analytics</li>
                </ul>
              </div>

              {/* Signature */}
              <div className="border border-border bg-background p-8 flex flex-col gap-6">
                <div>
                  <h4 className="font-mono text-sm mb-2">SIGNATURE</h4>
                  <div className="font-serif text-4xl mb-1">${Math.round(3790 * CURRENCIES[currency].rate).toLocaleString()} <span className="text-sm font-sans text-muted-foreground uppercase">{currency}</span></div>
                  <p className="text-sm text-muted-foreground">Custom site or mini-app / 10-14d</p>
                </div>
                <ul className="text-sm space-y-3 flex-1">
                  <li className="flex gap-2"><span>·</span> All Studio + Booking</li>
                  <li className="flex gap-2"><span>·</span> Stripe Integration</li>
                  <li className="flex gap-2"><span>·</span> 3 revisions</li>
                  <li className="flex gap-2"><span>·</span> 30 days support</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/start" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
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
            <p className="font-serif text-2xl md:text-4xl leading-relaxed mb-8">
              "I'm Mohamed Mehdi Jabry. 35. Based in Montréal.<br />
              3 master's degrees (Business · Brand Marketing · Project Management)<br />
              and 10+ years building digital products end-to-end.<br />
              I build websites the way I'd want one built for myself —<br />
              fast, custom, no subscription trap, source code yours from day one."
            </p>
            <Link href="/about" className="text-primary hover:underline underline-offset-4 font-medium transition-all">
              More about me →
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
                <AccordionTrigger className="font-serif text-xl">What's actually included in the 72-hour delivery?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  72 hours covers Launchpad tier (1-page landing). The timer starts the moment I have your deposit AND all required assets. Studio 5-7 days, Signature 10-14 days. Live on your domain, source transferred to GitHub.
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
                  Guaranteed in writing. Miss Day 3 on Launchpad → 50% reduction. Miss Studio/Signature deadline → 25% reduction. Clock starts when I have all assets.
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
                  Logo: optional add-on (typographic, $250). Copywriting: +$400 add-on or you provide it.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="font-serif text-xl">Do you do e-commerce (Shopify)?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Only on Signature tier, custom quote. Shopify theme customization fine; full custom Shopify dev &gt; 14 days.
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
              <Link href="/start" className="inline-flex h-16 items-center justify-center whitespace-nowrap rounded-none px-12 text-lg font-serif transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
                → Configure your quote
              </Link>
              <span className="text-xs text-muted-foreground mt-3">5 minutes · Instant pricing</span>
            </div>
            <div className="flex flex-col items-center">
              <a href="https://calendly.com/mehdijabry/discovery" target="_blank" rel="noopener noreferrer" className="inline-flex h-16 items-center justify-center whitespace-nowrap rounded-none px-12 text-lg font-serif transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground">
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
