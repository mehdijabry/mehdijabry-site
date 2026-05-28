import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl mb-16 tracking-tight">FOUNDER</h1>
            
            <div className="prose prose-invert max-w-none space-y-8 text-lg text-muted-foreground leading-relaxed mb-24">
              <p>
                I'm Mohamed Mehdi Jabry. 35. Based in Montréal.
              </p>
              <p>
                I hold 3 master's degrees (Business, Brand Marketing, Project Management) and have spent over 10 years building digital products end-to-end. I bridge the gap between business strategy and technical execution.
              </p>
              <p>
                I build websites the way I'd want one built for myself — fast, custom, no subscription trap, and the source code is yours from day one. I don't use page builders or bloated templates. I write clean, production-ready React code that loads instantly and scales gracefully.
              </p>
            </div>

            <div className="space-y-16 border-t border-border pt-16 mb-24">
              <h2 className="font-sans text-xs uppercase tracking-widest text-foreground mb-8">HOW MY BACKGROUND MAPS TO YOUR WEBSITE</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <h3 className="font-serif text-2xl text-primary">Business</h3>
                </div>
                <div className="md:col-span-8">
                  <p className="text-muted-foreground leading-relaxed">
                    Your website isn't an art project, it's a conversion engine. My business background means I prioritize clear value propositions, logical user flows, and integrations (like Stripe or Supabase) that actually drive revenue and capture leads, rather than just looking pretty.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <h3 className="font-serif text-2xl text-primary">Brand Marketing</h3>
                </div>
                <div className="md:col-span-8">
                  <p className="text-muted-foreground leading-relaxed">
                    Consistency builds trust. I ensure your typography, color palette, micro-interactions, and tone of voice are perfectly aligned across every page. A premium aesthetic isn't an accident — it's rigorous brand discipline applied to code.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <h3 className="font-serif text-2xl text-primary">Project Management</h3>
                </div>
                <div className="md:col-span-8">
                  <p className="text-muted-foreground leading-relaxed">
                    This is why I ship in 72 hours. No endless back-and-forth, no missed deadlines. The scope is defined clearly on Day 0, the build happens predictably on Days 1-2, and we launch on Day 3. You know exactly what's happening at every stage.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-16">
              <h2 className="font-sans text-xs uppercase tracking-widest text-foreground mb-8">CONNECT</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-sm">
                <a href="https://www.linkedin.com/in/mehdijabry/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-4 border border-border bg-card">
                  LinkedIn ↗
                </a>
                <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-4 border border-border bg-card">
                  GitHub ↗
                </a>
                <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-4 border border-border bg-card">
                  Twitter/X ↗
                </a>
                <a href="mailto:hi@mehdijabry.dev" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-4 border border-border bg-card">
                  hi@mehdijabry.dev ↗
                </a>
                <a href="https://ds-ai-manager.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-4 border border-border bg-card sm:col-span-2">
                  ds-ai-manager.com ↗
                </a>
              </div>
            </div>

          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
