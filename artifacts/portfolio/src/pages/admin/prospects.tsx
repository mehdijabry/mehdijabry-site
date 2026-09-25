import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { AdminShell, ErrorNote, Field, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, shortDate, PROSPECT_STATUSES, type Prospect, type ProspectInput, type ProspectStatus } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const EMPTY: ProspectInput = {
  name: "", city: "Trois-Rivières", contactName: "", email: "", phone: "", googleMapsUrl: "", websiteUrl: "", brokenDomain: "", ownDomain: "",
  googleRating: "", googleReviews: "", mockUrl: "", adminUrl: "", adminDemoPassword: "", hasReservations: false, status: "nouveau", price: 600, notes: "", nextAction: "", nextActionAt: "",
};
const STATUS_CLASS: Record<ProspectStatus, string> = {
  nouveau: "bg-muted text-muted-foreground",
  maquette: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "contacté": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  relance: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "négociation": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "gagné": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  perdu: "bg-destructive/10 text-destructive",
};
const toInput = (p: Prospect): ProspectInput => ({
  name: p.name, city: p.city ?? "", contactName: p.contactName ?? "", email: p.email ?? "", phone: p.phone ?? "", googleMapsUrl: p.googleMapsUrl ?? "", websiteUrl: p.websiteUrl ?? "",
  brokenDomain: p.brokenDomain ?? "", ownDomain: p.ownDomain ?? "", googleRating: p.googleRating ?? "", googleReviews: p.googleReviews ?? "", mockUrl: p.mockUrl ?? "", adminUrl: p.adminUrl ?? "",
  adminDemoPassword: p.adminDemoPassword ?? "", hasReservations: p.hasReservations, status: p.status, price: p.price ?? "", notes: p.notes ?? "", nextAction: p.nextAction ?? "", nextActionAt: p.nextActionAt ?? "",
});
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminProspects() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const list = useQuery({ queryKey: ["admin", "prospects"], queryFn: api.prospects });
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [form, setForm] = useState<ProspectInput>(EMPTY);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"actifs" | "tous">("actifs");

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin", "prospects"] }); qc.invalidateQueries({ queryKey: ["admin", "clients"] }); };
  const save = useMutation({
    mutationFn: () => (editing ? api.updateProspect(editing.id, form) : api.createProspect(form)),
    onSuccess: () => { invalidate(); setOpen(false); toast({ title: editing ? "Prospect mis à jour" : "Prospect ajouté" }); },
    onError: (e) => toast({ title: "Enregistrement impossible", description: String((e as Error).message), variant: "destructive" }),
  });
  const convert = useMutation({
    mutationFn: (id: number) => api.convertProspect(id),
    onSuccess: (p) => { invalidate(); toast({ title: `${p.name} est maintenant un client`, description: "Fiche créée dans Clients — complétez l'adresse avant la première facture." }); },
    onError: (e) => toast({ title: "Conversion impossible", description: String((e as Error).message), variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.deleteProspect(id),
    onSuccess: () => { invalidate(); toast({ title: "Prospect supprimé" }); },
  });
  const setStatus = useMutation({
    mutationFn: ({ p, status }: { p: Prospect; status: ProspectStatus }) => api.updateProspect(p.id, { ...toInput(p), status }),
    onSuccess: () => invalidate(),
  });

  function startNew() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function startEdit(p: Prospect) { setEditing(p); setForm(toInput(p)); setOpen(true); }
  const f = (k: keyof ProspectInput) => ({ value: String(form[k] ?? ""), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value }) });

  const rows = (list.data ?? []).filter((p) => filter === "tous" || (p.status !== "gagné" && p.status !== "perdu"));
  const counts = (list.data ?? []).reduce<Record<string, number>>((a, p) => { a[p.status] = (a[p.status] ?? 0) + 1; return a; }, {});

  return (
    <AdminShell title="Prospects" actions={<Button onClick={startNew}>Nouveau prospect</Button>}>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        {(["actifs", "tous"] as const).map((v) => (
          <button key={v} onClick={() => setFilter(v)} className={cn("rounded-full px-3 py-1 border", filter === v ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground")}>{v === "actifs" ? "En cours" : "Tous"}</button>
        ))}
        <span className="ml-auto text-muted-foreground">{PROSPECT_STATUSES.filter((s) => counts[s]).map((s) => `${counts[s]} ${s}`).join(" · ") || "Aucun prospect"}</span>
      </div>

      {open && (
        <Panel title={editing ? `Modifier — ${editing.name}` : "Nouveau prospect"} className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Entreprise *"><Input {...f("name")} placeholder="Le Bette" /></Field>
            <Field label="Ville"><Input {...f("city")} /></Field>
            <Field label="Statut">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProspectStatus })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {PROSPECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Contact (prénom / nom)"><Input {...f("contactName")} placeholder="Jo-Annie et Hubert" /></Field>
            <Field label="Courriel" hint="Relie les courriels envoyés à ce prospect"><Input type="email" {...f("email")} /></Field>
            <Field label="Téléphone"><Input {...f("phone")} /></Field>
            <Field label="Fiche Google Maps"><Input {...f("googleMapsUrl")} placeholder="https://maps.app.goo.gl/…" /></Field>
            <Field label="Site actuel"><Input {...f("websiteUrl")} placeholder="https://…" /></Field>
            <Field label="Note Google / avis"><div className="flex gap-2"><Input {...f("googleRating")} placeholder="4,8" /><Input type="number" {...f("googleReviews")} placeholder="425" /></div></Field>
            <Field label="Domaine mort sur la fiche"><Input {...f("brokenDomain")} placeholder="seaudecrabe.com" /></Field>
            <Field label="Domaine qu'ils possèdent"><Input {...f("ownDomain")} placeholder="lebette.com" /></Field>
            <Field label="Prix proposé ($)"><Input type="number" {...f("price")} /></Field>
            <Field label="Maquette (lien)" hint="Relie les visites de la maquette"><Input {...f("mockUrl")} placeholder="https://xxx-demo.pages.dev" /></Field>
            <Field label="Admin de démonstration (lien)"><Input {...f("adminUrl")} placeholder="https://xxx-demo.pages.dev/admin/" /></Field>
            <Field label="Mot de passe démo"><Input {...f("adminDemoPassword")} /></Field>
            <Field label="Prochaine action"><Input {...f("nextAction")} placeholder="Appeler le gérant" /></Field>
            <Field label="Date de la prochaine action"><Input type="date" {...f("nextActionAt")} /></Field>
            <div className="pt-6 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={form.hasReservations} onChange={(e) => setForm({ ...form, hasReservations: e.target.checked })} /> Réservation en ligne construite</label></div>
            <Field label="Notes" className="sm:col-span-2 lg:col-span-3"><Textarea rows={3} {...f("notes")} /></Field>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name.trim()}>{save.isPending ? "Enregistrement…" : "Enregistrer"}</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </Panel>
      )}

      {list.isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : list.isError ? <ErrorNote error={list.error} onRetry={() => list.refetch()} /> : rows.length === 0 ? (
        <Panel><p className="text-sm text-muted-foreground">Aucun prospect {filter === "actifs" ? "en cours" : ""}. Ajoutez le commerce dès que vous commencez une maquette : tout ce qui est fait pour lui s'affichera ici.</p></Panel>
      ) : (
        <div className="grid gap-4">
          {rows.map((p) => {
            const a = p.activity, late = p.nextActionAt && p.nextActionAt <= today() && p.status !== "gagné" && p.status !== "perdu";
            return (
              <Panel key={p.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl">{p.name}</h3>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLASS[p.status])}>{p.status}</span>
                      {p.clientId && <Link href="/admin/clients" className="text-xs text-primary hover:underline">client #{p.clientId}</Link>}
                    </div>
                    <p className="text-sm text-muted-foreground">{[p.city, p.contactName, p.email, p.phone].filter(Boolean).join(" · ")}{p.price != null ? ` · ${p.price} $` : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.email && p.mockUrl && <Link href={`/admin/courriels?prospect=${p.id}`}><Button size="sm" variant="outline">Envoyer la proposition</Button></Link>}
                    {p.status !== "gagné" && <Button size="sm" onClick={() => { if (confirm(`Passer ${p.name} en client ?`)) convert.mutate(p.id); }}>Passer en client</Button>}
                    <Button size="sm" variant="ghost" onClick={() => startEdit(p)}>Modifier</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Supprimer ${p.name} ?`)) remove.mutate(p.id); }}>Supprimer</Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Ce qui a été fait</p>
                    <ul className="space-y-1.5">
                      <li className={p.mockUrl ? "" : "text-muted-foreground"}>{p.mockUrl ? "✓" : "○"} Maquette {p.mockUrl && <a href={p.mockUrl} target="_blank" rel="noopener" className="text-primary hover:underline inline-flex items-center gap-1">ouvrir <ExternalLink className="w-3 h-3" /></a>}</li>
                      <li className={p.adminUrl ? "" : "text-muted-foreground"}>{p.adminUrl ? "✓" : "○"} Admin de démonstration {p.adminUrl && <a href={p.adminUrl} target="_blank" rel="noopener" className="text-primary hover:underline inline-flex items-center gap-1">ouvrir <ExternalLink className="w-3 h-3" /></a>}{p.adminDemoPassword && <span className="text-muted-foreground"> · mot de passe {p.adminDemoPassword}</span>}</li>
                      <li className={p.hasReservations ? "" : "text-muted-foreground"}>{p.hasReservations ? "✓" : "○"} Réservation en ligne</li>
                      <li className={a.emails ? "" : "text-muted-foreground"}>{a.emails ? "✓" : "○"} Proposition envoyée{a.emails ? ` ×${a.emails} · dernière ${shortDate(a.lastEmailAt!)}` : ""}{a.lastEmailId && <> · <a href={`/api/admin/emails/${a.lastEmailId}/html`} target="_blank" rel="noopener" className="text-primary hover:underline">voir</a></>}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Ce qu'ils ont fait</p>
                    <ul className="space-y-1.5">
                      <li>{a.opens ? `Courriel ouvert ×${a.opens}` : a.emails ? "Courriel pas encore ouvert" : "—"}</li>
                      <li>{a.clicks ? `Lien cliqué ×${a.clicks}` : a.emails ? "Pas encore cliqué" : "—"}</li>
                      <li>{a.visits ? `Maquette visitée ×${a.visits} (${a.visitors} visiteur${a.visitors > 1 ? "s" : ""}, 30 j) · dernière ${shortDate(a.lastVisitAt!)}` : p.mockUrl ? "Aucune visite de la maquette (30 j)" : "—"}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Suite</p>
                    <p className={cn(late && "text-destructive font-medium")}>{p.nextAction || "—"}{p.nextActionAt ? ` · ${shortDate(p.nextActionAt)}${late ? " (à faire)" : ""}` : ""}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {PROSPECT_STATUSES.filter((s) => s !== p.status).map((s) => <button key={s} onClick={() => setStatus.mutate({ p, status: s })} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground">{s}</button>)}
                    </div>
                    {p.notes && <p className="mt-2 text-muted-foreground whitespace-pre-line">{p.notes}</p>}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
