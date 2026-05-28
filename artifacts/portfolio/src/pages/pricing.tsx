import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <FadeIn>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight max-w-3xl mb-16">
            PRICING — Transparent. Predictable. No surprises.
          </h1>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {/* Launchpad */}
            <div className="border border-border bg-card p-8 flex flex-col gap-8 transition-all hover:border-primary/50">
              <div>
                <h4 className="font-mono text-sm text-muted-foreground mb-3">LAUNCHPAD</h4>
                <div className="font-serif text-5xl mb-2">$1,290 <span className="text-sm font-sans text-muted-foreground uppercase">CAD</span></div>
                <p className="text-muted-foreground">Landing page / 72h delivery</p>
              </div>
              <ul className="text-sm space-y-4 flex-1">
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Custom Next.js</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Mobile-responsive</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Resend contact form</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> 1 revision cycle</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Source code transferred</li>
              </ul>
              <Link href="/start" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none border border-border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                Get started
              </Link>
            </div>

            {/* Studio */}
            <div className="border-2 border-primary bg-card p-8 flex flex-col gap-8 relative shadow-xl shadow-primary/5">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-mono px-3 py-1 uppercase">Recommended</div>
              <div>
                <h4 className="font-mono text-sm text-primary mb-3">STUDIO</h4>
                <div className="font-serif text-5xl mb-2">$2,490 <span className="text-sm font-sans text-muted-foreground uppercase">CAD</span></div>
                <p className="text-muted-foreground">Showcase site (3-5 pages) / 5-7 days</p>
              </div>
              <ul className="text-sm space-y-4 flex-1">
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> All Launchpad features</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> 3-5 custom pages</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Supabase database integration</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> 2 revision cycles</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Basic SEO optimization</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Plausible Analytics setup</li>
              </ul>
              <Link href="/start" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none bg-primary text-primary-foreground px-8 text-sm font-medium transition-colors hover:bg-primary/90">
                Get started
              </Link>
            </div>

            {/* Signature */}
            <div className="border border-border bg-card p-8 flex flex-col gap-8 transition-all hover:border-primary/50">
              <div>
                <h4 className="font-mono text-sm text-muted-foreground mb-3">SIGNATURE</h4>
                <div className="font-serif text-5xl mb-2">$4,990 <span className="text-sm font-sans text-muted-foreground uppercase">CAD</span></div>
                <p className="text-muted-foreground">Custom site or mini-app / 10-14 days</p>
              </div>
              <ul className="text-sm space-y-4 flex-1">
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> All Studio features</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Advanced Booking/Forms</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Stripe payment integration</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> 3 revision cycles</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> Authentication flows</li>
                <li className="flex gap-3 text-muted-foreground"><span className="text-primary">•</span> 30 days priority support</li>
              </ul>
              <Link href="/start" className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none border border-border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                Get started
              </Link>
            </div>
          </div>

          {/* Add-ons Table */}
          <div className="mb-24">
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">AVAILABLE ADD-ONS</h2>
            <div className="border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">Copywriting included (FR or EN)</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$400</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">Additional language (i18n)</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$320/lang</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">Stripe payment integration</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$320</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">Migration from existing platform</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$250</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">Logo (typographic, simple)</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$250</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">Resend transactional emails setup</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$250</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">Curated stock photos (10-20)</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$120</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 py-5 font-medium">1h training for content updates</td>
                    <td className="p-4 py-5 text-right font-mono text-muted-foreground">+$120</td>
                  </tr>
                  <tr className="bg-primary/5 hover:bg-primary/10 transition-colors">
                    <td className="p-4 py-5 font-medium">Monthly maintenance retainer</td>
                    <td className="p-4 py-5 text-right font-mono text-primary">+$129/mo</td>
                  </tr>
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
                  No scope creep surprises, no 'this will take 2 more weeks' conversations. The price we agree on before starting is the exact price you pay.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">YOU OWN THE CODE.</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fixed-price projects ship with full GitHub transfer at delivery. You're never trapped in a maintenance contract unless you actively want one.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div>
            <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">COMPARISON</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 font-sans text-xs text-muted-foreground font-normal uppercase tracking-widest">Feature</th>
                    <th className="p-4 font-sans text-xs text-primary font-bold uppercase tracking-widest bg-primary/5">Mehdi Jabry</th>
                    <th className="p-4 font-sans text-xs text-muted-foreground font-normal uppercase tracking-widest">Traditional Agency</th>
                    <th className="p-4 font-sans text-xs text-muted-foreground font-normal uppercase tracking-widest">Subscription (DesignJoy)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 text-muted-foreground">Price Model</td>
                    <td className="p-4 bg-primary/5 font-medium">One-off, fixed</td>
                    <td className="p-4">Variable / Hourly</td>
                    <td className="p-4">~$5k/month recurring</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-muted-foreground">Speed</td>
                    <td className="p-4 bg-primary/5 font-medium">3-14 days guaranteed</td>
                    <td className="p-4">1-3 months</td>
                    <td className="p-4">A few days per task</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-muted-foreground">Custom Code</td>
                    <td className="p-4 bg-primary/5 font-medium">Yes (Next.js/React)</td>
                    <td className="p-4">Depends (often WordPress)</td>
                    <td className="p-4">Often Webflow/Framer only</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-muted-foreground">Code Ownership</td>
                    <td className="p-4 bg-primary/5 font-medium">100% Yours</td>
                    <td className="p-4">Usually yours</td>
                    <td className="p-4">Tied to platform</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </FadeIn>
      </div>
    </Layout>
  );
}
