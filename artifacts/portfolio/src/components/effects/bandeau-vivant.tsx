import { useEffect, useState } from "react";
import { usePortfolioMaquettes } from "@/components/maquettes-gallery";
import { useCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * LE BANDEAU VIVANT — la pièce qui tient toute la direction artistique.
 *
 * Dans ce système, le doré ne décore jamais : il ne marque que ce qui est VRAI À L'INSTANT OÙ LA
 * PAGE EST LUE. Ce bandeau est donc le seul endroit de l'en-tête où il apparaît, et chacune de ses
 * trois données est réellement établie au chargement :
 *
 *   1. le nombre de maquettes publiées — compté sur /api/portfolio/maquettes, la même source que
 *      la galerie plus bas ; si l'API ne répond pas, la donnée disparaît au lieu d'être inventée ;
 *   2. l'heure à Trois-Rivières — horloge réelle, recalée chaque seconde sur America/Toronto ;
 *   3. l'état de l'atelier — déduit de cette même heure, pas d'un texte figé.
 *
 * C'est la raison d'être du site en une ligne : rien d'affiché ici n'est une promesse, tout est
 * vérifiable. Un visiteur qui recharge à 3 h du matin lit « Atelier fermé », et c'est voulu.
 */

const COPY = {
  fr: {
    maquettes: (n: number) => `${n} maquette${n > 1 ? "s" : ""} en ligne`,
    ouvert: "Atelier ouvert",
    ferme: "Atelier fermé",
    titre: "Données relevées au chargement de cette page",
  },
  en: {
    maquettes: (n: number) => `${n} mockup${n > 1 ? "s" : ""} online`,
    ouvert: "Studio open",
    ferme: "Studio closed",
    titre: "Figures read when this page loaded",
  },
};

/** L'atelier est ouvert du lundi au vendredi, 9 h – 18 h, heure de Trois-Rivières. */
function etatAtelier(d: Date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => f.find((p) => p.type === t)?.value ?? "";
  const jour = get("weekday");
  const h = parseInt(get("hour"), 10);
  const m = parseInt(get("minute"), 10);
  const semaine = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(jour);
  return { heure: `${get("hour")}:${get("minute")}`, ouvert: semaine && h >= 9 && (h < 18 || (h === 18 && m === 0)) };
}

export function BandeauVivant({ className }: { className?: string }) {
  const t = useCopy(COPY);
  const q = usePortfolioMaquettes();
  const [now, setNow] = useState(() => etatAtelier(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setNow(etatAtelier(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  const n = q.data?.length ?? 0;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
      title={t.titre}
      data-testid="bandeau-vivant"
    >
      {/* La donnée n'apparaît que si elle a réellement été comptée. */}
      {n > 0 && <span className="vivant">{t.maquettes(n)}</span>}
      <span className="vivant tabular-nums">Trois-Rivières · {now.heure}</span>
      <span className="vivant">{now.ouvert ? t.ouvert : t.ferme}</span>
    </div>
  );
}
