import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AdminShell, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { api, money, shortDate, STATUS_LABEL, type InvoiceStatus } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export const STATUS_CLASS: Record<InvoiceStatus, string> = {
  brouillon: "bg-muted text-muted-foreground",
  "envoyée": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "payée": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "annulée": "bg-destructive/10 text-destructive",
};

export function StatusPill({ status }: { status: InvoiceStatus }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLASS[status])}>{STATUS_LABEL[status]}</span>;
}

export default function AdminInvoices() {
  const thisYear = String(new Date().getFullYear());
  const [year, setYear] = useState(thisYear);
  const list = useQuery({ queryKey: ["admin", "invoices", year], queryFn: () => api.invoices(year === "toutes" ? undefined : year) });
  const rows = list.data ?? [];
  const totals = rows.filter((r) => r.status !== "annulée" && r.status !== "brouillon").reduce((s, r) => s + Number(r.total), 0);
  const years = [thisYear, String(Number(thisYear) - 1), "toutes"];

  return (
    <AdminShell
      title="Factures"
      actions={<>
        <a href={`/api/admin/invoices/export.csv?year=${year === "toutes" ? thisYear : year}`}><Button variant="outline">Exporter CSV</Button></a>
        <Link href="/admin/factures/nouvelle"><Button>Nouvelle facture</Button></Link>
      </>}
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {years.map((y) => (
          <button key={y} onClick={() => setYear(y)} className={cn("rounded-full px-3 py-1 text-sm border", year === y ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground")}>{y === "toutes" ? "Toutes" : y}</button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">{rows.length} facture(s) · {money(totals)} émis</span>
      </div>
      <Panel className="p-0 overflow-hidden">
        {list.isLoading ? <p className="p-5 text-sm text-muted-foreground">Chargement…</p> : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune facture pour cette période. <Link href="/admin/factures/nouvelle" className="text-primary hover:underline">Créer la première</Link>.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr><th className="text-left p-3">Numéro</th><th className="text-left p-3">Client</th><th className="text-left p-3">Date</th><th className="text-left p-3">Échéance</th><th className="text-left p-3">Statut</th><th className="text-right p-3">Total</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="p-3 font-mono"><Link href={`/admin/factures/${r.id}`} className="hover:underline">{r.number}</Link></td>
                    <td className="p-3">{r.clientSnapshot.name}</td>
                    <td className="p-3 whitespace-nowrap">{shortDate(r.issueDate)}</td>
                    <td className="p-3 whitespace-nowrap">{shortDate(r.dueDate)}</td>
                    <td className="p-3"><StatusPill status={r.status} /></td>
                    <td className="p-3 text-right tabular-nums font-medium">{money(r.total, r.currency)}</td>
                    <td className="p-3 text-right whitespace-nowrap"><a href={r.publicUrl} target="_blank" rel="noopener" className="text-primary hover:underline">Voir / PDF</a></td>
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
