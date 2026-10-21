import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * LA BARRE — « l'instrument », 21 octobre 2026.
 *
 * Elle ne ressemble plus à une barre de site : c'est le bandeau d'un appareil.
 * Pleine largeur, hauteur fixe (`--barre`), aucun conteneur centré, des filets
 * verticaux entre chaque case, et les libellés en chasse fixe majuscule. La
 * case active est INVERSÉE (fond clair, texte sombre) plutôt que soulignée —
 * c'est le seul endroit du site où le contraste se retourne.
 *
 * CE QUI A ÉTÉ RETIRÉ, ET POURQUOI :
 *
 * · **Le bouton lune/soleil.** La direction « l'instrument » n'a pas de version
 *   claire : son accent EST la lumière, donc sur fond clair il n'y aurait plus
 *   d'accent du tout. Le thème est écrit dans le gabarit (`<html class="dark">`).
 *
 * · **Le masquage au défilement.** Il existait parce que la barre mangeait un
 *   dixième de la hauteur utile d'un téléphone en face de grandes images. La
 *   barre fait maintenant 56 px et porte l'état de la lecture avec la règle :
 *   la faire disparaître casserait le repère. Elle reste posée.
 */

const COPY = {
  fr: {
    liens: [
      { href: "/", libelle: "Studio" },
      { href: "/pricing", libelle: "Tarifs" },
      { href: "/about", libelle: "À propos" },
      { href: "/contact", libelle: "Contact" },
    ],
    cta: "Démarrer un projet",
    menu: "Menu",
    fermer: "Fermer",
  },
  en: {
    liens: [
      { href: "/", libelle: "Studio" },
      { href: "/pricing", libelle: "Pricing" },
      { href: "/about", libelle: "About" },
      { href: "/contact", libelle: "Contact" },
    ],
    cta: "Start a project",
    menu: "Menu",
    fermer: "Close",
  },
} as const;

export function Nav() {
  const { lang, toggle } = useLang();
  const t = COPY[lang];
  const [ouvert, setOuvert] = useState(false);
  const [emplacement] = useLocation();

  // Le menu plein écran ne doit pas survivre à une navigation.
  useEffect(() => setOuvert(false), [emplacement]);

  // Tant qu'il est ouvert, la page dessous ne défile pas.
  useEffect(() => {
    if (!ouvert) return;
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = avant;
    };
  }, [ouvert]);

  /**
   * Le sélecteur annonce les DEUX langues, la courante en clair.
   * « FR / EN » se lit comme un interrupteur ; un simple « EN » se lit comme un
   * état, et on ne sait plus si on est en anglais ou si on y va.
   */
  const Langue = () => (
    <button className="nav-bouton" type="button" onClick={toggle} aria-label={lang === "fr" ? "Switch to English" : "Passer en français"} data-testid="button-lang">
      {lang === "fr" ? (
        <>
          <b style={{ color: "var(--craie-vif)" }}>FR</b>&nbsp;/&nbsp;EN
        </>
      ) : (
        <>
          FR&nbsp;/&nbsp;<b style={{ color: "var(--craie-vif)" }}>EN</b>
        </>
      )}
    </button>
  );

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-marque" aria-label="Mehdi Jabry — mehdijabry.dev">
          MJ
        </Link>

        <div className="nav-liens">
          {t.liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={emplacement === l.href ? "actif" : undefined}
            >
              {l.libelle}
            </Link>
          ))}
        </div>

        <div className="nav-fin">
          <Langue />
          <Link href="/start" className="nav-cta">
            {t.cta}
          </Link>
          <button
            className="nav-bouton nav-menu"
            type="button"
            onClick={() => setOuvert((v) => !v)}
            aria-label={ouvert ? t.fermer : t.menu}
            aria-expanded={ouvert}
          >
            {ouvert ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {ouvert && (
        <div className="nav-plein" role="dialog" aria-modal="true" aria-label={t.menu}>
          {t.liens.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.libelle}
            </Link>
          ))}
          <Link href="/start" className="nav-plein-cta">
            {t.cta}
          </Link>
        </div>
      )}
    </>
  );
}
