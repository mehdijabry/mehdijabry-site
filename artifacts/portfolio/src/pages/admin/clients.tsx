import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell, Field, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, type Client, type ClientInput } from "@/lib/admin-api";

const EMPTY: ClientInput = { name: "", contactName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", province: "QC", postalCode: "", country: "Canada", notes: "" };

export default function AdminClients() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const list = useQuery({ queryKey: ["admin", "clients"], queryFn: api.clients });
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientInput>(EMPTY);
  const [open, setOpen] = useState(false);

  function startNew() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function startEdit(c: Client) { setEditing(c); setForm({ name: c.name, contactName: c.contactName ?? "", email: c.email ?? "", phone: c.phone ?? "", addressLine1: c.addressLine1 ?? "", addressLine2: c.addressLine2 ?? "", city: c.city ?? "", province: c.province ?? "", postalCode: c.postalCode ?? "", country: c.country ?? "", notes: c.notes ?? "" }); setOpen(true); }

  const save = useMutation({
    mutationFn: () => (editing ? api.updateClient(editing.id, form) : api.createClient(form)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "clients"] }); setOpen(false); toast({ title: editing ? "Client mis à jour" : "Client ajouté" }); },
    onError: (e) => toast({ title: "Enregistrement impossible", description: String((e as Error).message), variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.deleteClient(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "clients"] }); toast({ title: "Client supprimé" }); },
  });

  const f = (k: keyof ClientInput) => ({ value: (form[k] ?? "") as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <AdminShell title="Clients" actions={<Button onClick={startNew}>Nouveau client</Button>}>
      {open && (
        <Panel title={editing ? `Modifier ${editing.name}` : "Nouveau client"} className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom de l'entreprise ou du client *" className="sm:col-span-2"><Input {...f("name")} placeholder="Seau de Crabe (Trois-Rivières)" /></Field>
            <Field label="Personne-ressource"><Input {...f("contactName")} /></Field>
            <Field label="Courriel"><Input type="email" {...f("email")} /></Field>
            <Field label="Téléphone"><Input {...f("phone")} /></Field>
            <Field label="Adresse"><Input {...f("addressLine1")} placeholder="2325, boulevard des Récollets" /></Field>
            <Field label="Complément d'adresse"><Input {...f("addressLine2")} placeholder="Bureau, appartement…" /></Field>
            <Field label="Ville"><Input {...f("city")} /></Field>
            <Field label="Province"><Input {...f("province")} /></Field>
            <Field label="Code postal"><Input {...f("postalCode")} /></Field>
            <Field label="Pays"><Input {...f("country")} /></Field>
            <Field label="Notes internes" className="sm:col-span-2"><Textarea rows={2} {...f("notes")} /></Field>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name.trim()}>{save.isPending ? "Enregistrement…" : "Enregistrer"}</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </Panel>
      )}
      <Panel className="p-0 overflow-hidden">
        {list.isLoading ? <p className="p-5 text-sm text-muted-foreground">Chargement…</p> : (list.data ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucun client pour l'instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border"><tr><th className="text-left p-3">Client</th><th className="text-left p-3">Contact</th><th className="text-left p-3">Ville</th><th className="p-3"></th></tr></thead>
              <tbody>
                {(list.data ?? []).map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.contactName}{c.email ? <span className="text-muted-foreground"> · {c.email}</span> : ""}</td>
                    <td className="p-3">{[c.city, c.province].filter(Boolean).join(", ")}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button className="text-primary hover:underline mr-3" onClick={() => startEdit(c)}>Modifier</button>
                      <button className="text-destructive hover:underline" onClick={() => { if (confirm(`Supprimer ${c.name} ? Les factures déjà émises gardent son adresse.`)) remove.mutate(c.id); }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}
