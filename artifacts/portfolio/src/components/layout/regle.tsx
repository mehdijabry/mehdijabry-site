import { useEffect, useRef } from "react";
import { useLang, type Lang } from "@/lib/i18n";

/**
 * LA COLONNE DE DROITE — « la règle ».
 *
 * Portage fidèle du bloc `bordDroit()` de la maquette v2
 * (`site dev/mehdijabry-maquette-v2/construire.py`). Quatre étages, relevés
 * image par image sur l'enregistrement d'ArtCraft :
 *
 *   1. la règle graduée de 0 à 100 et son pourcentage ;
 *   2. la pile du haut — sections passées en petit, section courante en grand ;
 *   3. le nom de la section SUIVANTE, qui monte LETTRE PAR LETTRE en pivotant
 *      et se recompose en arrivant sous le titre courant ;
 *   4. la file d'attente du bas — ce qui reste à lire.
 *
 * DEUX ERREURS À NE PAS REFAIRE, toutes deux corrigées à la mesure :
 *
 * · **L'échelle est FIXE, c'est le repère qui descend.** La première version
 *   faisait défiler une bande derrière un trait immobile : le trait restait
 *   planté au milieu même en haut de page. Sur l'enregistrement, à 24 % de
 *   défilement on lit les graduations 25 et 30, à 68 % on lit 60, 65 et 70 —
 *   ce qui ne colle qu'avec une échelle immobile.
 *
 * · **Un `textPath` ne peut pas faire ça.** Il impose un espacement constant
 *   le long du tracé, or les lettres s'écartent en montant puis se rejoignent
 *   à l'arrivée. D'où un `<text>` par lettre, chacune avec son propre retard.
 *   La FIN du mot part la première, le DÉBUT arrive en dernier.
 */

export type SectionRegle = { id: string; fr: string; en: string };

const FONTE = "bold 30px Archivo, Helvetica, Arial, sans-serif";
const PETIT = 13;
const GRAND = 30;
/** Écart temporel entre la première lettre partie et la dernière. */
const ETALE = 0.55;

type Lettre = { el: SVGTextElement; i: number; avanceX: number; larg: number };

export function Regle({ sections }: { sections: SectionRegle[] }) {
  const { lang } = useLang();
  const bord = useRef<HTMLDivElement>(null);
  const pile = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGSVGElement>(null);
  const ticks = useRef<HTMLDivElement>(null);
  const curseur = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLDivElement>(null);

  // `sections` est souvent un littéral : on le fige dans une ref pour que
  // l'effet ne se redémonte pas à chaque rendu du parent.
  const cle = sections.map((s) => s.id).join("|");

  useEffect(() => {
    const elBord = bord.current;
    const elPile = pile.current;
    const elFile = file.current;
    const elArc = arc.current;
    const elTicks = ticks.current;
    const elCurseur = curseur.current;
    const elPct = pct.current;
    if (!elBord || !elPile || !elFile || !elArc || !elTicks || !elCurseur || !elPct) return;

    const lg: Lang = lang;
    elPile.innerHTML = "";
    elFile.innerHTML = "";
    const spansPile = sections.map((s) => {
      const e = document.createElement("span");
      e.textContent = s[lg];
      elPile.appendChild(e);
      return e;
    });
    const spansFile = sections.map((s) => {
      const e = document.createElement("span");
      e.textContent = s[lg];
      elFile.appendChild(e);
      return e;
    });

    function dessinerRegle() {
      const parent = elTicks!.parentElement;
      if (!parent) return;
      const h = parent.clientHeight;
      let html = "";
      for (let u = 0; u <= 100; u++) {
        const maj = u % 5 === 0;
        const y = (u / 100) * h;
        html += `<div class="tick${maj ? " majeur" : ""}" style="top:${y.toFixed(1)}px"></div>`;
        if (maj) html += `<div class="tick-num" style="top:${y.toFixed(1)}px">${u}</div>`;
      }
      elTicks!.style.position = "absolute";
      elTicks!.style.inset = "0";
      elTicks!.innerHTML = html;
    }

    let lettres: Lettre[] = [];
    let motActuel: string | null = null;

    function construireLettres(mot: string) {
      if (mot === motActuel) return;
      motActuel = mot;
      elArc!.innerHTML = "";
      lettres = [];
      if (!mot) return;
      const c = document.createElement("canvas").getContext("2d");
      if (!c) return;
      c.font = FONTE;
      const larg = [...mot].map((ch) => c.measureText(ch).width);
      const total = larg.reduce((a, b) => a + b, 0);
      let cum = 0;
      [...mot].forEach((ch, i) => {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.textContent = ch;
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("dominant-baseline", "middle");
        elArc!.appendChild(t);
        lettres.push({ el: t, i, avanceX: cum - total, larg: larg[i] });
        cum += larg[i];
      });
    }

    /**
     * OÙ LE MOT ATTEND, ET OÙ IL ARRIVE.
     *
     * · En attente : une colonne À GAUCHE de la règle. Posée au bord droit,
     *   elle passait SOUS les graduations — la règle est déclarée après dans
     *   le balisage, donc elle peint par-dessus et les lettres devenaient
     *   illisibles.
     * · À l'arrivée : exactement SOUS le titre blanc de la section courante,
     *   aligné à droite comme la pile. Si la position d'arrivée ne coïncide
     *   pas avec la ligne suivante de la pile, on voit un saut au basculement.
     */
    function poser(L: Lettre, v: number, b: DOMRect, cible: { x: number; y: number; ech: number }) {
      const xAttente = b.width - 62;
      const yBas = b.height * 0.82;
      const e = v * v * (3 - 2 * v);

      const x0 = xAttente;
      const y0 = yBas - L.i * (PETIT * 0.8);
      const x1 = cible.x + L.avanceX * cible.ech + (L.larg * cible.ech) / 2;
      const y1 = cible.y;
      const cx = xAttente + 16;
      const cy = y1 + (yBas - y1) * 0.34;
      const u = 1 - e;
      const x = u * u * x0 + 2 * u * e * cx + e * e * x1;
      const y = u * u * y0 + 2 * u * e * cy + e * e * y1;

      L.el.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(-90 * (1 - e)).toFixed(1)})`);
      L.el.setAttribute("font-size", (PETIT + (GRAND * cible.ech - PETIT) * e).toFixed(1));
      L.el.setAttribute("fill", `rgba(242,241,238,${(0.38 + 0.62 * e).toFixed(2)})`);
    }

    /** La cible se LIT dans la pile : le titre courant est en `clamp()`. */
    function cibleArrivee(b: DOMRect) {
      const grand = elPile!.querySelector<HTMLElement>(".courante");
      const r = (grand ?? elPile!).getBoundingClientRect();
      const fs = grand ? parseFloat(getComputedStyle(grand).fontSize) : GRAND;
      return { x: r.right - b.left, y: r.bottom - b.top + fs * 0.62, ech: fs / GRAND };
    }

    function animerLettres(prog: number, b: DOMRect) {
      const n = lettres.length;
      if (!n) return;
      const cible = cibleArrivee(b);
      for (const L of lettres) {
        // La dernière lettre part la première.
        const retard = (n - 1 - L.i) * (ETALE / Math.max(1, n - 1));
        poser(L, Math.max(0, Math.min(1, prog * (1 + ETALE) - retard)), b, cible);
      }
    }

    let vise = 0;

    /* LA POSITION D'UN REPÈRE SE MESURE EN COORDONNÉES DE DOCUMENT.
       La maquette lisait `offsetTop`, ce qui marchait parce que ses sections
       étaient filles directes de `main`. Sur les autres pages, l'ancre est un
       `<h2>` au fond d'un conteneur, et `offsetTop` se compte depuis le
       PREMIER ANCÊTRE POSITIONNÉ — pas depuis le haut de la page. Le repère
       tombait alors à quelques dizaines de pixels et toutes les sections
       paraissaient franchies dès le chargement. */
    const hautDe = (id: string) => {
      const e = document.getElementById(id);
      return e ? e.getBoundingClientRect().top + scrollY : Number.POSITIVE_INFINITY;
    };

    function majeur() {
      const max = document.body.scrollHeight - innerHeight;
      vise = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;

      const y = scrollY + innerHeight * 0.38;
      let cour = 0;
      sections.forEach((s, i) => {
        if (hautDe(s.id) <= y) cour = i;
      });

      /* LA PROGRESSION DU VOL SE CALCULE D'ABORD : la file d'attente en dépend.
         Une section dont les lettres sont déjà parties ne doit plus figurer en
         bas, sinon on lit le même mot DEUX FOIS — une fois en vol au bord
         droit, une fois posé dans la file. */
      const suivante = sections[cour + 1];
      let qVol = 0;
      if (suivante) {
        const haut = hautDe(suivante.id);
        const reste0 = (Number.isFinite(haut) ? haut : 0) - (scrollY + innerHeight * 0.38);
        qVol = Math.min(1, Math.max(0, 1 - reste0 / (innerHeight * 1.15)));
      }

      spansPile.forEach((e, i) => {
        e.className = i < cour ? "passee" : i === cour ? "courante" : "";
      });
      spansFile.forEach((e, i) => {
        const envol = i === cour + 1 && qVol > 0.04;
        e.className = i <= cour || envol ? "partie" : "";
      });
      document.querySelectorAll<HTMLElement>(".nav-liens a").forEach((l, i) => {
        l.classList.toggle("actif", i === cour);
      });

      if (suivante) {
        /* Le vol se joue sur une PORTÉE FIXE — un peu plus d'un écran avant la
           section suivante — et non sur la hauteur de la section courante :
           rapporté à une section de douze écrans, le mot avançait au ralenti. */
        construireLettres(suivante[lg].toUpperCase());
        animerLettres(qVol, elBord!.getBoundingClientRect());
        elArc!.style.opacity = Math.min(1, qVol * 9).toFixed(2);
      } else {
        construireLettres("");
        elArc!.style.opacity = "0";
      }
    }

    /* LE GLISSEMENT. Poser `top = p * h` dans l'écouteur de défilement donne un
       à-coup par cran de molette. On amortit dans une boucle d'image, qui
       s'arrête d'elle-même quand l'écart devient invisible. */
    let suivi = 0;
    let enCours = false;
    let vivant = true;

    function glisse() {
      if (!vivant) return;
      const ecart = vise - suivi;
      suivi += ecart * 0.12;
      if (Math.abs(ecart) < 0.0002) {
        suivi = vise;
        enCours = false;
      } else {
        enCours = true;
      }

      const parent = elTicks!.parentElement;
      const h = parent ? parent.clientHeight : 0;
      const y = suivi * h;
      elCurseur!.style.top = `${y.toFixed(1)}px`;
      // Le pourcentage se range AU-DESSUS du trait dans le dernier dixième,
      // sinon il sort de la colonne en bas de page.
      elPct!.style.top = `${(suivi > 0.9 ? y - 16 : y + 5).toFixed(1)}px`;
      elPct!.textContent = `${String(Math.round(suivi * 100)).padStart(3, "0")} %`;

      if (enCours) requestAnimationFrame(glisse);
    }

    function reveille() {
      majeur();
      if (!enCours) {
        enCours = true;
        requestAnimationFrame(glisse);
      }
    }

    function auRedimensionnement() {
      dessinerRegle();
      motActuel = null;
      reveille();
    }

    dessinerRegle();
    majeur();
    suivi = vise;
    glisse();
    addEventListener("scroll", reveille, { passive: true });
    addEventListener("resize", auRedimensionnement);

    return () => {
      vivant = false;
      removeEventListener("scroll", reveille);
      removeEventListener("resize", auRedimensionnement);
    };
    // `cle` rejoue l'effet quand la LISTE des sections change, pas à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, lang]);

  return (
    <div className="bord" aria-hidden="true" ref={bord}>
      {/* Un <text> par lettre : voir la note en tête de fichier. */}
      <svg className="arc" ref={arc} />
      <div className="pile" ref={pile} />
      <div className="file" ref={file} />
      <div className="regle">
        <div ref={ticks} />
        <div className="curseur" ref={curseur} style={{ top: 0 }} />
        <div className="pct" ref={pct} style={{ top: 0 }}>
          000&nbsp;%
        </div>
      </div>
    </div>
  );
}
