import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";

export default function Legal() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24 max-w-3xl">
        <FadeIn>
          <h1 className="font-serif text-4xl md:text-5xl mb-12 tracking-tight">LEGAL & PRIVACY</h1>
          
          <div className="space-y-12">
            
            <section>
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Operator</h2>
              <div className="text-muted-foreground space-y-2 leading-relaxed">
                <p>Mohamed Mehdi Jabry</p>
                <p>Travailleur autonome</p>
                <p>Montréal, QC</p>
                <p><a href="mailto:hi@mehdijabry.dev" className="hover:text-primary transition-colors">hi@mehdijabry.dev</a></p>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Hosting & Infrastructure</h2>
              <div className="text-muted-foreground space-y-2 leading-relaxed">
                <p>Frontend hosting provided by Render Inc.</p>
                <p>Database and backend services provided by Supabase (EU data center).</p>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Taxes</h2>
              <div className="text-muted-foreground space-y-2 leading-relaxed">
                <p>TPS/TVQ not applicable under the 30k CAD threshold for independent contractors in Quebec.</p>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Privacy & Data Handling</h2>
              <div className="text-muted-foreground space-y-4 leading-relaxed">
                <p>
                  Any form data you submit (quotes, contact requests) is stored securely in our database purely for the purpose of following up on your inquiry.
                </p>
                <p>
                  Your data is <strong>never sold, shared, or distributed</strong> to third parties.
                </p>
                <p>
                  Data is automatically deleted after 24 months, or immediately upon your request via email.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Analytics</h2>
              <div className="text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  This site uses <strong>Plausible Analytics</strong>, a privacy-focused analytics tool.
                </p>
                <p>
                  It collects zero personal data, uses no cookies, and fully complies with GDPR, CCPA, and PECR. Your privacy is respected.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Cookies</h2>
              <div className="text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  This website does not use any tracking or advertising cookies. 
                  A single local storage item may be used purely to remember your dark/light mode preference.
                </p>
              </div>
            </section>

          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
