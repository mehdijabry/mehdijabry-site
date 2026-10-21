import { Link } from "wouter";
import { useCopy } from "@/lib/i18n";

/**
 * LE PIED — « l'instrument », 21 octobre 2026.
 *
 * Trois colonnes séparées par des filets, et une barre basse. Même grammaire
 * que la maquette v2 : aucun conteneur centré, la marge de gauche est celle de
 * toute la page (`--marge`), et les étiquettes sont en chasse fixe.
 *
 * DEUX CHOSES QUI NE CHANGENT PAS, ET QUI SONT DES RÈGLES, PAS DES DÉTAILS :
 *
 * · **La pile technique est celle qui tourne vraiment.** Le pied annonçait
 *   « Next.js, Supabase et Resend » alors que ce site est React + Vite devant,
 *   Express + Drizzle derrière, Postgres sur Render et Cloudflare pour les
 *   maquettes. Sur un site dont toute la thèse est « rien ici n'est une
 *   promesse, tout est vérifiable », une pile inventée est le pire détail.
 *
 * · **L'adresse et le numéro viennent des réglages de production**
 *   (`/api/admin/settings`), jamais de mémoire. Et la rue et la ville
 *   seulement — jamais le numéro d'appartement.
 */

const COPY = {
  fr: {
    accroche: "Studio web indépendant à Trois-Rivières. Des sites construits avant le premier appel.",
    studio: "Studio",
    contact: "Contact",
    work: "Réalisations",
    pricing: "Tarifs",
    about: "À propos",
    legal: "Mentions légales",
    courriel: "Courriel",
    ville: "Trois-Rivières, Québec",
    pile: "React · Vite · Express · Postgres · Cloudflare",
  },
  en: {
    accroche: "Independent web studio in Trois-Rivières. Sites built before the first call.",
    studio: "Studio",
    contact: "Contact",
    work: "Work",
    pricing: "Pricing",
    about: "About",
    legal: "Legal",
    courriel: "Email",
    ville: "Trois-Rivières, Quebec",
    pile: "React · Vite · Express · Postgres · Cloudflare",
  },
};

export function Footer() {
  const t = useCopy(COPY);
  return (
    <footer className="pied">
      <div className="pied-haut">
        <div className="pied-col">
          <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 26 }}>MJ</div>
          <p style={{ margin: "12px 0 0", color: "var(--sourdine)", fontSize: 13.5, maxWidth: "30ch" }}>
            {t.accroche}
          </p>
          <p className="mono" style={{ marginTop: 16 }}>
            CONTACT@MEHDIJABRY.DEV
          </p>
        </div>

        <div className="pied-col">
          <h4 className="mono" style={{ margin: "0 0 14px" }}>
            {t.studio}
          </h4>
          <Link href="/work">{t.work}</Link>
          <Link href="/pricing">{t.pricing}</Link>
          <Link href="/about">{t.about}</Link>
          <Link href="/legal">{t.legal}</Link>
        </div>

        <div className="pied-col">
          <h4 className="mono" style={{ margin: "0 0 14px" }}>
            {t.contact}
          </h4>
          <a href="mailto:contact@mehdijabry.dev">{t.courriel}</a>
          <a href="tel:+14385257119" className="tabular-nums">
            438 525-7119
          </a>
          <a href="https://www.linkedin.com/in/mehdijabry/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <span style={{ display: "block", marginTop: 10, color: "var(--sourdine)", fontSize: 13.5 }}>
            {t.ville}
          </span>
        </div>
      </div>

      <div className="pied-bas">
        <span className="mono">© 2026 MOHAMED MEHDI JABRY</span>
        <span className="mono" style={{ textTransform: "none", letterSpacing: ".1em" }}>
          {t.pile}
        </span>
      </div>
    </footer>
  );
}
