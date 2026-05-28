import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";

export default function Work() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <FadeIn>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-4">SELECTED WORK</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-16">
            Projects I've shipped end-to-end. More on <a href="#" className="text-primary hover:underline underline-offset-4">GitHub</a>.
          </p>

          <div className="flex flex-col gap-16 md:gap-32">
            {/* Project 1 */}
            <div className="group border border-border bg-card p-6 md:p-12 transition-all duration-300 hover:border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary px-4 py-2 font-mono text-xs hidden md:block">
                Delivered in production
              </div>
              
              <div className="max-w-4xl">
                <h2 className="font-serif text-3xl md:text-5xl mb-4 group-hover:text-primary transition-colors">DS AI Manager</h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  AI agent for serious marketers — 13 specialised skills
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">WHAT I BUILT</h3>
                      <p className="leading-relaxed">
                        DS AI Manager is a production AI agent system that produces marketing deliverables (articles, social posts, email sequences, market research) with brand discipline, source validation, and quality control. It packages 13 specialised skills into one coherent system, each enforcing my background in Business, Brand Marketing, and Project Management.
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4 space-y-8">
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">STACK</h3>
                      <div className="font-mono text-sm space-y-1 text-muted-foreground">
                        <div>Next.js</div>
                        <div>TypeScript</div>
                        <div>Tailwind</div>
                        <div>Supabase</div>
                        <div>Stripe</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">HIGHLIGHTS</h3>
                      <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Full stack production-ready system</li>
                        <li>13 specialized AI skills</li>
                        <li>Brand-disciplined outputs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                  <a href="https://ds-ai-manager.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Visit ds-ai-manager.com →
                  </a>
                </div>
              </div>
            </div>

            {/* Project 2 (Placeholder) */}
            <div className="group border border-border bg-card p-6 md:p-12 transition-all duration-300 opacity-80 cursor-not-allowed">
              <div className="max-w-4xl">
                <h2 className="font-serif text-3xl md:text-5xl mb-4 text-muted-foreground">Project Placeholder</h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">WHAT I BUILT</h3>
                      <p className="leading-relaxed text-muted-foreground/80">
                        Suspendisse potenti. Nullam in justo in ex venenatis dapibus. Mauris a est et augue faucibus vulputate vitae sit amet nulla. Sed at aliquet elit. Donec dictum id libero ac egestas. 
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4 space-y-8">
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">STACK</h3>
                      <div className="font-mono text-sm space-y-1 text-muted-foreground/80">
                        <div>React</div>
                        <div>Node.js</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 (Placeholder) */}
            <div className="group border border-border bg-card p-6 md:p-12 transition-all duration-300 opacity-80 cursor-not-allowed">
              <div className="max-w-4xl">
                <h2 className="font-serif text-3xl md:text-5xl mb-4 text-muted-foreground">Project Placeholder</h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">WHAT I BUILT</h3>
                      <p className="leading-relaxed text-muted-foreground/80">
                        Phasellus volutpat, orci vitae ultrices facilisis, odio metus vehicula dolor, vel sodales est velit id nunc.
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4 space-y-8">
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">STACK</h3>
                      <div className="font-mono text-sm space-y-1 text-muted-foreground/80">
                        <div>Vue</div>
                        <div>Firebase</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
