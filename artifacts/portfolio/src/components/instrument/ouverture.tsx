import { useEffect, useRef } from "react";

/**
 * L'OUVERTURE — le M et le J du monogramme s'écartent et laissent place au nom.
 *
 * Portage fidèle du bloc `ouverture()` de la maquette v2. Mehdi, 21/10 :
 * « le M et le J du logo s'écartent chacun de leur côté jusqu'à atteindre
 * leurs places respectives et laissent place au reste ».
 *
 * MÉTHODE. Le nom est écrit ENTIER dès le départ — la mise en page est donc
 * définitive et rien ne poussera rien. On mesure la position réelle de chaque
 * lettre, puis on DÉPLACE le M, le J et le point pour qu'ils composent le
 * monogramme au centre de la fenêtre. À l'ouverture, leur translation revient
 * à zéro : chaque pièce regagne sa place en glissant, et les lettres ordinaires
 * sortent de dessous elles.
 *
 * QUATRE PIÈGES, TOUS RENCONTRÉS, TOUS MESURÉS :
 *
 * 1. **Jouer sur la largeur ne marche pas.** Écraser la largeur des lettres
 *    cachées fait GRANDIR le mot d'un bloc : ça se lit comme un surgissement,
 *    pas comme un écartement. Seules des `translate` donnent deux lettres qui
 *    voyagent.
 *
 * 2. **L'état de départ se POSE, il ne s'anime pas.** Sans `transition:none`
 *    au moment de poser le décalage, la transition déclarée par `.js-ouv.pret`
 *    se déclenche : le M part de sa place FINALE et rampe vers le centre
 *    pendant tout le maintien. Mesuré en échantillonnant toutes les 1,3 s :
 *    587 → 592 → 595 → 597 au lieu d'être posé net à 601. C'est tout le
 *    « ça se décompose puis ça se recompose » que Mehdi voyait.
 *    D'où : couper la transition → poser → forcer un recalcul → la rétablir.
 *
 * 3. **On attend que la mise en page soit DÉFINITIVE**, pas seulement les
 *    polices : `placer()` fige des pixels, et toute refluence après la mesure
 *    (une police substituée, des images qui finissent de se décoder) les rend
 *    faux. On attend `document.fonts.ready` ET `load`.
 *
 * 4. **Les lettres ordinaires n'apparaissent qu'à l'arrivée du sigle.** À
 *    +0,5 s sur un trajet de 1,45 s, on lisait « MEHDI JABRY » en fantôme
 *    autour d'un sigle qui glissait. Elles attendent 1,15 s.
 *
 * LE VOILE EST OPAQUE : tant que `js-ouv` est posé sur <html>, la page est
 * noire et le défilement bloqué. Tout chemin de sortie doit l'enlever.
 */

const CRAIE = "#F4F3EE";
const DORE = "#B08D57";

export function Ouverture() {
  const nom = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = nom.current;
    const racine = document.documentElement;
    const rendreLaPage = () => racine.classList.remove("js-ouv", "pret", "ouvert");
    if (!el) {
      rendreLaPage();
      return;
    }

    if (!racine.classList.contains("js-ouv")) return; // amorce non jouée : rien à faire

    /* `?lent=6` ralentit l'ouverture. Les captures automatisées mettent près
       d'une seconde par aller-retour : à vitesse réelle elles tombent TOUJOURS
       après la fin du mouvement. On observe ainsi le vrai code, pas une
       réimplémentation dans un script d'essai — qui ne prouverait rien. */
    const LENT = Math.max(1, Math.min(40, Number(/[?&]lent=(\d+)/.exec(location.search)?.[1] ?? 1)));

    const spans = [...el.querySelectorAll<HTMLElement>(".l")];
    if (!spans.length) {
      rendreLaPage();
      return;
    }

    const minuteurs: number[] = [];
    minuteurs.push(window.setTimeout(rendreLaPage, 14000 * LENT)); // garde-fou absolu

    function placer() {
      const sigles = spans.filter((sp) => sp.dataset.sigle === "1");
      const point = spans.find((sp) => sp.dataset.point === "1");
      if (sigles.length < 2) {
        racine.classList.add("pret", "ouvert");
        minuteurs.push(window.setTimeout(rendreLaPage, 1200));
        return;
      }

      const r = spans.map((sp) => sp.getBoundingClientRect());
      const iM = spans.indexOf(sigles[0]);
      const iJ = spans.indexOf(sigles[1]);
      const iP = point ? spans.indexOf(point) : -1;

      /* LA DISPOSITION DE DÉPART EST CELLE DU MONOGRAMME, à l'unité près.
         Dans le viewBox d'origine (120×120) : le M occupe x 21,5→65,5, le J
         x 65,5→99,5, et le point est un carré de 9 en (74, 64). On replace les
         trois pièces dans ces rapports — le point revient se loger DANS le
         crochet du J, exactement comme sur la plaque. */
      const k = r[iM].height / 53; // pixels par unité de monogramme
      const largeurSigle = 78 * k; // 21,5 → 99,5

      /* LE MONOGRAMME PART DU CENTRE DE LA FENÊTRE, pas du centre du titre.
         Mehdi, 21/10 : « le logo n'apparaît pas au centre de la page, il
         apparaît un peu en haut à gauche ». Deux causes : la colonne de droite
         décale tout le contenu vers la gauche, et le titre est haut dans
         l'écran. On vise donc des coordonnées de FENÊTRE, en retirant la
         hauteur de la barre qui recouvre le haut. */
      const barre = document.querySelector(".nav");
      const hBarre = barre ? barre.getBoundingClientRect().height : 0;
      const X0 = innerWidth / 2 - largeurSigle / 2;
      const Y0 = hBarre + (innerHeight - hBarre) / 2 - (53 * k) / 2;

      const dx = new Map<number, number>();
      const dy = new Map<number, number>();
      dx.set(iM, X0 - r[iM].left);
      dy.set(iM, Y0 - r[iM].top);
      dx.set(iJ, X0 + 44 * k - r[iJ].left);
      dy.set(iJ, Y0 - r[iJ].top);
      if (iP >= 0) {
        dx.set(iP, X0 + 52.5 * k - r[iP].left);
        dy.set(iP, Y0 + 28.5 * k - r[iP].top);
      }
      // Les lettres ordinaires se rangent derrière le glyphe qui les précède :
      // elles sortent de dessous le M ou le J, elles ne tombent pas du ciel.
      let suitX = 0;
      let suitY = 0;
      spans.forEach((sp, i) => {
        if (dx.has(i)) {
          if (sp.dataset.sigle === "1") {
            suitX = dx.get(i)!;
            suitY = dy.get(i)!;
          }
          return;
        }
        dx.set(i, suitX);
        dy.set(i, suitY);
      });

      // Piège n°2 : couper, poser, recalculer, rétablir.
      spans.forEach((sp, i) => {
        sp.style.transition = "none";
        sp.style.transform = `translate(${dx.get(i)!.toFixed(1)}px,${dy.get(i)!.toFixed(1)}px)`;
        sp.style.opacity = sp.dataset.sigle === "1" || sp.dataset.point === "1" ? "1" : "0";
      });
      void el!.offsetWidth; // le style est recalculé ICI, sans transition
      for (const sp of spans) {
        const sigle = sp.dataset.sigle === "1" || sp.dataset.point === "1";
        sp.style.transition =
          `transform ${(sigle ? 1.45 : 0.75) * LENT}s cubic-bezier(.16,1,.3,1), opacity ${0.45 * LENT}s ease`;
      }
      racine.classList.add("pret"); // le nom peut paraître : il est en place

      minuteurs.push(
        window.setTimeout(() => {
          racine.classList.add("ouvert");
          spans.forEach((sp, i) => {
            const propre = sp.dataset.sigle === "1" || sp.dataset.point === "1";
            const retard = propre ? 0 : 1.15 + Math.abs(i - spans.length / 2) * 0.05;
            sp.style.transitionDelay = `${(retard * LENT).toFixed(2)}s, ${(retard * LENT).toFixed(2)}s`;
            sp.style.transform = "translate(0,0)";
            sp.style.opacity = "1";
          });
          // Une fois posé, on rend la main : plus aucun style en ligne, la mise
          // en page reprend ses droits au redimensionnement.
          minuteurs.push(
            window.setTimeout(() => {
              spans.forEach((sp) => {
                sp.style.transform = "";
                sp.style.opacity = "";
                sp.style.transitionDelay = "";
                sp.style.transition = "";
              });
              racine.classList.remove("js-ouv", "pret");
            }, 2600 * LENT),
          );
        }, 950 * LENT), // le sigle tient seul avant de s'ouvrir
      );
    }

    let fait = false;
    const lancer = () => {
      if (fait) return;
      fait = true;
      void el!.offsetWidth;
      requestAnimationFrame(placer);
    };

    const polices = document.fonts?.ready ?? Promise.resolve();
    const charge =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((res) => addEventListener("load", () => res(), { once: true }));
    Promise.all([polices, charge]).then(lancer);
    /* 2,2 s et non 4 : depuis que le voile est opaque, cette attente n'est plus
       une page lisible qu'on fait patienter, c'est un écran noir. */
    minuteurs.push(window.setTimeout(lancer, 2200));

    return () => {
      minuteurs.forEach(clearTimeout);
      rendreLaPage();
    };
  }, []);

  return (
    <h1 className="mot-geant" id="nom" aria-label="Mehdi Jabry" ref={nom}>
      <span className="l gl" data-sigle="1" style={{ width: "0.72em", height: "0.8673em", verticalAlign: "-0.0736em" }}>
        <svg viewBox="21.5 35.5 44 53" aria-hidden="true">
          <path d="M26 84V40l18 19 17-19v44" fill="none" stroke={CRAIE} strokeWidth="9" strokeLinecap="square" strokeLinejoin="bevel" />
        </svg>
      </span>
      <span className="l">E</span>
      <span className="l">H</span>
      <span className="l">D</span>
      <span className="l">I</span>
      <span className="l gl" data-point="1" style={{ width: "0.1473em", height: "0.1473em", verticalAlign: "0.3273em", margin: "0 0.1145em" }}>
        <svg viewBox="74 64 9 9" aria-hidden="true">
          <rect x="74" y="64" width="9" height="9" fill={CRAIE} />
        </svg>
      </span>
      <span className="l gl" data-sigle="1" style={{ width: "0.5564em", height: "0.9em", verticalAlign: "-0.1064em" }}>
        <svg viewBox="65.5 35.5 34 55" aria-hidden="true">
          <path d="M70 40h25v29c0 9.4-7.6 17-17 17H70" fill="none" stroke={DORE} strokeWidth="9" strokeLinecap="square" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="l">A</span>
      <span className="l">B</span>
      <span className="l">R</span>
      <span className="l">Y</span>
    </h1>
  );
}
