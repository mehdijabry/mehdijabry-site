import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell, ErrorNote, Field, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, type Issuer } from "@/lib/admin-api";

export default function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: api.settings });
  const [form, setForm] = useState<Issuer | null>(null);
  useEffect(() => { if (settings.data && !form) setForm(settings.data); }, [settings.data, form]);

  const save = useMutation({
    mutationFn: () => api.saveSettings(form!),
    onSuccess: (s) => { setForm(s); qc.invalidateQueries({ queryKey: ["admin", "settings"] }); toast({ title: "Paramètres enregistrés" }); },
    onError: (e) => toast({ title: "Enregistrement impossible", description: String((e as Error).message), variant: "destructive" }),
  });

  if (!form) {
    return (
      <AdminShell title="Paramètres">
        {settings.isError ? <ErrorNote error={settings.error} onRetry={() => settings.refetch()} /> : <p className="text-sm text-muted-foreground">Chargement…</p>}
      </AdminShell>
    );
  }
  const f = (k: keyof Issuer) => ({ value: String(form[k] ?? ""), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value }) });
  const registrant = form.taxMode === "registrant";

  return (
    <AdminShell title="Paramètres" actions={<Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Enregistrement…" : "Enregistrer"}</Button>}>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Émetteur des factures (vous)">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom complet *"><Input {...f("fullName")} /></Field>
            <Field label="Nom commercial (facultatif)" hint="Sans entreprise enregistrée, laissez vide : la facture est émise à votre nom."><Input {...f("businessName")} /></Field>
            <Field label="Adresse"><Input {...f("addressLine1")} /></Field>
            <Field label="Complément"><Input {...f("addressLine2")} /></Field>
            <Field label="Ville"><Input {...f("city")} /></Field>
            <Field label="Province"><Input {...f("province")} /></Field>
            <Field label="Code postal"><Input {...f("postalCode")} placeholder="G8T 0A0" /></Field>
            <Field label="Pays"><Input {...f("country")} /></Field>
            <Field label="Courriel *"><Input type="email" {...f("email")} /></Field>
            <Field label="Téléphone"><Input {...f("phone")} /></Field>
            <Field label="Site web"><Input {...f("website")} /></Field>
            <Field label="NEQ (facultatif)" hint="Numéro d'entreprise du Québec, seulement si vous êtes immatriculé."><Input {...f("neq")} /></Field>
            <label className="sm:col-span-2 flex items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={form.showAddress} onChange={(e) => setForm({ ...form, showAddress: e.target.checked })} />
              Afficher mon adresse postale sur les factures
            </label>
          </div>
        </Panel>

        <Panel title="Taxes de vente">
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer">
              <input type="radio" name="tax" className="mt-1" checked={!registrant} onChange={() => setForm({ ...form, taxMode: "none" })} />
              <span><strong>Petit fournisseur</strong> — pas d'inscription à la TPS ni à la TVQ. Aucune taxe n'est facturée ; la facture porte la mention correspondante. Valable tant que vos ventes taxables restent sous 30 000 $ sur quatre trimestres consécutifs.</span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer">
              <input type="radio" name="tax" className="mt-1" checked={registrant} onChange={() => setForm({ ...form, taxMode: "registrant" })} />
              <span><strong>Inscrit</strong> — vous percevez la TPS (5 %) et la TVQ (9,975 %). Vos numéros d'inscription sont imprimés sur chaque facture, comme l'exige Revenu Québec dès 100 $.</span>
            </label>
            {registrant && (
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <Field label="Numéro de TPS *" hint="Format 123456789 RT0001"><Input {...f("gstNumber")} /></Field>
                <Field label="Numéro de TVQ *" hint="Format 1234567890 TQ0001"><Input {...f("qstNumber")} /></Field>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Paiement et numérotation">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Modalités de paiement par défaut" className="sm:col-span-2"><Textarea rows={2} {...f("paymentTerms")} /></Field>
            <Field label="Instructions de paiement" className="sm:col-span-2" hint="Imprimées au bas de chaque facture."><Textarea rows={3} {...f("paymentInstructions")} /></Field>
            <Field label="Préfixe des numéros" hint="Ex. F → F2026-001, F2026-002…"><Input {...f("invoicePrefix")} maxLength={6} /></Field>
            <Field label="Délai de paiement par défaut (jours)"><Input type="number" min={0} max={120} value={form.defaultDueDays} onChange={(e) => setForm({ ...form, defaultDueDays: Number(e.target.value) })} /></Field>
          </div>
        </Panel>

        <Panel title="Courriels sortants">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom d'expéditeur"><Input {...f("emailFromName")} /></Field>
            <Field label="Adresse d'expédition" hint="Le domaine doit être vérifié dans Resend (mehdijabry.dev l'est déjà)."><Input type="email" {...f("emailFrom")} /></Field>
            <Field label="Signature" className="sm:col-span-2"><Textarea rows={3} {...f("emailSignature")} /></Field>
          </div>
        </Panel>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Conservez vos factures et pièces justificatives six ans après la fin de l'année d'imposition visée. L'export CSV annuel est prévu pour ça.</p>
    </AdminShell>
  );
}
