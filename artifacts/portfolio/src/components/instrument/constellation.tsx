import { useEffect, useRef } from "react";

/**
 * LA CONSTELLATION — les aperçus qui flottent derrière le nom.
 *
 * Portage fidèle du bloc `constellation()` de la maquette v2. Ce que l'analyse
 * image par image de l'enregistrement d'ArtCraft a montré, et que mes deux
 * premières versions avaient manqué :
 *
 * 1. **Les dalles ne tournent pas.** Sur six vues à 0,58 s d'écart, la carte
 *    orange se déplace d'environ deux pixels. Un anneau à vitesse constante
 *    donne un manège — c'est le « trop linéaire » de Mehdi.
 * 2. **C'est le pointeur qui anime le champ.** Au repos, presque rien ne bouge.
 *    La position décale tout en parallaxe par couches de profondeur, et la
 *    DIRECTION du mouvement donne une poussée qui s'amortit.
 * 3. **Elles ne sont pas toutes là.** Chaque dalle a un cycle : elle paraît,
 *    elle vit, elle s'efface, elle revient ailleurs — avec une durée de vie
 *    TIRÉE AU SORT à chaque renaissance. Une durée commune, même décalée dans
 *    le temps, donne une vague qui fait le tour puis recommence à l'identique :
 *    « ça se suit, le motif se répète ».
 * 4. **Le survol agrandit franchement**, et le clic ouvre la dalle.
 *
 * LES APERÇUS NE SONT PAS DES LIENS. Mehdi, 21/10 : « quand on clique dessus
 * ils s'agrandissent un peu, pas de redirection vers leur lien ». Ces maquettes
 * portent le nom et l'identité de commerces qui n'ont rien demandé — on les
 * montre, on n'y conduit pas. Un `<div>` et non un `<a>` : un lien désactivé en
 * JavaScript reste un lien dans la source, ouvrable au clic du milieu,
 * copiable par le menu contextuel, et suivi par les robots.
 *
 * Les emplacements sont pris dans un anneau FIXE calculé une fois : une dalle
 * ne peut jamais atterrir sur le titre, et deux versions du site se comparent.
 */

export type Apercu = { titre: string; img: string };

type Place = { x: number; y: number; z: number };
type Etat = { place: number; vu: number; age: number; vie: number; parait: number; efface: number; monte: number };

export function Constellation({ apercus }: { apercus: Apercu[] }) {
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scene.current;
    if (!el || apercus.length === 0) return;

    const N = apercus.length;
    const TAU = Math.PI * 2;
    const CALME = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* 30 vw et non 40 : à 40, la couronne extérieure atteignait 53 vw du
       centre, soit bien au-delà du bord. Le héros n'occupe PAS toute la
       largeur — la colonne de droite lui en retire `--bord` — et il faut
       encore défalquer la demi-largeur d'une vignette. */
    const PLACES: Place[] = [];
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU + 0.26;
      const r = 1 + (k % 3) * 0.17; // trois couronnes
      PLACES.push({ x: Math.sin(a) * 30 * r, y: Math.cos(a) * 27 * r, z: (k % 5) / 4 });
    }

    el.innerHTML = "";
    const els = apercus.map((c) => {
      const d = document.createElement("div");
      d.className = "carte";
      d.setAttribute("role", "button");
      d.setAttribute("tabindex", "0");
      d.setAttribute("aria-label", c.titre);
      const img = document.createElement("img");
      img.src = c.img;
      img.alt = c.titre;
      img.loading = "lazy";
      img.decoding = "async";
      const etiq = document.createElement("span");
      etiq.className = "etiq";
      etiq.textContent = c.titre;
      d.append(img, etiq);
      el.appendChild(d);
      return d;
    });

    const entre = (a: number, b: number) => a + Math.random() * (b - a);
    function neuf(st: Etat) {
      st.vie = entre(6.5, 17); // la dalle vit entre 6 s et 17 s
      st.parait = entre(1.0, 2.2);
      st.efface = entre(1.1, 2.4);
      st.monte = entre(1.4, 3.4);
    }

    const etats: Etat[] = apercus.map((_, i) => {
      const st: Etat = { place: i % PLACES.length, vu: 0, age: 0, vie: 0, parait: 0, efface: 0, monte: 0 };
      neuf(st);
      // Âges de départ étalés ET tirés au sort : sans ça elles apparaîtraient
      // toutes ensemble au chargement.
      st.age = -Math.random() * st.vie * 1.6;
      return st;
    });

    /* Un emplacement LIBRE, et jamais celui qu'on vient de quitter : une dalle
       qui réapparaît au même endroit se lit comme un clignotement, pas comme
       une nouvelle venue. */
    function placeLibre(st: Etat) {
      const pris = new Set(etats.filter((e) => e !== st && e.vu > 0.06).map((e) => e.place));
      const libres: number[] = [];
      for (let k = 0; k < PLACES.length; k++) if (!pris.has(k) && k !== st.place) libres.push(k);
      if (!libres.length) return (st.place + 1 + ((Math.random() * 5) | 0)) % PLACES.length;
      return libres[(Math.random() * libres.length) | 0];
    }

    if (CALME) {
      els.forEach((e, i) => {
        const pl = PLACES[etats[i].place];
        e.style.width = "clamp(84px, 9.4vw, 142px)";
        e.style.transform = `translate(-50%,-50%) translate(${pl.x}vw,${pl.y}vh) scale(.8)`;
        e.style.opacity = "0.7";
      });
      return () => {
        el.innerHTML = "";
      };
    }
    els.forEach((e) => {
      e.style.width = "clamp(84px, 9.4vw, 142px)";
    });

    // ── Le pointeur : la DIRECTION, pas la position. Un pointeur immobile ne
    //    pousse rien.
    let viseX = 0;
    let viseY = 0;
    let posX = 0;
    let posY = 0;
    let poussee = 0;
    let avantX: number | null = null;
    function pointe(x: number, y: number) {
      const nx = (x / innerWidth) * 2 - 1;
      const ny = (y / innerHeight) * 2 - 1;
      if (avantX !== null) poussee += (nx - avantX) * 9;
      avantX = nx;
      viseX = nx;
      viseY = ny;
    }
    const surPointeur = (e: PointerEvent) => pointe(e.clientX, e.clientY);
    const surTouche = (e: TouchEvent) => {
      if (e.touches[0]) pointe(e.touches[0].clientX, e.touches[0].clientY);
    };
    addEventListener("pointermove", surPointeur, { passive: true });
    addEventListener("touchmove", surTouche, { passive: true });

    els.forEach((e) => {
      e.addEventListener("pointerenter", () => {
        e.dataset.survol = "1";
      });
      e.addEventListener("pointerleave", () => {
        delete e.dataset.survol;
        delete e.dataset.appui;
        e.dataset.lx = "0";
        e.dataset.ly = "0";
      });
      e.addEventListener("pointermove", (ev) => {
        const r = e.getBoundingClientRect();
        e.dataset.lx = ((ev.clientX - r.left) / r.width - 0.5).toFixed(3);
        e.dataset.ly = ((ev.clientY - r.top) / r.height - 0.5).toFixed(3);
      });
      e.addEventListener("pointerdown", () => {
        e.dataset.appui = "1";
      });
      ["pointerup", "pointercancel"].forEach((ev) =>
        e.addEventListener(ev, () => {
          delete e.dataset.appui;
        }),
      );

      // Le clic agrandit la dalle, et une seule à la fois.
      const basculer = () => {
        const etait = e.dataset.ouvert === "1";
        els.forEach((x) => delete x.dataset.ouvert);
        if (!etait) e.dataset.ouvert = "1";
      };
      e.addEventListener("click", basculer);
      e.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          basculer();
        }
      });
    });

    // Un clic à côté referme : sans ça la dalle reste agrandie et masque le
    // titre tant qu'on ne la retrouve pas.
    const refermer = (ev: PointerEvent) => {
      if (!(ev.target as HTMLElement)?.closest(".carte")) els.forEach((x) => delete x.dataset.ouvert);
    };
    addEventListener("pointerdown", refermer, true);

    let precedent: number | null = null;
    let boucle = 0;
    let vivant = true;

    function pas(ms: number) {
      if (!vivant) return;
      if (precedent === null) precedent = ms;
      const dt = Math.min(0.05, (ms - precedent) / 1000);
      precedent = ms;

      poussee *= 0.9;
      posX += (viseX + poussee * 0.05 - posX) * 0.05; // la parallaxe suit mollement
      posY += (viseY - posY) * 0.05;

      for (let i = 0; i < N; i++) {
        const e = els[i];
        const st = etats[i];
        st.age += dt;

        const ouvert = e.dataset.ouvert === "1";
        if (ouvert) st.age = Math.min(st.age, st.vie - st.efface - 0.5);
        if (st.age > st.vie) {
          st.age = 0;
          st.vu = 0;
          st.place = placeLibre(st);
          neuf(st);
        }
        const pl = PLACES[st.place];

        // Opacité : apparition, plateau, effacement.
        let vie = 1;
        if (st.age < 0) vie = 0;
        else if (st.age < st.parait) vie = st.age / st.parait;
        else if (st.age > st.vie - st.efface) vie = (st.vie - st.age) / st.efface;
        vie = Math.max(0, Math.min(1, vie));
        st.vu = vie; // lu par placeLibre pour l'occupation

        const survol = e.dataset.survol === "1";
        const appui = e.dataset.appui === "1";
        const lx = parseFloat(e.dataset.lx || "0");
        const ly = parseFloat(e.dataset.ly || "0");

        // Dérive : très lente, vers le haut — deux pixels en une demi-seconde
        // sur leur site. C'est une respiration, pas un déplacement.
        const monte = -(st.age / st.vie) * st.monte;
        // Parallaxe par couche : les dalles proches bougent plus que les
        // lointaines, c'est ce qui donne le volume au champ.
        const par = 0.6 + pl.z * 2.4;
        const x = pl.x + posX * par;
        const y = pl.y + monte + posY * par * 0.7;

        const ry = survol ? -lx * 18 : -posX * (3 + pl.z * 5);
        const rx = survol ? ly * 14 : posY * (2 + pl.z * 3);

        let s = 0.7 + pl.z * 0.34;
        if (survol) s *= 1.55; // le survol agrandit franchement
        if (ouvert) s *= 1.95; // le clic ouvre la dalle, sans y conduire
        if (appui) s *= 1.06;

        e.style.transform =
          `translate(-50%,-50%) translate(${x.toFixed(2)}vw,${y.toFixed(2)}vh)` +
          ` rotateY(${ry.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg) scale(${s.toFixed(3)})`;
        e.style.filter = survol || ouvert ? "none" : `blur(${((1 - pl.z) * 1.9).toFixed(2)}px)`;
        e.style.opacity = (vie * (survol || ouvert ? 1 : 0.58 + pl.z * 0.4)).toFixed(3);
        e.style.zIndex = String(ouvert ? 40 : survol ? 30 : Math.round(pl.z * 12));
        e.style.pointerEvents = vie > 0.45 ? "auto" : "none";
      }
      boucle = requestAnimationFrame(pas);
    }
    boucle = requestAnimationFrame(pas);

    return () => {
      vivant = false;
      cancelAnimationFrame(boucle);
      removeEventListener("pointermove", surPointeur);
      removeEventListener("touchmove", surTouche);
      removeEventListener("pointerdown", refermer, true);
      el.innerHTML = "";
    };
  }, [apercus]);

  return <div className="cartes" id="cartes" ref={scene} aria-hidden="true" />;
}
