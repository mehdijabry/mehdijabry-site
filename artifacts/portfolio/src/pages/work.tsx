import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { MaquettesGallery, usePortfolioMaquettes } from "@/components/maquettes-gallery";
import { useCopy } from "@/lib/i18n";

// Les deux sites livrés (DS AI Manager, Salwa El Jaouhari) sont hors ligne depuis le 06/10/2026 : on ne montre pas
// d'études de cas dont le lien « Visiter » mène à une 404. Repasser à true quand ils répondent de nouveau.
const SHOW_DELIVERED_CASE_STUDIES = false;

const COPY = {
  fr: {
    title: "Réalisations",
    lede: (gh: React.ReactNode) => <>Ce que je conçois, de la première maquette à la mise en ligne. Le reste du code est sur {gh}.</>,
    chip: "Commerces de proximité — Québec",
    heading: (n: number) => (n ? `${n} sites conçus avant le premier appel.` : "Des sites conçus avant le premier appel."),
    body:
      "Chacun est une proposition complète et fonctionnelle pour un commerce d'ici — restaurant, café, boutique ou gîte — dessinée, rédigée et mise en ligne avant même que son propriétaire et moi ayons échangé. Cliquez sur l'un d'eux : il s'ouvre ici, dans une fenêtre, et vous pouvez le parcourir sur ordinateur ou sur téléphone sans quitter cette page.",
    delivered: "Livré en production",
    built: "Ce que j'ai construit",
    stack: "Technologies",
    highlights: "Points clés",
    visit: (d: string) => `Visiter ${d} →`,
  },
  en: {
    title: "Selected work",
    lede: (gh: React.ReactNode) => <>What I design, from the first mockup to going live. More code on {gh}.</>,
    chip: "Local businesses — Québec",
    heading: (n: number) => (n ? `${n} sites built before the first call.` : "Sites built before the first call."),
    body:
      "Each one is a complete, working proposal for a local business — shop, café, restaurant or inn — designed, written and deployed before its owner and I ever spoke. Click any of them: it opens right here, in a window, and you can browse it on desktop or phone without leaving this page.",
    delivered: "Delivered in production",
    built: "What I built",
    stack: "Stack",
    highlights: "Highlights",
    visit: (d: string) => `Visit ${d} →`,
  },
};

/** Les deux études de cas livrées, masquées tant que les sites répondent 404 (voir le drapeau ci-dessus). */
const CASE_STUDIES = {
  fr: [
    {
      title: "DS AI Manager", href: "https://ds-ai-manager.com", domain: "ds-ai-manager.com",
      subtitle: "Agent IA pour les équipes marketing — 13 compétences spécialisées",
      body: "DS AI Manager est un système d'agents IA en production qui produit des livrables marketing (articles, publications sociales, séquences de courriels, études de marché) avec une discipline de marque, une validation des sources et un contrôle qualité. Treize compétences spécialisées réunies en un seul système cohérent.",
      stack: ["Next.js", "TypeScript", "Tailwind", "Supabase", "Stripe"],
      highlights: ["Système complet, prêt pour la production", "13 compétences IA spécialisées", "Sorties fidèles à la marque"],
    },
    {
      title: "Salwa El Jaouhari", href: "https://salwaeljaouhari.art", domain: "salwaeljaouhari.art",
      subtitle: "Portfolio artistique — peinture, illustration et art contemporain",
      body: "Un portfolio éditorial épuré pour l'artiste visuelle Salwa El Jaouhari. Le site met en valeur sa peinture et ses illustrations avec une mise en page qui laisse parler les œuvres : interface discrète, grands espaces blancs et une typographie accordée à son univers. Code Next.js sur mesure, entièrement adaptatif, sources transférées sur son GitHub.",
      stack: ["Next.js", "TypeScript", "Tailwind CSS"],
      highlights: ["Galerie éditoriale", "Pensé pour le mobile d'abord", "Livré en 48 h"],
    },
  ],
  en: [
    {
      title: "DS AI Manager", href: "https://ds-ai-manager.com", domain: "ds-ai-manager.com",
      subtitle: "AI agent for serious marketers — 13 specialised skills",
      body: "DS AI Manager is a production AI agent system that produces marketing deliverables (articles, social posts, email sequences, market research) with brand discipline, source validation, and quality control. It packages 13 specialised skills into one coherent system.",
      stack: ["Next.js", "TypeScript", "Tailwind", "Supabase", "Stripe"],
      highlights: ["Full stack production-ready system", "13 specialized AI skills", "Brand-disciplined outputs"],
    },
    {
      title: "Salwa El Jaouhari", href: "https://salwaeljaouhari.art", domain: "salwaeljaouhari.art",
      subtitle: "Art portfolio — painting, illustration and contemporary art",
      body: "A clean, editorial portfolio for visual artist Salwa El Jaouhari. The site showcases her painting and illustration work with a layout designed to let the art speak — minimal chrome, generous whitespace, and a typography system that reflects her aesthetic. Custom Next.js code, fully responsive, source transferred to her GitHub.",
      stack: ["Next.js", "TypeScript", "Tailwind CSS"],
      highlights: ["Editorial gallery layout", "Mobile-first responsive", "Delivered in 48h"],
    },
  ],
};

export default function Work() {
  const t = useCopy(COPY);
  const cases = useCopy(CASE_STUDIES);
  const maquettes = usePortfolioMaquettes();
  const n = maquettes.data?.length ?? 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24">
        <FadeIn>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight mb-4 uppercase">{t.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-16">
            {t.lede(
              <a href="https://github.com/mehdijabry/mehdijabry" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">GitHub</a>,
            )}
          </p>

          {/* Maquettes pour commerces locaux (2026-10-06) — ouvertes dans une fenêtre, sans quitter le site */}
          <section id="local-businesses" className="scroll-mt-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 md:mb-16">
              <div className="md:col-span-7">
                <div className="chip mb-6">{t.chip}</div>
                <h2 className="font-display text-4xl md:text-6xl tracking-tight leading-[0.95]">{t.heading(n)}</h2>
              </div>
              <div className="md:col-span-4 md:col-start-9 self-end">
                <p className="text-base text-muted-foreground leading-relaxed">{t.body}</p>
              </div>
            </div>
            <MaquettesGallery />
          </section>

          {SHOW_DELIVERED_CASE_STUDIES && (
            <div className="flex flex-col gap-16 md:gap-32 mt-24 md:mt-40">
              {cases.map((c) => (
                <div key={c.title} className="group border border-border bg-card p-6 md:p-12 transition-all duration-300 hover:border-primary/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary px-4 py-2 font-mono text-xs hidden md:block">
                    {t.delivered}
                  </div>

                  <div className="max-w-4xl">
                    <h2 className="font-serif text-3xl md:text-5xl mb-4 group-hover:text-primary transition-colors">{c.title}</h2>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">{c.subtitle}</p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                      <div className="md:col-span-8 space-y-6">
                        <div>
                          <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t.built}</h3>
                          <p className="leading-relaxed">{c.body}</p>
                        </div>
                      </div>

                      <div className="md:col-span-4 space-y-8">
                        <div>
                          <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t.stack}</h3>
                          <div className="font-mono text-sm space-y-1 text-muted-foreground">
                            {c.stack.map((s) => <div key={s}>{s}</div>)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">{t.highlights}</h3>
                          <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside ml-4">
                            {c.highlights.map((h) => <li key={h}>{h}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border">
                      <a href={c.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        {t.visit(c.domain)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </Layout>
  );
}
