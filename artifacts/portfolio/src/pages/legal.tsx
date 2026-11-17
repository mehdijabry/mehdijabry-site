import { Layout } from "@/components/layout/layout";
import type { SectionRegle } from "@/components/layout/regle";
import { FadeIn } from "@/components/ui/fade-in";
import { useCopy, useLang } from "@/lib/i18n";
import { REGLES, ouvrir } from "@/lib/consentement";

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
      "Si vous l'acceptez dans le bandeau, ce site charge **Plausible Analytics**, un outil de mesure sans témoin ni identifiant, qui compte les visites sans suivre les personnes.",
      "Sans votre accord, **aucun script de mesure n'est chargé** : la porte posée dans le navigateur refuse toute écriture qui ne figure pas dans la table ci-dessous.",
    ],
    cookies: "Témoins (cookies)",
    cookiesBody: [
      "Ce site n'utilise aucun témoin de pistage ni de publicité, et ne charge aucune police depuis un serveur tiers. Voici, sans exception, ce qu'il peut écrire dans votre navigateur, et avec quel accord :",
    ],
    categorie: { necessaire: "Nécessaire", mesure: "Avec votre accord" },
    modifier: "Modifier mes choix",
    retrait: "Vous pouvez retirer votre accord à tout moment : les données des catégories retirées sont effacées sur-le-champ.",
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
      "If you accept it in the banner, this site loads **Plausible Analytics**, a cookie-free, identifier-free measurement tool that counts visits without following people.",
      "Without your consent, **no measurement script is loaded**: the gate set in the browser refuses any write that is not in the table below.",
    ],
    cookies: "Cookies",
    cookiesBody: [
      "This website uses no tracking or advertising cookies, and loads no font from a third-party server. Here is, without exception, what it may write in your browser, and with which consent:",
    ],
    categorie: { necessaire: "Necessary", mesure: "With your consent" },
    modifier: "Change my choices",
    retrait: "You can withdraw your consent at any time: the data of withdrawn categories is erased immediately.",
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

function Section({ title, body, id }: { title: string; body: readonly string[]; id?: string }) {
  return (
    <section id={id}>
      <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">{title}</h2>
      <div className="text-muted-foreground space-y-4 leading-relaxed">
        {body.map((line) => <Rich key={line} text={line} />)}
      </div>
    </section>
  );
}

/* LES REPÈRES DE LA RÈGLE — voir la note identique sur les autres pages :
   chaque page déclare les siens, et ils doivent correspondre à des blocs qui
   existent vraiment dans le document. */
const SECTIONS: SectionRegle[] = [
  { id: "exploitant", fr: "Exploitant", en: "Operator" },
  { id: "hebergement", fr: "Hébergement", en: "Hosting" },
  { id: "donnees", fr: "Données", en: "Data" },
];

/** La table des témoins et clés de stockage, tirée de la même source que la porte : elle ne peut pas mentir. */
function TableTemoins() {
  const t = useCopy(COPY);
  const { lang } = useLang();
  return (
    <div className="text-muted-foreground space-y-4 leading-relaxed">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--trait)" }}>
            <th className="text-left py-2 pr-3 font-normal mono" style={{ fontSize: 11 }}>{lang === "fr" ? "Clé" : "Key"}</th>
            <th className="text-left py-2 pr-3 font-normal mono" style={{ fontSize: 11 }}>{lang === "fr" ? "Usage" : "Use"}</th>
            <th className="text-left py-2 font-normal mono" style={{ fontSize: 11 }}>{lang === "fr" ? "Accord" : "Consent"}</th>
          </tr>
        </thead>
        <tbody>
          {REGLES.map((r) => (
            <tr key={String(r.cle)} style={{ borderBottom: "1px solid var(--trait)" }}>
              <td className="py-2 pr-3 align-top"><code className="mono" style={{ fontSize: 12 }}>{String(r.cle)}</code></td>
              <td className="py-2 pr-3 align-top">{r.quoi[lang]}</td>
              <td className="py-2 align-top whitespace-nowrap">{t.categorie[r.categorie]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{t.retrait}</p>
      <button type="button" className="btn" onClick={ouvrir} data-consentement-ouvrir>{t.modifier}</button>
    </div>
  );
}

export default function Legal() {
  const t = useCopy(COPY);
  return (
    <Layout sections={SECTIONS}>
      <div className="container mx-auto px-4 py-12 md:py-24 max-w-3xl">
        <FadeIn>
          <h1 className="font-serif text-4xl md:text-5xl mb-12 tracking-tight">{t.title}</h1>

          <div className="space-y-12">
            <section id="exploitant">
              <h2 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">{t.operator}</h2>
              <div className="text-muted-foreground space-y-2 leading-relaxed">
                <p>Mohamed Mehdi Jabry</p>
                <p>{t.status}</p>
                <p>{t.city}</p>
                <p><a href="mailto:contact@mehdijabry.dev" className="hover:text-primary transition-colors">contact@mehdijabry.dev</a></p>
              </div>
            </section>

            <Section id="hebergement" title={t.hosting} body={t.hostingBody} />
            <Section title={t.taxes} body={t.taxesBody} />
            <Section id="donnees" title={t.privacy} body={t.privacyBody} />
            <Section title={t.analytics} body={t.analyticsBody} />
            <Section id="temoins" title={t.cookies} body={t.cookiesBody} />
            <TableTemoins />
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
