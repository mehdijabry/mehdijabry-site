import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Regle, type SectionRegle } from "@/components/layout/regle";

/**
 * LA CHARPENTE — « l'instrument », 21 octobre 2026.
 *
 * Trois pièces fixes : la barre en haut, la règle à droite, le pied en bas. Le
 * contenu vit entre les deux, décalé par `main { padding-top: var(--barre);
 * padding-right: var(--bord) }` — cette règle-là est la plus coûteuse à perdre
 * de toute la feuille : sans elle le contenu passe SOUS la barre et SOUS la
 * colonne de droite, et tout paraît cassé sans qu'on voie pourquoi.
 *
 * LES SECTIONS SONT PASSÉES PAR LA PAGE, pas devinées. La règle a besoin de
 * connaître les repères qu'elle gradue : chaque page déclare les siens, avec
 * l'`id` de l'élément correspondant dans le document. Une page qui n'en donne
 * aucune n'a pas de règle — c'est le bon comportement pour `/legal` ou une 404,
 * où il n'y a rien à repérer.
 */

export function Layout({
  children,
  sections,
}: {
  children: React.ReactNode;
  /** Les repères que gradue la colonne de droite. Omis : pas de colonne. */
  sections?: SectionRegle[];
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Le voile de l'ouverture. Il n'est opaque que si <html> porte `js-ouv`,
          posé par l'amorce du gabarit avant la première peinture. */}
      <div className="voile" aria-hidden="true" />
      <Nav />
      {sections && sections.length > 0 && <Regle sections={sections} />}
      <main className={`flex-1${sections && sections.length > 0 ? " avec-regle" : ""}`}>{children}</main>
      <Footer />
    </div>
  );
}
