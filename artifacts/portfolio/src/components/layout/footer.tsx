import { Link } from "wouter";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    site: "Site", connect: "Réseaux", contact: "Contact",
    work: "Réalisations", pricing: "Tarifs", about: "À propos", legal: "Mentions légales et vie privée",
    call: "Réserver un appel de 15 min",
    city: "Trois-Rivières, QC", country: "Canada",
    built: "Construit avec Next.js, Supabase et Resend",
    source: "Code source sur GitHub",
  },
  en: {
    site: "Site", connect: "Connect", contact: "Contact",
    work: "Work", pricing: "Pricing", about: "About", legal: "Legal & Privacy",
    call: "Book a 15-min call",
    city: "Trois-Rivières, QC", country: "Canada",
    built: "Built with Next.js, Supabase and Resend",
    source: "Source on GitHub",
  },
};

export function Footer() {
  const t = useCopy(COPY);
  return (
    <footer className="border-t border-border bg-card/50 mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.site}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/work" className="text-sm hover:text-primary transition-colors">{t.work}</Link>
              <Link href="/pricing" className="text-sm hover:text-primary transition-colors">{t.pricing}</Link>
              <Link href="/about" className="text-sm hover:text-primary transition-colors">{t.about}</Link>
              <Link href="/contact" className="text-sm hover:text-primary transition-colors">{t.contact}</Link>
              <Link href="/legal" className="text-sm hover:text-primary transition-colors">{t.legal}</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.connect}</h4>
            <div className="flex flex-col gap-3">
              <a href="https://www.linkedin.com/in/mehdijabry/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">LinkedIn</a>
              <a href="https://github.com/mehdijabry/mehdijabry" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">GitHub</a>
              <a href="https://x.com/mehdijabry" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Twitter / X</a>
              {/* ds-ai-manager.com et salwaeljaouhari.art retirés le 06/10/2026 : les deux répondent 404. */}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.contact}</h4>
            <div className="flex flex-col gap-3">
              {/* Adresse des réglages de production (/api/admin/settings) — celle à laquelle les prospects répondent. */}
              <a href="mailto:contact@mehdijabry.dev" className="text-sm hover:text-primary transition-colors">contact@mehdijabry.dev</a>
              <a href="tel:+14385257119" className="text-sm hover:text-primary transition-colors">438 525-7119</a>
              <a href="https://calendly.com/mehdijabry/discovery" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">{t.call}</a>
              <span className="text-sm text-muted-foreground mt-2">{t.city}<br/>{t.country}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Mohamed Mehdi Jabry</p>
          <p>{t.built}</p>
          <a href="https://github.com/mehdijabry/mehdijabry" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t.source}</a>
        </div>
      </div>
    </footer>
  );
}
