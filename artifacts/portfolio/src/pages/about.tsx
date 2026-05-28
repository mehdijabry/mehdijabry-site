import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-24 md:py-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">FOUNDER</p>
            <h1 className="font-serif text-4xl md:text-6xl mt-4 tracking-tight">About me</h1>
            <p className="font-serif text-xl md:text-2xl text-muted-foreground mt-2 italic">The developer who ships in 72 hours.</p>

            {/* Photo + Name block */}
            <div className="mt-12 flex flex-col sm:flex-row gap-8 items-start">
              <img
                src="/founder.jpg"
                alt="Mohamed Mehdi Jabry"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover object-top grayscale"
                data-testid="img-founder"
              />
              <div className="flex flex-col justify-center">
                <p className="font-serif text-2xl">Mohamed Mehdi Jabry</p>
                <p className="font-sans text-sm uppercase tracking-widest text-muted-foreground mt-1">FOUNDER · INDEPENDENT WEB STUDIO</p>
              </div>
            </div>

            <p className="mt-12 text-lg leading-relaxed">
              I'm Mohamed Mehdi Jabry, 35. Based in Montréal, Québec.
            </p>
            <p className="mt-6 text-lg leading-relaxed">
              Three master's degrees: Business Management, Brand Marketing,
              Project Management. None of them in computer science. I learned
              to code the way I learned everything else worth knowing —{" "}
              <em>because I needed to ship something, and waiting on someone
              else was no longer an option.</em>
            </p>

            <hr className="border-border my-16" />

            {/* My Path */}
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">MY PATH</p>

            <p className="mt-6 text-lg leading-relaxed">
              <strong>2021–2024.</strong> I worked across several industries —
              marketing, operations, consulting. I was looking for the right
              combination of skills to work on what I actually cared about.
              Most of those years were spent learning what I didn't want to do
              as much as what I did.
            </p>
            <p className="mt-6 text-lg leading-relaxed">
              <strong>2023.</strong> I went deep on AI. Not as a user — as an
              operator. Formal training, certifications, hands-on building. The
              pace of the field told me one thing clearly: the gap between what
              AI can do and what businesses actually ship is going to widen.
              The people who can close that gap will be in unusual demand.
            </p>
            <p className="mt-6 text-lg leading-relaxed">
              <strong>2025–now.</strong> I joined Cradly UK as marketing
              consultant. Responsible for social media strategy and AI
              automation: I build custom AI skills aligned to Cradly's brand
              identity and operational workflows. Production AI, not demos —
              agents that ship deliverables a marketer can publish without
              rewriting.
            </p>
            <p className="mt-6 text-lg leading-relaxed">
              <strong>2025.</strong> I launched{" "}
              <a
                href="https://ds-ai-manager.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-primary underline-offset-4 hover:text-primary transition-colors"
              >
                ds-ai-manager.com
              </a>{" "}
              — a productized AI agent for serious
              marketers. 13 specialised skills, brand-aware, source-validated.
              It's the proof I can package complex AI workflows into a coherent
              product, not just one-off automations.
            </p>
            <p className="mt-6 text-lg leading-relaxed">
              <strong>2026.</strong> I launched this studio. mehdijabry.dev.
              The execution arm of everything above — focused on shipping
              websites: landing pages, showcase sites, and small-team digital
              fronts that go live in days, not weeks.
            </p>

            <hr className="border-border my-16" />

            {/* Why I Launched */}
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">WHY I LAUNCHED THIS STUDIO</p>

            <p className="mt-6 text-lg leading-relaxed">
              I've watched too many small businesses and indie founders get the wrong deal:
            </p>
            <ul className="mt-6 space-y-4 text-lg leading-relaxed">
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span>Pay <strong>$4,000 for a WordPress site delivered in 8 weeks</strong> they could have built themselves in a weekend.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span>Hire "fast freelancers" only to receive Webflow templates with three colors swapped.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span>Sit through a <strong>$500 paid consultation</strong> with a Québec agency before they'll even quote a price.</span>
              </li>
            </ul>
            <p className="mt-8 text-lg leading-relaxed italic">
              The middle path — fast, custom, transparently priced, ships in days —
              doesn't exist for most clients. <em>That's what this studio is.</em>
            </p>

            <hr className="border-border my-16" />

            {/* How I Work */}
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">HOW I WORK</p>

            <ul className="mt-6 space-y-5 text-lg leading-relaxed">
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span><strong>No fuzzy briefs.</strong> No clear brief, no quote. I've lost three deals on this rule. I keep it.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span><strong>Source code transferred to your GitHub on delivery day.</strong> Not optional. Not a paywall. Not buried in fine print.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span><strong>No page builders. No Wix. No Squarespace.</strong> Custom React, every time. The code is yours, portable, debuggable, modifiable.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span><strong>Quality over volume.</strong> I'd rather ship one site this week that actually converts than three sites that look "fine" and don't.</span>
              </li>
            </ul>

            <hr className="border-border my-16" />

            {/* Background map */}
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">HOW MY BACKGROUND MAPS TO YOUR WEBSITE</p>
            <p className="mt-6 text-muted-foreground italic text-base">
              I didn't take the standard path to building websites. The detour turned out to matter.
            </p>

            <div className="mt-8 space-y-10">
              <div className="flex gap-5">
                <span className="text-2xl shrink-0">📊</span>
                <div>
                  <p className="font-medium text-lg"><strong>Master's in Business Management</strong></p>
                  <p className="mt-2 text-muted-foreground leading-relaxed flex gap-2"><span className="text-primary shrink-0">→</span> I understand what a website actually has to do for your business: capture leads, book demos, close sales — not just look good.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="text-2xl shrink-0">🎯</span>
                <div>
                  <p className="font-medium text-lg"><strong>MBA in Brand Marketing</strong></p>
                  <p className="mt-2 text-muted-foreground leading-relaxed flex gap-2"><span className="text-primary shrink-0">→</span> I read your brand as a coherent system before I touch the code. Visual identity, tone, positioning — they inform the structure, not the other way around.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="text-2xl shrink-0">⚙️</span>
                <div>
                  <p className="font-medium text-lg"><strong>Master's in Project Management</strong></p>
                  <p className="mt-2 text-muted-foreground leading-relaxed flex gap-2"><span className="text-primary shrink-0">→</span> 72-hour deliveries don't happen by accident. They happen because the scope is precise, the workflow is engineered, and the dependencies are mapped before Day 0.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="text-2xl shrink-0">🤖</span>
                <div>
                  <p className="font-medium text-lg"><strong>AI-accelerated execution (since 2023)</strong></p>
                  <p className="mt-2 text-muted-foreground leading-relaxed flex gap-2"><span className="text-primary shrink-0">→</span> I use AI as a senior pair, not as a replacement for craft. It's what lets me ship in days what most agencies ship in weeks — without cutting corners on the parts that matter.</p>
                </div>
              </div>
            </div>

            <hr className="border-border my-16" />

            {/* Where I'm Going */}
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">WHERE I'M GOING</p>

            <p className="mt-6 text-lg leading-relaxed">This studio is the first node of a larger plan:</p>

            <ul className="mt-6 space-y-5 text-lg leading-relaxed">
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span><strong>Grow to a 2-3 person team</strong> — a designer and a second developer — so I can keep the delivery promise as demand grows.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span><strong>Specialise vertically.</strong> Right now I serve any small business or indie founder; in 12 months I want to be the obvious choice for one or two specific verticals.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0 mt-1">→</span>
                <span><strong>Integrate with ds-ai-manager.</strong> Websites that ship in days, AI automation that runs them — same studio, two products. The same client gets both, or one, or whatever they need.</span>
              </li>
            </ul>

            <p className="mt-8 text-lg italic leading-relaxed">
              The thread connecting it all: <em>small teams shouldn't have to
              pick between speed and quality, between custom and affordable,
              between "shipped" and "shipped right."</em> I'm building the
              alternative.
            </p>

            <p className="mt-10 font-serif text-lg text-center">— Mohamed Mehdi Jabry, Founder</p>

            <hr className="border-border my-16" />

            {/* Connect */}
            <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">CONNECT</p>

            <div className="mt-6 space-y-3 text-lg">
              {[
                { label: "LinkedIn", href: "https://www.linkedin.com/in/mehdijabry/", external: true },
                { label: "GitHub", href: "#", external: false },
                { label: "Twitter / X", href: "#", external: false },
                { label: "Email", href: "mailto:hi@mehdijabry.dev", external: false },
                { label: "Other project: ds-ai-manager.com", href: "https://ds-ai-manager.com", external: true },
              ].map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  data-testid={`link-connect-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="text-primary">→</span>
                  <span className="underline-offset-4 group-hover:underline">{label}</span>
                </a>
              ))}
            </div>

          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
