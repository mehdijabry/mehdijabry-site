import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Logo } from "@/components/logo";
import { useLang } from "@/lib/i18n";

const COPY = {
  fr: { work: "Réalisations", pricing: "Tarifs", about: "À propos", contact: "Contact", home: "Accueil", cta: "Demander un devis", menu: "Menu", theme: "Changer de thème", other: "English" },
  en: { work: "Work", pricing: "Pricing", about: "About", contact: "Contact", home: "Home", cta: "Try a quote", menu: "Menu", theme: "Switch theme", other: "Français" },
} as const;

export function Nav() {
  const { lang, toggle } = useLang();
  const t = COPY[lang];
  // Le papier est le thème par défaut depuis le 6 octobre 2026. Ce n'est pas un goût : les
  // miniatures de maquettes sont le produit du studio, et elles se noyaient sur fond sombre.
  // Un choix déjà enregistré par le visiteur l'emporte toujours ; sinon on suit son système.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const sombre =
      stored === "dark" ||
      (stored !== "light" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    setIsDark(!!sombre);
    document.documentElement.classList.toggle("dark", !!sombre);
  }, []);

  const toggleTheme = () => {
    const sombre = !isDark;
    setIsDark(sombre);
    document.documentElement.classList.toggle("dark", sombre);
    localStorage.setItem("theme", sombre ? "dark" : "light");
    // La barre d'état du navigateur mobile suit le thème, sinon elle reste de l'autre couleur.
    document.getElementById("theme-color")?.setAttribute("content", sombre ? "#0D0F14" : "#F7F6F2");
  };

  /** Sélecteur de langue : le libellé annonce la langue vers laquelle on bascule, pas la langue courante. */
  const LangButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={toggle}
      className={`font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors ${className}`}
      aria-label={lang === "fr" ? "Switch to English" : "Passer en français"}
      data-testid="button-lang"
    >
      {lang === "fr" ? "EN" : "FR"}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group" aria-label="Mehdi Jabry — mehdijabry.dev">
          <Logo className="h-9 md:h-10 transition-opacity group-hover:opacity-80" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/work" className="nav-link">{t.work}</Link>
          <Link href="/pricing" className="nav-link">{t.pricing}</Link>
          <Link href="/about" className="nav-link">{t.about}</Link>
          <Link href="/contact" className="nav-link">{t.contact}</Link>
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border/50">
            <LangButton />
            <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors" aria-label={t.theme}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/start" className="inline-flex h-9 items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
              {t.cta} →
            </Link>
          </div>
        </nav>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-4">
          <LangButton />
          <button onClick={toggleTheme} className="text-muted-foreground" aria-label={t.theme}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t.menu}>
                <Menu className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full h-full max-w-none border-none bg-background rounded-none m-0 pt-16 px-6">
              <DialogTitle className="sr-only">{t.menu}</DialogTitle>
              <div className="flex flex-col gap-6 text-3xl font-display font-bold tracking-[-0.04em] mt-12">
                <DialogClose asChild><Link href="/">{t.home}</Link></DialogClose>
                <DialogClose asChild><Link href="/work">{t.work}</Link></DialogClose>
                <DialogClose asChild><Link href="/pricing">{t.pricing}</Link></DialogClose>
                <DialogClose asChild><Link href="/about">{t.about}</Link></DialogClose>
                <DialogClose asChild><Link href="/contact">{t.contact}</Link></DialogClose>
                <DialogClose asChild>
                  <Link href="/start" className="mt-6 text-primary font-mono text-sm uppercase tracking-[0.2em] font-medium not-italic">
                    {t.cta} →
                  </Link>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
