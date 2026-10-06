import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    title: "Mentions légales et vie privée",
    operator: "Exploitant",
    status: "Travailleur autonome",
    city: "Trois-Rivières, QC",
    hosting: "Hébergement et infrastructure",
    hostingBody: [
      "Hébergement du site assuré par Render Inc.",
      "Base de données et services applicatifs assurés par Supabase (centre de données européen).",
    ],
    taxes: "Taxes",
    taxesBody: ["TPS/TVQ non applicables sous le seuil de petit fournisseur de 30 000 $ CA au Québec."],
    privacy: "Vie privée et traitement des données",
    privacyBody: [
      "Les données que vous transmettez par un formulaire (demande de devis, prise de contact) sont conservées de façon sécurisée, dans le seul but de donner suite à votre demande.",
      "Vos données ne sont **jamais vendues, partagées ni transmises** à des tiers.",
      "Elles sont supprimées automatiquement après 24 mois, ou immédiatement sur simple demande par courriel.",
    ],
    analytics: "Statistiques de visite",
    analyticsBody: [
      "Ce site utilise **Plausible Analytics**, un outil de mesure respectueux de la vie privée.",
      "Il ne collecte aucune donnée personnelle, n'utilise aucun témoin et respecte le RGPD, la CCPA et le PECR.",
    ],
    cookies: "Témoins (cookies)",
    cookiesBody: [
      "Ce site n'utilise aucun témoin de pistage ni de publicité. Seul un élément de stockage local peut être conservé, pour retenir votre préférence de thème clair ou sombre et votre langue d'affichage.",
    ],
  },
  en: {
    title: "Legal & Privacy",
    operator: "Operator",
    status: "Self-employed contractor",
    city: "Trois-Rivières, QC",
    hosting: "Hosting & Infrastructure",
    hostingBody: [
      "Frontend hosting provided by Render Inc.",
      "Database and backend services provided by Supabase (EU data center).",
    ],
    taxes: "Taxes",
    taxesBody: ["GST/QST not applicable under the 30k CAD small-supplier threshold for independent contractors in Québec."],
    privacy: "Privacy & Data Handling",
    privacyBody: [
      "Any form data you submit (quotes, contact requests) is stored securely, purely for the purpose of following up on your inquiry.",
      "Your data is **never sold, shared, or distributed** to third parties.",
      "Data is automatically deleted after 24 months, or immediately upon your request by email.",
    ],
    analytics: "Analytics",
    analyticsBody: [
      "This site uses **Plausible Analytics**, a privacy-focused analytics tool.",
      "It collects zero personal data, uses no cookies, and complies with GDPR, CCPA and PECR.",
    ],
    cookies: "Cookies",
    cookiesBody: [
      "This website uses no tracking or advertising cookies. A single local storage item may be used to remember your light/dark theme preference and your display language.",
    ],
  },
};

/** Les segments **entre doubles astérisques** sont mis en gras — plus lisible qu'un balisage dans le dictionnaire. */
function Rich({ text }: { text: string }) {
  return (
    <p>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
      )}
    </p>
  );
}

function Section({ title, body }: { title: string; body: readonly string[] }) {
  return (
    <section>
      <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">{title}</h2>
      <div className="text-muted-foreground space-y-4 leading-relaxed">
        {body.map((line) => <Rich key={line} text={line} />)}
      </div>
    </section>
  );
}

export default function Legal() {
  const t = useCopy(COPY);
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24 max-w-3xl">
        <FadeIn>
          <h1 className="font-serif text-4xl md:text-5xl mb-12 tracking-tight">{t.title}</h1>

          <div className="space-y-12">
            <section>
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">{t.operator}</h2>
              <div className="text-muted-foreground space-y-2 leading-relaxed">
                <p>Mohamed Mehdi Jabry</p>
                <p>{t.status}</p>
                <p>{t.city}</p>
                <p><a href="mailto:contact@mehdijabry.dev" className="hover:text-primary transition-colors">contact@mehdijabry.dev</a></p>
              </div>
            </section>

            <Section title={t.hosting} body={t.hostingBody} />
            <Section title={t.taxes} body={t.taxesBody} />
            <Section title={t.privacy} body={t.privacyBody} />
            <Section title={t.analytics} body={t.analyticsBody} />
            <Section title={t.cookies} body={t.cookiesBody} />
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
