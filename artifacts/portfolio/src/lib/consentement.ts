/**
 * LE CONSENTEMENT — Loi 25 (Québec) et RGPD, 17 novembre 2026.
 *
 * Pas un bandeau décoratif : une PORTE. Tant que la personne n'a pas
 * choisi, rien d'autre que le nécessaire ne s'écrit dans son navigateur et
 * aucun script tiers n'est chargé. La porte est posée sur
 * `Storage.prototype.setItem` (localStorage et sessionStorage) et sur
 * l'accesseur `document.cookie` : une écriture dont la clé n'est pas
 * autorisée est refusée, silencieusement pour la page, bruyamment dans
 * `refuses` pour qui veut vérifier.
 *
 * Chaque clé connue est rangée dans une catégorie par la table `REGLES`.
 * Une clé inconnue est refusée : ajouter une clé au site, c'est l'ajouter
 * ici ET dans la page légale. C'est voulu — c'est ce qui rend la promesse
 * du bandeau vraie.
 *
 * Le refus est aussi simple que l'acceptation : trois boutons de même
 * poids, et un retrait possible à tout moment depuis le pied de page.
 */
export type Categorie = "necessaire" | "mesure";
export type Choix = { v: 1; le: string; mesure: boolean };
type Ou = "local" | "session" | "cookie";
type Regle = { cle: string | RegExp; ou: Ou | "*"; categorie: Categorie; quoi: { fr: string; en: string } };

export const CLE = "mj.consentement";
export const DUREE_JOURS = 182;
const EVENEMENT = "mj:consentement";

/** La table : tout ce que ce site peut écrire dans un navigateur, et pourquoi. */
export const REGLES: readonly Regle[] = [
  { cle: CLE, ou: "local", categorie: "necessaire", quoi: { fr: "Votre choix de consentement (ce bandeau), six mois", en: "Your consent choice (this banner), six months" } },
  { cle: "lang", ou: "local", categorie: "necessaire", quoi: { fr: "La langue que vous avez choisie, FR ou EN", en: "The language you chose, FR or EN" } },
  { cle: "mj_admin", ou: "cookie", categorie: "necessaire", quoi: { fr: "La session de l'espace d'administration, seulement si vous vous y connectez", en: "The admin area session, only if you sign in there" } },
  { cle: "sidebar_state", ou: "cookie", categorie: "necessaire", quoi: { fr: "L'état du menu de l'espace d'administration", en: "The admin area menu state" } },
  { cle: /^plausible_/, ou: "*", categorie: "mesure", quoi: { fr: "Plausible Analytics : mesure d'audience sans cookie ni identifiant, chargée seulement avec votre accord", en: "Plausible Analytics: cookie-free, identifier-free audience measurement, loaded only with your consent" } },
];

export const refuses: { cle: string; ou: Ou; quand: string }[] = [];
let choix: Choix | null = null;
let porteInstallee = false;

function lireStocke(): Choix | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const v = JSON.parse(brut) as Partial<Choix> & { le?: string };
    if (v.v !== 1 || typeof v.le !== "string") return null;
    if (Date.now() - Date.parse(v.le) > DUREE_JOURS * 86_400_000) return null;
    return { v: 1, le: v.le, mesure: v.mesure === true };
  } catch {
    return null;
  }
}

function regleDe(cle: string, ou: Ou): Regle | undefined {
  return REGLES.find((r) => (r.ou === "*" || r.ou === ou) && (typeof r.cle === "string" ? r.cle === cle : r.cle.test(cle)));
}

/** Vrai si cette écriture est permise maintenant. */
function permis(cle: string, ou: Ou): boolean {
  const r = regleDe(cle, ou);
  if (!r) return false;
  if (r.categorie === "necessaire") return true;
  return choix !== null && choix[r.categorie] === true;
}

/** La porte, posée une fois, avant que React ne monte. */
export function installerPorte(): void {
  if (porteInstallee || typeof window === "undefined") return;
  porteInstallee = true;
  choix = lireStocke();

  const setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (this: Storage, cle: string, valeur: string) {
    const ou: Ou = this === window.sessionStorage ? "session" : "local";
    if (!permis(cle, ou)) {
      refuses.push({ cle, ou, quand: new Date().toISOString() });
      return;
    }
    return setItem.call(this, cle, valeur);
  };

  const desc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
  if (desc && desc.set && desc.get) {
    const set = desc.set, get = desc.get;
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() { return get.call(document); },
      set(valeur: string) {
        const nom = String(valeur).split("=")[0].trim();
        const expire = /max-age=0|expires=Thu, 01 Jan 1970/i.test(String(valeur));
        if (expire || permis(nom, "cookie")) set.call(document, valeur);
        else refuses.push({ cle: nom, ou: "cookie", quand: new Date().toISOString() });
      },
    });
  }
}

export function lire(): Choix | null { return choix; }
export function accepte(categorie: Categorie): boolean {
  return categorie === "necessaire" || (choix !== null && choix[categorie] === true);
}

/** Enlève du navigateur ce qui appartient aux catégories refusées. */
function purger(): void {
  for (const r of REGLES) {
    if (r.categorie === "necessaire" || accepte(r.categorie)) continue;
    for (const [nom, st] of [["local", window.localStorage], ["session", window.sessionStorage]] as const) {
      if (r.ou !== "*" && r.ou !== nom) continue;
      for (let i = st.length - 1; i >= 0; i--) {
        const k = st.key(i);
        if (k && (typeof r.cle === "string" ? r.cle === k : r.cle.test(k))) st.removeItem(k);
      }
    }
    if (r.ou === "*" || r.ou === "cookie") {
      for (const part of document.cookie.split(";")) {
        const nom = part.split("=")[0].trim();
        if (nom && (typeof r.cle === "string" ? r.cle === nom : r.cle.test(nom))) {
          document.cookie = `${nom}=; path=/; max-age=0`;
        }
      }
    }
  }
}

/** Pose un choix complet et le dit à toute la page. */
export function poser(nouveau: { mesure: boolean }): Choix {
  choix = { v: 1, le: new Date().toISOString(), mesure: nouveau.mesure === true };
  try { window.localStorage.setItem(CLE, JSON.stringify(choix)); } catch { /* navigation privée stricte : le choix vaut pour la page */ }
  purger();
  window.dispatchEvent(new CustomEvent(EVENEMENT, { detail: choix }));
  return choix;
}

/** Retire le choix : tout ce qui n'est pas nécessaire est effacé, le bandeau revient. */
export function retirer(): void {
  choix = null;
  try { window.localStorage.removeItem(CLE); } catch { /* rien */ }
  purger();
  window.dispatchEvent(new CustomEvent(EVENEMENT, { detail: null }));
}

export function ouvrir(): void { window.dispatchEvent(new CustomEvent(EVENEMENT + ":ouvrir")); }

export function surChangement(fn: (c: Choix | null) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<Choix | null>).detail);
  window.addEventListener(EVENEMENT, h);
  return () => window.removeEventListener(EVENEMENT, h);
}
export function surOuverture(fn: () => void): () => void {
  window.addEventListener(EVENEMENT + ":ouvrir", fn);
  return () => window.removeEventListener(EVENEMENT + ":ouvrir", fn);
}

/** Exécute `fn` dès que la catégorie est acceptée — maintenant, ou plus tard, une seule fois. */
export function quandAccepte(categorie: Categorie, fn: () => void): () => void {
  if (accepte(categorie)) { fn(); return () => {}; }
  let fait = false;
  const stop = surChangement(() => { if (!fait && accepte(categorie)) { fait = true; stop(); fn(); } });
  return stop;
}

/* ── Les tiers, chargés seulement après accord ────────────────────────── */
let plausiblePose = false;
export function poserPlausible(domaine = "mehdijabry.dev"): void {
  if (plausiblePose || typeof document === "undefined") return;
  plausiblePose = true;
  const s = document.createElement("script");
  s.defer = true;
  s.dataset.domain = domaine;
  s.src = "https://plausible.io/js/script.js";
  document.head.appendChild(s);
}
