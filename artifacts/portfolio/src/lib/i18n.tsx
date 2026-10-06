import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Langue du site public (2026-10-06).
 *
 * Le site s'adressait aux clients anglophones ; depuis la fiche Google et la prospection locale, ses
 * visiteurs sont surtout des commerçants de Trois-Rivières. La page choisit donc sa langue d'après celle
 * du navigateur — français pour un francophone — et un sélecteur FR/EN permet d'en changer à tout moment.
 *
 * Pas de bibliothèque d'internationalisation : chaque page porte son propre dictionnaire `{ fr, en }` et
 * lit `COPY[lang]`. C'est explicite, se relit à côté du gabarit, et ne coûte rien au chargement.
 *
 * Le choix est retenu dans localStorage : un visiteur qui bascule en anglais retrouve l'anglais à sa
 * visite suivante. L'attribut `lang` de <html> suit, pour les lecteurs d'écran et les moteurs.
 */
export type Lang = "fr" | "en";

const KEY = "lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; toggle: () => void };
const LanguageContext = createContext<Ctx | null>(null);

/** Français par défaut pour un navigateur francophone ; anglais pour tous les autres. */
function detect(): Lang {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "fr" || stored === "en") return stored;
  } catch { /* navigation privée : on retombe sur la langue du navigateur */ }
  if (typeof navigator === "undefined") return "fr";
  return /^fr\b/i.test(navigator.language ?? "") ? "fr" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* jamais bloquant */ }
  }, []);

  const toggle = useCallback(() => setLang(lang === "fr" ? "en" : "fr"), [lang, setLang]);
  const value = useMemo(() => ({ lang, setLang, toggle }), [lang, setLang, toggle]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang doit être utilisé à l'intérieur de <LanguageProvider>");
  return ctx;
}

/** Raccourci des pages : `const t = useCopy(COPY);` puis `t.title`. */
export function useCopy<T>(copy: Record<Lang, T>): T {
  return copy[useLang().lang];
}
