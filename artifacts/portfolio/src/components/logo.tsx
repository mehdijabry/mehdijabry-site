import { cn } from "@/lib/utils";

/**
 * La signature du studio.
 *
 * Le monogramme est redessiné en JSX plutôt que chargé en <img> : il doit suivre le thème au
 * pixel près, et sa poignée dorée doit pouvoir s'animer au survol. Deux fichiers SVG figés
 * (logo-light / logo-dark) ne permettaient ni l'un ni l'autre, et le texte de logo-full.svg
 * était écrit en #11110F — donc invisible sur fond sombre — et en anglais.
 *
 * LE DESSIN. Un M tracé d'un seul trait brisé, et un J replié en crochet. Le petit carré plein
 * est le point du J : c'est la seule pièce dorée, et c'est volontaire — dans ce système le doré
 * ne marque que le vivant, et le point du J est le curseur qui clignote au bout de la ligne.
 */

interface LogoProps {
  className?: string;
  /** Avec le nom écrit à côté du monogramme. Sans, le monogramme seul (barre de navigation serrée, favicon). */
  avecNom?: boolean;
  alt?: string;
}

export function Logo({
  className,
  avecNom = true,
  alt = "Mehdi Jabry — studio web indépendant",
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3 select-none", className)} aria-label={alt} role="img">
      <Monogramme className="h-full w-auto shrink-0" />
      {avecNom && (
        <span className="hidden sm:flex flex-col leading-none">
          <span
            className="font-display text-[15px] font-bold tracking-[-0.03em] text-foreground"
            style={{ fontVariationSettings: "'opsz' 16, 'wdth' 96" }}
          >
            Mehdi Jabry
          </span>
          <span className="mt-[5px] font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted-foreground">
            Studio web · Trois-Rivières
          </span>
        </span>
      )}
    </span>
  );
}

/** Le monogramme seul. `currentColor` pour le M, le doré du thème pour le crochet du J. */
export function Monogramme({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn("block", className)} fill="none" aria-hidden="true">
      {/* La plaque : encre sur papier, papier sur encre. Le rayon est celui du logo d'origine
          (32 sur 160, soit un cinquième du côté — ici 24 sur 120). Il avait été carré pour coller
          au `--radius: 0` du reste du site : c'était une erreur. Le système s'aligne sur la marque,
          jamais l'inverse. */}
      <rect width="120" height="120" rx="24" className="fill-foreground" />
      {/* le M, d'un seul trait brisé */}
      <path
        d="M26 84V40l18 19 17-19v44"
        className="stroke-background"
        strokeWidth="9"
        strokeLinecap="square"
        strokeLinejoin="bevel"
      />
      {/* le J, replié en crochet */}
      <path
        d="M70 40h25v29c0 9.4-7.6 17-17 17H70"
        stroke="hsl(var(--vif))"
        strokeWidth="9"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      {/* le point du J : le curseur au bout de la ligne */}
      <rect x="74" y="64" width="9" height="9" className="fill-background" />
    </svg>
  );
}
