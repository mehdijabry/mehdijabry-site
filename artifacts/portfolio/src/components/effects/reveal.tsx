import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Reveal — le bloc se pose quand il entre dans l'écran.
 *
 * RÉÉCRIT LE 6 OCTOBRE 2026, ET LE PRINCIPE A CHANGÉ.
 *
 * L'ancienne version partait de `opacity: 0` et attendait l'observateur d'intersection pour se
 * montrer. Autrement dit, le contenu était CACHÉ PAR DÉFAUT et l'animation avait le pouvoir de le
 * retenir. Quand l'observateur ne se déclenchait pas — document non composé, onglet en arrière-plan,
 * minuteurs ralentis, page si haute que tout est déjà dans l'écran au montage — la section restait
 * un trou blanc pour toujours. La section « Démarrer un projet » a disparu comme ça, entre la foire
 * aux questions et le pied de page.
 *
 * Le principe est inversé : **le contenu est visible par défaut**. L'état caché n'est posé que par
 * un effet, donc après que React a prouvé qu'il tourne, et uniquement si le visiteur accepte
 * l'animation. À partir de là, trois sorties mènent à l'état visible : l'observateur, un délai de
 * sûreté, et le retour de l'onglet au premier plan. Le pire incident possible devient « le bloc
 * n'a pas glissé », au lieu de « le bloc n'existe pas ».
 *
 * La règle qui en sort, et qui vaut pour tout le site : une animation peut échouer, jamais au point
 * de retenir du contenu.
 */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/** Au-delà de ce délai, le bloc se montre, observateur ou pas. */
const DELAI_DE_SURETE = 900;

function useApparition(delay: number) {
  const ref = useRef<HTMLDivElement>(null);
  // Visible par défaut : c'est tout le point. On ne cache qu'une fois certain de pouvoir remontrer.
  const [etat, setEtat] = useState<"nu" | "cache" | "pose">("nu");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Un document non visible n'a rien à animer : on le laisse tel quel, c'est-à-dire lisible.
    if (document.visibilityState !== "visible") return;

    setEtat("cache");
    const montrer = () => setEtat("pose");

    const obs = new IntersectionObserver(
      (entrees) => entrees.forEach((e) => e.isIntersecting && montrer()),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    obs.observe(el);

    const minuteur = window.setTimeout(montrer, DELAI_DE_SURETE + delay * 1000);
    // Si l'onglet revient au premier plan, les minuteurs étaient peut-être ralentis : on montre.
    const auRetour = () => document.visibilityState === "visible" && montrer();
    document.addEventListener("visibilitychange", auRetour);

    return () => {
      obs.disconnect();
      window.clearTimeout(minuteur);
      document.removeEventListener("visibilitychange", auRetour);
    };
  }, [delay]);

  return { ref, etat };
}

export function Reveal({ children, delay = 0, y = 28, className, once = true }: RevealProps) {
  void once; // conservé pour la compatibilité des appels existants
  const { ref, etat } = useApparition(delay);

  return (
    <div
      ref={ref}
      className={className}
      style={
        etat === "nu"
          ? undefined
          : {
              opacity: etat === "pose" ? 1 : 0,
              transform: etat === "pose" ? "none" : `translateY(${y}px)`,
              transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
              willChange: etat === "pose" ? undefined : "opacity, transform",
            }
      }
    >
      {children}
    </div>
  );
}

interface RevealWordsProps {
  text: string;
  delay?: number;
  className?: string;
  wordClassName?: string;
}

/** Même garantie, mot à mot : le texte est toujours dans le document et toujours lisible. */
export function RevealWords({ text, delay = 0, className, wordClassName }: RevealWordsProps) {
  const { ref, etat } = useApparition(delay);
  const mots = text.split(" ");

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {mots.map((mot, i) => (
        <span
          key={`${mot}-${i}`}
          className={`inline-block ${wordClassName ?? ""}`}
          style={
            etat === "nu"
              ? undefined
              : {
                  opacity: etat === "pose" ? 1 : 0,
                  transform: etat === "pose" ? "none" : "translateY(0.5em)",
                  transition: `opacity .55s cubic-bezier(.22,1,.36,1) ${delay + i * 0.035}s, transform .55s cubic-bezier(.22,1,.36,1) ${delay + i * 0.035}s`,
                }
          }
        >
          {mot}
          {i < mots.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
