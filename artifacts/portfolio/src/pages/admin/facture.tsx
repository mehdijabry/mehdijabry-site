import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus } from "lucide-react";
import { AdminShell, Field, Panel } from "@/components/admin/shell";
import { StatusPill } from "@/pages/admin/factures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, AdminApiError, computeTotals, money, shortDate, todayIso, addDaysIso, type InvoiceItem, type InvoiceInput, type TaxMode } from "@/lib/admin-api";

type Draft = { clientId: number | null; issueDate: string; dueDate: string; items: InvoiceItem[]; taxMode: TaxMode; paymentTerms: string; notes: string };

export default function AdminInvoiceEditor() {
  const [, params] = useRoute("/admin/factures/:id");
  const isNew = !params || params.id === "nouvelle";
  const id = isNew ? null : Number(params.id);
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: api.settings });
  const clients = useQuery({ queryKey: ["admin", "clients"], queryFn: api.clients });
  const invoice = useQuery({ queryKey: ["admin", "invoice", id], queryFn: () => api.invoice(id!), enabled: id !== null });

  const [draft, setDraft] = useState<Draft | null>(null);
  const [sendTo, setSendTo] = useState("");
  const [sendMsg, setSendMsg] = useState("");
  const [showSend, setShowSend] = useState(false);

  // Seed the draft: from the invoice when editing, from the settings when creating.
  useEffect(() => {
    if (draft) return;
    if (isNew && settings.data) {
      const issueDate = todayIso();
      setDraft({ clientId: null, issueDate, dueDate: addDaysIso(issueDate, settings.data.defaultDueDays), items: [{ description: "Conception et réalisation d'un site web vitrine", quantity: 1, unitPrice: 0 }], taxMode: settings.data.taxMode, paymentTerms: settings.data.paymentTerms, notes: "" });
    } else if (!isNew && invoice.data) {
      const i = invoice.data;
      setDraft({ clientId: i.clientId, issueDate: i.issueDate, dueDate: i.dueDate, items: i.items, taxMode: i.taxMode, paymentTerms: i.paymentTerms ?? "", notes: i.notes ?? "" });
      setSendTo(i.clientSnapshot.email ?? "");
    }
  }, [draft, isNew, settings.data, invoice.data]);

  const totals = useMemo(() => (draft ? computeTotals(draft.items, draft.taxMode) : null), [draft]);
  const locked = invoice.data?.status === "payée";

  const save = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("vide");
      if (!draft.clientId) throw new AdminApiError(400, "Choisissez un client.");
      const body: InvoiceInput = { clientId: draft.clientId, issueDate: draft.issueDate, dueDate: draft.dueDate, items: draft.items.map((it) => ({ ...it, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })), taxMode: draft.taxMode, paymentTerms: draft.paymentTerms || null, notes: draft.notes || null };
      return isNew ? api.createInvoice(body) : api.updateInvoice(id!, body);
    },
    onSuccess: (inv) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast({ title: isNew ? `Facture ${inv.number} créée` : "Facture enregistrée" });
      if (isNew) navigate(`/admin/factures/${inv.id}`);
    },
    onError: (e) => toast({ title: "Enregistrement impossible", description: e instanceof Error ? e.message : String(e), variant: "destructive" }),
  });

  const setStatus = useMutation({
    mutationFn: (status: "brouillon" | "envoyée" | "payée" | "annulée") => api.setInvoiceStatus(id!, status),
    onSuccess: (inv) => { qc.invalidateQueries({ queryKey: ["admin"] }); toast({ title: `Statut : ${inv.status}` }); },
    onError: (e) => toast({ title: "Erreur", description: String((e as Error).message), variant: "destructive" }),
  });

  const send = useMutation({
    mutationFn: () => api.sendInvoice(id!, { to: sendTo, message: sendMsg }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin"] }); setShowSend(false); toast({ title: "Facture envoyée par courriel" }); },
    onError: (e) => toast({ title: "Envoi impossible", description: String((e as Error).message), variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: () => api.deleteInvoice(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin"] }); toast({ title: "Facture supprimée" }); navigate("/admin/factures"); },
    onError: (e) => toast({ title: "Suppression refusée", description: String((e as Error).message), variant: "destructive" }),
  });

  function setItem(i: number, patch: Partial<InvoiceItem>) { setDraft((d) => d && { ...d, items: d.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) }); }

  const title = isNew ? "Nouvelle facture" : invoice.data ? `Facture ${invoice.data.number}` : "Facture";

  return (
    <AdminShell
      title={title}
      actions={invoice.data && <>
        <a href={invoice.data.publicUrl} target="_blank" rel="noopener"><Button variant="outline">Voir / Imprimer (PDF)</Button></a>
        <Button variant="outline" onClick={() => setShowSend((v) => !v)}>Envoyer par courriel</Button>
        {invoice.data.status !== "payée" && <Button onClick={() => setStatus.mutate("payée")}>Marquer payée</Button>}
      </>}
    >
      {!draft ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {invoice.data && (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <StatusPill status={invoice.data.status} />
                {invoice.data.sentAt && <span className="text-muted-foreground">Envoyée le {shortDate(invoice.data.sentAt)}</span>}
                {invoice.data.paidAt && <span className="text-muted-foreground">Payée le {shortDate(invoice.data.paidAt)}</span>}
                {locked && <span className="text-muted-foreground">Une facture payée n'est plus modifiable.</span>}
              </div>
            )}

            {showSend && invoice.data && (
              <Panel title="Envoyer la facture par courriel">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Destinataire" className="sm:col-span-2"><Input type="email" value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="client@exemple.com" /></Field>
                  <Field label="Message (facultatif)" className="sm:col-span-2" hint="Laissez vide pour le message standard. Le lien vers la facture est ajouté automatiquement ; écrivez {lien} pour le placer vous-même.">
                    <Textarea rows={5} value={sendMsg} onChange={(e) => setSendMsg(e.target.value)} />
                  </Field>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => send.mutate()} disabled={send.isPending || !sendTo}>{send.isPending ? "Envoi…" : `Envoyer depuis ${settings.data?.emailFrom ?? "contact@mehdijabry.dev"}`}</Button>
                  <Button variant="ghost" onClick={() => setShowSend(false)}>Annuler</Button>
                </div>
              </Panel>
            )}

            <Panel title="Client et dates">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Client" className="sm:col-span-3">
                  <div className="flex gap-2">
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.clientId ?? ""} disabled={locked} onChange={(e) => setDraft({ ...draft, clientId: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">— Choisir un client —</option>
                      {(clients.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}{c.city ? ` · ${c.city}` : ""}</option>)}
                    </select>
                    <Link href="/admin/clients"><Button type="button" variant="outline">Nouveau</Button></Link>
                  </div>
                </Field>
                <Field label="Date de facturation"><Input type="date" value={draft.issueDate} disabled={locked} onChange={(e) => setDraft({ ...draft, issueDate: e.target.value })} /></Field>
                <Field label="Date d'échéance"><Input type="date" value={draft.dueDate} disabled={locked} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /></Field>
                <Field label="Taxes">
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.taxMode} disabled={locked} onChange={(e) => setDraft({ ...draft, taxMode: e.target.value as TaxMode })}>
                    <option value="none">Aucune — petit fournisseur</option>
                    <option value="registrant">TPS 5 % + TVQ 9,975 %</option>
                  </select>
                </Field>
              </div>
            </Panel>

            <Panel title="Prestations">
              <div className="space-y-3">
                {draft.items.map((it, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_90px_130px_130px_36px] items-start">
                    <Textarea rows={2} placeholder="Description de la prestation" value={it.description} disabled={locked} onChange={(e) => setItem(i, { description: e.target.value })} />
                    <Input type="number" min={0} step="0.25" value={it.quantity} disabled={locked} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} aria-label="Quantité" />
                    <Input type="number" min={0} step="0.01" value={it.unitPrice} disabled={locked} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })} aria-label="Prix unitaire" />
                    <div className="h-9 flex items-center justify-end text-sm tabular-nums font-medium">{money((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0))}</div>
                    <Button type="button" variant="ghost" size="icon" disabled={locked || draft.items.length === 1} onClick={() => setDraft({ ...draft, items: draft.items.filter((_, k) => k !== i) })} aria-label="Retirer"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" disabled={locked} onClick={() => setDraft({ ...draft, items: [...draft.items, { description: "", quantity: 1, unitPrice: 0 }] })}><Plus className="w-4 h-4" /> Ajouter une ligne</Button>
              </div>
            </Panel>

            <Panel title="Conditions et notes">
              <div className="grid gap-3">
                <Field label="Modalités de paiement" hint="Obligatoire sur la facture dès 500 $ ; imprimé sur toutes."><Textarea rows={2} value={draft.paymentTerms} disabled={locked} onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })} /></Field>
                <Field label="Notes (facultatif)"><Textarea rows={2} value={draft.notes} disabled={locked} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Ex. : acompte de 50 % reçu le …" /></Field>
              </div>
            </Panel>
          </div>

          <aside className="space-y-4">
            <Panel title="Totaux">
              <dl className="text-sm space-y-2 tabular-nums">
                <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd>{money(totals?.subtotal ?? 0)}</dd></div>
                {draft.taxMode === "registrant" && <>
                  <div className="flex justify-between"><dt className="text-muted-foreground">TPS (5 %)</dt><dd>{money(totals?.gst ?? 0)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">TVQ (9,975 %)</dt><dd>{money(totals?.qst ?? 0)}</dd></div>
                </>}
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd>{money(totals?.total ?? 0)}</dd></div>
              </dl>
              {draft.taxMode === "none" && <p className="text-xs text-muted-foreground mt-3">La facture portera la mention : fournisseur non inscrit aux fichiers de la TPS et de la TVQ (petit fournisseur), aucune taxe perçue.</p>}
              {draft.taxMode === "registrant" && !settings.data?.gstNumber && <p className="text-xs text-destructive mt-3">Renseignez vos numéros de TPS et de TVQ dans les paramètres avant d'enregistrer.</p>}
              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={() => save.mutate()} disabled={save.isPending || locked}>{save.isPending ? "Enregistrement…" : isNew ? "Créer la facture" : "Enregistrer"}</Button>
                {invoice.data && invoice.data.status !== "payée" && invoice.data.status !== "annulée" && <Button variant="outline" onClick={() => setStatus.mutate("annulée")}>Annuler la facture</Button>}
                {invoice.data && (invoice.data.status === "brouillon" || invoice.data.status === "annulée") && <Button variant="ghost" className="text-destructive" onClick={() => { if (confirm("Supprimer définitivement cette facture ?")) remove.mutate(); }}>Supprimer</Button>}
                <Link href="/admin/factures" className="text-sm text-muted-foreground hover:text-foreground text-center">← Retour à la liste</Link>
              </div>
            </Panel>
            <Panel title="Ce que la facture affiche">
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Vos nom, adresse et coordonnées (paramètres)</li>
                <li>Numéro, date de facturation, date d'échéance</li>
                <li>Nom et adresse du client</li>
                <li>Description de chaque prestation et montants</li>
                <li>Taxes séparées avec vos numéros, ou la mention « petit fournisseur »</li>
                <li>Modalités et instructions de paiement</li>
              </ul>
            </Panel>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
