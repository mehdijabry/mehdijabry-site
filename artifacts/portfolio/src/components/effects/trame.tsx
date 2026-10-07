import { useEffect, useState } from "react";

/**
 * LA TRAME — le fond de page.
 *
 * Elle remplace l'aurore WebGL (un maillage de dégradés organiques) retirée le 6 octobre 2026,
 * pour deux raisons. La première est de fond : une nappe de couleur floue est exactement le
 * contraire de ce que ce studio vend. Ici on construit des choses droites, mesurées, alignées —
 * le fond doit dire ça, pas l'inverse. La seconde est factuelle : le nuanceur additionnait les
 * couleurs du thème sur un fond opaque noir, donc sur le thème papier il peignait une tache
 * sombre en travers de la page.
 *
 * Ce qui la remplace est la grille du site, rendue visible : douze colonnes et une respiration
 * horizontale. Zéro JavaScript d'animation, zéro GPU, lisible dans les deux thèmes. Les colonnes
 * disparaissent sous 768 px, où la page n'en a plus douze.
 *
 * Le seul mouvement est au premier chargement : les lignes verticales se tirent du haut vers le
 * bas, une fois, en moins d'une seconde. La page se construit sous les yeux du visiteur, puis
 * plus rien ne bouge.
 */
export function Trame() {
  const [tiree, setTiree] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTiree(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setTiree(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Les douze colonnes. Le conteneur reprend la largeur du contenu pour que les filets
          tombent exactement sur les gouttières, et non à côté. */}
      <div className="container mx-auto h-full px-4 hidden md:block">
        <div className="grid h-full grid-cols-12">
          {Array.from({ length: 13 }).map((_, i) => (
            <span
              key={i}
              className="col-span-1 block h-full border-l border-border/45 origin-top transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] last:col-span-0 last:border-r"
              style={{
                transform: tiree ? "scaleY(1)" : "scaleY(0)",
                transitionDelay: `${i * 34}ms`,
                gridColumn: i === 12 ? "12 / 13" : undefined,
                justifySelf: i === 12 ? "end" : undefined,
                width: i === 12 ? 0 : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Deux teintes très douces, posées aux angles : elles donnent de la profondeur au papier
          sans jamais devenir une nappe de couleur. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 38% at 88% 4%, hsl(var(--vif) / 0.07), transparent 70%), radial-gradient(36% 32% at 4% 96%, hsl(var(--foreground) / 0.035), transparent 72%)",
        }}
      />
    </div>
  );
}
