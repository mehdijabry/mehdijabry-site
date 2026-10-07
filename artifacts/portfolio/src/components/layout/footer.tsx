import { Link } from "wouter";
import { useCopy } from "@/lib/i18n";
import { Monogramme } from "@/components/logo";

/**
 * Le pied de page.
 *
 * Il annonçait « Construit avec Next.js, Supabase et Resend ». C'était faux : ce site tourne sur
 * React et Vite devant, Express et Drizzle derrière, une base Postgres sur Render, et les maquettes
 * sont servies par Cloudflare Pages. Sur un site dont toute la thèse est « rien ici n'est une
 * promesse, tout est vérifiable », une pile technique inventée est le pire détail possible.
 * Corrigé le 6 octobre 2026.
 */

const COPY = {
  fr: {
    site: "Site", connect: "Réseaux", contact: "Contact",
    work: "Réalisations", pricing: "Tarifs", about: "À propos", legal: "Mentions légales et vie privée",
    call: "Réserver un appel de 15 min",
    city: "Trois-Rivières (Québec)", country: "Canada",
    built: "React · Vite · Express · Postgres · Cloudflare Pages",
    source: "Code source sur GitHub",
    cote: "Studio web indépendant — Trois-Rivières",
  },
  en: {
    site: "Site", connect: "Connect", contact: "Contact",
    work: "Work", pricing: "Pricing", about: "About", legal: "Legal & Privacy",
    call: "Book a 15-min call",
    city: "Trois-Rivières (Quebec)", country: "Canada",
    built: "React · Vite · Express · Postgres · Cloudflare Pages",
    source: "Source on GitHub",
    cote: "Independent web studio — Trois-Rivières",
  },
};

const lienClasse = "lien text-sm text-muted-foreground hover:text-foreground transition-colors";
const titreClasse = "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground";

export function Footer() {
  const t = useCopy(COPY);
  return (
    <footer className="relative z-10 mt-24 border-t border-border bg-background">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="cote mb-12">
          <span className="cote__label">{t.cote}</span>
          <span className="cote__trait" />
        </div>

        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Le monogramme tient la colonne de gauche : il ferme la page comme il l'ouvre. */}
          <div className="md:col-span-3">
            <Monogramme className="h-10 w-10" />
          </div>

          <nav className="md:col-span-3 flex flex-col gap-4">
            <h4 className={titreClasse}>{t.site}</h4>
            <div className="flex flex-col items-start gap-2.5">
              <Link href="/work" className={lienClasse}>{t.work}</Link>
              <Link href="/pricing" className={lienClasse}>{t.pricing}</Link>
              <Link href="/about" className={lienClasse}>{t.about}</Link>
              <Link href="/contact" className={lienClasse}>{t.contact}</Link>
              <Link href="/legal" className={lienClasse}>{t.legal}</Link>
            </div>
          </nav>

          <nav className="md:col-span-3 flex flex-col gap-4">
            <h4 className={titreClasse}>{t.connect}</h4>
            <div className="flex flex-col items-start gap-2.5">
              <a href="https://www.linkedin.com/in/mehdijabry/" target="_blank" rel="noopener noreferrer" className={lienClasse}>LinkedIn</a>
              <a href="https://github.com/mehdijabry/mehdijabry" target="_blank" rel="noopener noreferrer" className={lienClasse}>GitHub</a>
              <a href="https://x.com/mehdijabry" target="_blank" rel="noopener noreferrer" className={lienClasse}>Twitter / X</a>
              {/* ds-ai-manager.com et salwaeljaouhari.art retirés le 06/10/2026 : les deux répondent 404. */}
            </div>
          </nav>

          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className={titreClasse}>{t.contact}</h4>
            <div className="flex flex-col items-start gap-2.5">
              {/* Adresse et numéro lus dans les réglages de production (/api/admin/settings). */}
              <a href="mailto:contact@mehdijabry.dev" className={lienClasse}>contact@mehdijabry.dev</a>
              <a href="tel:+14385257119" className={`${lienClasse} tabular-nums`}>438 525-7119</a>
              <a href="https://calendly.com/mehdijabry/discovery" target="_blank" rel="noopener noreferrer" className={lienClasse}>{t.call}</a>
              <span className="mt-2 text-sm text-muted-foreground">
                {t.city}<br />{t.country}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-7 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 Mohamed Mehdi Jabry</p>
          <p className="normal-case tracking-[0.1em]">{t.built}</p>
          <a href="https://github.com/mehdijabry/mehdijabry" target="_blank" rel="noopener noreferrer" className="lien hover:text-foreground transition-colors">
            {t.source}
          </a>
        </div>
      </div>
    </footer>
  );
}
