import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, PauseCircle, PlayCircle, KeyRound } from "lucide-react";
import { AdminShell, ErrorNote, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, shortDate, type Maquette, type ProspectStatus } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

/**
 * Maquettes (2026-10-06) — toutes les propositions de site construites jusqu'ici, telles que le proxy
 * mehdijabry.dev/maquette-v1/<slug> les connaît, et l'interrupteur pour en retirer une.
 *
 * Suspendre ne détruit rien : le projet Cloudflare Pages reste déployé et le KV garde le contenu. Seul
 * le lien envoyé au prospect cesse de servir le site — il affiche une page « maquette retirée » (410),
 * y compris aux robots d'aperçu de lien. Remettre en ligne est immédiat. Le cas d'usage : un commerce
 * qui ferme, un refus net, un dossier classé, ou une maquette qu'on ne veut plus voir circuler.
 */

const PROSPECT_CLASS: Record<ProspectStatus, string> = {
  nouveau: "bg-muted text-muted-foreground",
  maquette: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "contacté": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  relance: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "négociation": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "gagné": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  perdu: "bg-destructive/10 text-destructive",
};
type Filter = "toutes" | "en ligne" | "suspendues";

export default function AdminMaquettes() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const list = useQuery({ queryKey: ["admin", "maquettes"], queryFn: api.maquettes });
  const [filter, setFilter] = useState<Filter>("toutes");

  const setState = useMutation({
    mutationFn: ({ slug, suspended, reason }: { slug: string; suspended: boolean; reason?: string | null }) => api.setMaquetteState(slug, { suspended, reason }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["admin", "maquettes"] });
      toast({ title: r.suspended ? "Maquette suspendue" : "Maquette remise en ligne", description: r.suspended ? "Le lien envoyé au prospect affiche maintenant « maquette retirée »." : "Le lien sert de nouveau le site." });
    },
    onError: (e) => toast({ title: "Changement impossible", description: String((e as Error).message), variant: "destructive" }),
  });

  function suspend(m: Maquette) {
    const reason = prompt(`Suspendre ${m.title} ?\n\nLe lien mehdijabry.dev/maquette-v1/${m.slug} affichera « maquette retirée ». Rien n'est supprimé.\n\nRaison (facultatif, pour vous) :`, "");
    if (reason === null) return;
    setState.mutate({ slug: m.slug, suspended: true, reason });
  }
  function resume(m: Maquette) {
    if (confirm(`Remettre ${m.title} en ligne ?`)) setState.mutate({ slug: m.slug, suspended: false });
  }

  const all = list.data ?? [];
  const rows = all.filter((m) => filter === "toutes" || (filter === "suspendues") === m.suspended);
  const nSusp = all.filter((m) => m.suspended).length;

  return (
    <AdminShell title="Maquettes">
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        {(["toutes", "en ligne", "suspendues"] as const).map((v) => (
          <button key={v} onClick={() => setFilter(v)} className={cn("rounded-full px-3 py-1 border capitalize", filter === v ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground")}>{v}</button>
        ))}
        <span className="ml-auto text-muted-foreground">{all.length ? `${all.length} maquettes · ${all.length - nSusp} en ligne · ${nSusp} suspendue${nSusp > 1 ? "s" : ""}` : ""}</span>
      </div>

      {list.isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : list.isError ? <ErrorNote error={list.error} onRetry={() => list.refetch()} /> : rows.length === 0 ? (
        <Panel><p className="text-sm text-muted-foreground">Aucune maquette {filter === "toutes" ? "" : filter}.</p></Panel>
      ) : (
        <div className="grid gap-3">
          {rows.map((m) => (
            <Panel key={m.slug} className={cn(m.suspended && "border-destructive/40 bg-destructive/[0.03]")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl">{m.title}</h3>
                    {m.suspended
                      ? <span className="rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-medium">Suspendue{m.suspendedAt ? ` depuis le ${shortDate(m.suspendedAt)}` : ""}</span>
                      : <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-medium">En ligne</span>}
                    {m.prospect && (
                      <Link href="/admin/prospects" className="inline-flex items-center gap-1.5 text-xs hover:underline">
                        <span className="text-muted-foreground">{m.prospect.name}</span>
                        <span className={cn("rounded-full px-2 py-0.5 font-medium", PROSPECT_CLASS[m.prospect.status] ?? "bg-muted")}>{m.prospect.status}</span>
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <span className="font-mono text-xs">{m.proxyUrl.replace(/^https?:\/\//, "")}</span>
                    {" · "}{m.visits} visite{m.visits > 1 ? "s" : ""} et {m.visitors} visiteur{m.visitors > 1 ? "s" : ""} en 30 jours
                    {m.lastVisitAt ? ` · dernière le ${shortDate(m.lastVisitAt)}` : ""}
                  </p>
                  {m.suspended && m.reason && <p className="text-sm mt-1"><span className="text-muted-foreground">Raison :</span> {m.reason}</p>}
                  {!m.prospect && <p className="text-xs text-muted-foreground mt-1">Aucune fiche prospect ne pointe vers cette maquette — renseignez le champ « Maquette (lien) » du prospect pour relier les visites.</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={m.proxyUrl} target="_blank" rel="noopener"><Button size="sm" variant="outline"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Voir</Button></a>
                  <a href={m.adminProxyUrl} target="_blank" rel="noopener"><Button size="sm" variant="outline"><KeyRound className="w-3.5 h-3.5 mr-1.5" />Espace démo</Button></a>
                  {m.suspended
                    ? <Button size="sm" onClick={() => resume(m)} disabled={setState.isPending}><PlayCircle className="w-3.5 h-3.5 mr-1.5" />Remettre en ligne</Button>
                    : <Button size="sm" variant="ghost" className="text-destructive" onClick={() => suspend(m)} disabled={setState.isPending}><PauseCircle className="w-3.5 h-3.5 mr-1.5" />Suspendre</Button>}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-4">Suspendre ne supprime rien : le projet Cloudflare Pages et son contenu restent en place, et l'adresse directe <span className="font-mono">*.pages.dev</span> continue de répondre. Seul le lien mehdijabry.dev — celui que reçoivent les prospects — affiche « maquette retirée ».</p>
    </AdminShell>
  );
}
