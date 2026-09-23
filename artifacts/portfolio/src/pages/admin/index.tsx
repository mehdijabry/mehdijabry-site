import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminShell, ErrorNote, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { api, money } from "@/lib/admin-api";

export default function AdminDashboard() {
  const dash = useQuery({ queryKey: ["admin", "dashboard"], queryFn: api.dashboard });
  const d = dash.data;
  const pct = d ? Math.min(100, Math.round((d.billed / d.smallSupplierThreshold) * 100)) : 0;
  return (
    <AdminShell title="Tableau de bord" actions={<Link href="/admin/factures/nouvelle"><Button>Nouvelle facture</Button></Link>}>
      {dash.isError && <ErrorNote error={dash.error} onRetry={() => dash.refetch()} className="mb-4" />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: `Facturé en ${d?.year ?? ""}`, value: money(d?.billed ?? 0) },
          { label: "Encaissé (payées)", value: money(d?.paid ?? 0) },
          { label: "En attente de paiement", value: money(d?.outstanding ?? 0) },
          { label: "Factures cette année", value: String(d?.invoices ?? 0) },
        ].map((k) => (
          <Panel key={k.label}>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{k.label}</p>
            <p className="font-display text-3xl mt-2 tabular-nums">{k.value}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        <Panel title="Seuil du petit fournisseur">
          <p className="text-sm text-muted-foreground mb-3">
            Sans inscription à la TPS et à la TVQ, vos ventes taxables ne doivent pas dépasser <strong className="text-foreground">30 000 $</strong> sur quatre trimestres civils consécutifs. Au-delà, l'inscription devient obligatoire et vous devez percevoir les taxes.
          </p>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full ${pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm mt-2 tabular-nums">{money(d?.billed ?? 0)} facturés cette année civile · {pct} % du seuil</p>
          <p className="text-xs text-muted-foreground mt-2">Indicateur sur l'année civile en cours ; la règle officielle s'apprécie sur quatre trimestres glissants. Passez en mode « inscrit » dans les paramètres dès que vous avez vos numéros.</p>
        </Panel>
        <Panel title="Raccourcis">
          <ul className="space-y-2 text-sm">
            <li><Link href="/admin/factures/nouvelle" className="text-primary hover:underline">Créer une facture</Link> — numérotée automatiquement, page imprimable et lien à envoyer.</li>
            <li><Link href="/admin/clients" className="text-primary hover:underline">Ajouter un client</Link> — son adresse est figée sur chaque facture émise.</li>
            <li><Link href="/admin/courriels" className="text-primary hover:underline">Envoyer un courriel</Link> — depuis contact@mehdijabry.dev, avec historique.</li>
            <li><a href={`/api/admin/invoices/export.csv?year=${d?.year ?? new Date().getFullYear()}`} className="text-primary hover:underline">Exporter les factures de l'année (CSV)</a> — pour votre déclaration de revenus.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">{d?.clients ?? 0} client(s) · {d?.emails ?? 0} courriel(s) envoyé(s)</p>
        </Panel>
      </div>
    </AdminShell>
  );
}
