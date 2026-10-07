import { cn } from "@/lib/utils";

/**
 * LE HALO — la fumée d'encre derrière l'accroche.
 *
 * D'OÙ IL VIENT. L'aurore WebGL retirée le 6 octobre 2026 produisait, sur le thème papier, une
 * grande tache sombre en travers du haut de page. C'était un accident : son nuanceur additionnait
 * les couleurs du thème sur un fond opaque noir, et en thème clair la couleur principale est
 * l'encre. Mehdi a aimé ce rendu. On le refait donc volontairement — mais en le tenant.
 *
 * CE QUI CHANGE PAR RAPPORT À L'ACCIDENT.
 *   1. L'intensité est plafonnée. Dans la version accidentelle le papier descendait aux alentours
 *      du gris moyen, et le paragraphe d'accroche passait sous le seuil de lisibilité. Ici le fond
 *      ne quitte jamais la famille du papier, et le contraste du texte est vérifié.
 *   2. Le cœur du halo est décalé vers la droite, là où il n'y a que du très gros caractère et de
 *      l'image. La colonne de lecture, à gauche, reste sur le papier clair.
 *   3. Zéro WebGL, zéro canevas : deux dégradés radiaux et une dérive très lente. Rien à compiler,
 *      rien qui tombe en panne, et le fond reste correct même sans JavaScript.
 *   4. Il suit le thème : fumée d'encre sur papier, lueur de papier sur le bleu de plan.
 *
 * Le mouvement s'arrête net si le visiteur demande moins d'animation.
 */
export function Halo({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <span className="halo halo--a" />
      <span className="halo halo--b" />
    </div>
  );
}
