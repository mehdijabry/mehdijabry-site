/**
 * Invoicing rules for a Québec self-employed developer (travailleur autonome), 2026-09-23.
 *
 * What Revenu Québec requires on an invoice (table « Préparation des factures », tiers by total incl. taxes):
 *   always            — supplier name, invoice date, total amount, tax amount (GST and QST shown as such),
 *                       description of the goods/services
 *   from 100 $        — supplier's GST and QST registration numbers
 *   from 500 $        — buyer's name, payment terms
 * A small supplier (taxable sales ≤ 30 000 $ over four consecutive quarters) is not registered and collects no
 * tax; the invoice then carries no GST/QST and says so. The template below prints the full set every time,
 * whatever the amount, so nothing is ever missing.
 *
 * QST is computed on the price before GST (rule in force since 2013): 5 % GST + 9,975 % QST, each rounded to the cent.
 */

export type TaxMode = "none" | "registrant";

export type IssuerSettings = {
  fullName: string;
  businessName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  email: string;
  phone?: string;
  website?: string;
  neq?: string;
  gstNumber?: string;
  qstNumber?: string;
  taxMode: TaxMode;
  showAddress: boolean;
  paymentTerms: string;
  paymentInstructions: string;
  invoicePrefix: string;
  defaultDueDays: number;
  emailFrom: string;
  emailFromName: string;
  emailSignature: string;
};

export const DEFAULT_ISSUER: IssuerSettings = {
  fullName: "Mehdi Jabry",
  businessName: "",
  addressLine1: "3051, rue du Père-Bressani",
  addressLine2: "Appartement 7",
  city: "Trois-Rivières",
  province: "QC",
  postalCode: "",
  country: "Canada",
  email: "contact@mehdijabry.dev",
  phone: "",
  website: "https://mehdijabry.dev",
  neq: "",
  gstNumber: "",
  qstNumber: "",
  taxMode: "none",
  showAddress: true,
  paymentTerms: "Payable dans les 15 jours suivant la date de facturation.",
  paymentInstructions: "Par virement Interac à contact@mehdijabry.dev (dépôt automatique) ou par virement bancaire sur demande.",
  invoicePrefix: "F",
  defaultDueDays: 15,
  emailFrom: "contact@mehdijabry.dev",
  emailFromName: "Mehdi Jabry",
  emailSignature: "Mehdi Jabry\nDéveloppeur web indépendant — Trois-Rivières\nmehdijabry.dev · contact@mehdijabry.dev",
};

export type InvoiceItem = { description: string; quantity: number; unitPrice: number };

export type ClientSnapshot = {
  name: string;
  contactName?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
};

export type InvoiceView = {
  number: string;
  issueDate: string;   // YYYY-MM-DD
  dueDate: string;
  status: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: string;
  gst: string;
  qst: string;
  total: string;
  taxMode: TaxMode;
  paymentTerms: string | null;
  notes: string | null;
  clientSnapshot: ClientSnapshot;
  paidAt: Date | string | null;
};

export const GST_RATE = 0.05;
export const QST_RATE = 0.09975;

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function computeTotals(items: InvoiceItem[], taxMode: TaxMode): { subtotal: number; gst: number; qst: number; total: number } {
  const subtotal = round2(items.reduce((s, it) => s + round2((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)), 0));
  const gst = taxMode === "registrant" ? round2(subtotal * GST_RATE) : 0;
  const qst = taxMode === "registrant" ? round2(subtotal * QST_RATE) : 0;
  return { subtotal, gst, qst, total: round2(subtotal + gst + qst) };
}

/** 1234.5 → « 1 234,50 $ » (fr-CA) */
export function money(n: number | string, currency = "CAD"): string {
  const v = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(Number.isFinite(v) ? v : 0);
}

export function longDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T12:00:00" : "")) : d;
  return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" }).format(date);
}

const esc = (s: unknown): string => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const nl2br = (s: string): string => esc(s).replace(/\n/g, "<br>");

function addressLines(a: { addressLine1?: string; addressLine2?: string; city?: string; province?: string; postalCode?: string; country?: string }): string[] {
  const cityLine = [a.city, a.province].filter(Boolean).join(" (") + (a.province ? ")" : "");
  return [a.addressLine1, a.addressLine2, [cityLine, a.postalCode].filter(Boolean).join("  "), a.country].map((x) => (x ?? "").trim()).filter(Boolean);
}

/** Print-ready invoice page (A4/Letter, one file, no external assets). The browser's « Enregistrer en PDF » does the rest. */
export function renderInvoiceHtml(inv: InvoiceView, issuer: IssuerSettings): string {
  const registrant = inv.taxMode === "registrant";
  const c = inv.clientSnapshot;
  const statusLabel: Record<string, string> = { brouillon: "Brouillon", "envoyée": "Envoyée", "payée": "Payée", "annulée": "Annulée" };
  const paid = inv.status === "payée";
  const rows = inv.items.map((it) => `
      <tr>
        <td class="desc">${nl2br(it.description)}</td>
        <td class="num">${esc(String(it.quantity).replace(".", ","))}</td>
        <td class="num">${esc(money(it.unitPrice, inv.currency))}</td>
        <td class="num">${esc(money(round2(it.quantity * it.unitPrice), inv.currency))}</td>
      </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Facture ${esc(inv.number)} · ${esc(issuer.businessName || issuer.fullName)}</title>
<style>
  :root { --ink: #16161a; --muted: #6b6b73; --line: #e4e2dc; --accent: #b8863b; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #f1efe9; color: var(--ink); font: 14px/1.5 "Helvetica Neue", Arial, "Segoe UI", sans-serif; }
  .toolbar { display: flex; gap: 10px; justify-content: center; padding: 14px; }
  .toolbar button { font: inherit; font-weight: 600; padding: 10px 18px; border-radius: 8px; border: 1px solid #c9c5bb; background: #fff; cursor: pointer; }
  .toolbar button.primary { background: var(--ink); color: #fff; border-color: var(--ink); }
  .sheet { width: 210mm; min-height: 279mm; margin: 0 auto 30px; background: #fff; padding: 22mm 18mm 18mm; box-shadow: 0 10px 40px rgba(0,0,0,.08); position: relative; }
  h1 { font-size: 34px; letter-spacing: .06em; margin: 0; font-weight: 700; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; border-bottom: 2px solid var(--ink); padding-bottom: 18px; }
  .issuer strong { font-size: 18px; display: block; }
  .issuer, .client { font-size: 13px; }
  .meta { text-align: right; }
  .meta table { margin-left: auto; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
  .meta td { padding: 2px 0 2px 16px; }
  .meta td:first-child { color: var(--muted); }
  .stamp { display: inline-block; margin-top: 8px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; border: 1.5px solid var(--ink); }
  .stamp.paid { color: #1d7a3e; border-color: #1d7a3e; }
  .stamp.cancel { color: #a12; border-color: #a12; }
  .parties { display: flex; justify-content: space-between; gap: 30px; margin: 22px 0 26px; }
  .label { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th { text-align: left; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--ink); padding: 8px 6px; }
  table.items td { padding: 10px 6px; border-bottom: 1px solid var(--line); vertical-align: top; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .desc { width: 58%; }
  .totals { margin-left: auto; width: 62%; margin-top: 10px; border-collapse: collapse; }
  .totals td { padding: 6px 6px; }
  .totals td:first-child { color: var(--muted); }
  .totals tr.total td { border-top: 2px solid var(--ink); font-weight: 700; font-size: 18px; padding-top: 10px; }
  .taxnote { font-size: 12px; color: var(--muted); margin-top: 6px; }
  .terms { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 26px; font-size: 13px; }
  .terms p { margin: 0 0 6px; }
  .foot { position: absolute; left: 18mm; right: 18mm; bottom: 12mm; font-size: 11px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 8px; display: flex; justify-content: space-between; gap: 20px; }
  @media print {
    html, body { background: #fff; }
    .toolbar { display: none; }
    .sheet { box-shadow: none; margin: 0; width: auto; min-height: auto; padding: 14mm 12mm; }
    .foot { position: fixed; }
    @page { size: Letter; margin: 10mm; }
  }
  @media (max-width: 600px) { .sheet { width: auto; padding: 18px; } .head, .parties, .terms { display: block; } .meta { text-align: left; margin-top: 12px; } .meta table { margin-left: 0; } .totals { width: 100%; } }
</style>
</head>
<body>
<div class="toolbar">
  <button class="primary" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
</div>
<article class="sheet">
  <header class="head">
    <div class="issuer">
      <strong>${esc(issuer.businessName || issuer.fullName)}</strong>
      ${issuer.businessName ? `<div>${esc(issuer.fullName)}</div>` : ""}
      ${issuer.showAddress ? addressLines(issuer).map((l) => `<div>${esc(l)}</div>`).join("") : ""}
      <div>${esc(issuer.email)}${issuer.phone ? ` · ${esc(issuer.phone)}` : ""}</div>
      ${issuer.website ? `<div>${esc(issuer.website.replace(/^https?:\/\//, ""))}</div>` : ""}
      ${issuer.neq ? `<div>NEQ ${esc(issuer.neq)}</div>` : ""}
      ${registrant ? `<div>N° TPS ${esc(issuer.gstNumber)} · N° TVQ ${esc(issuer.qstNumber)}</div>` : ""}
    </div>
    <div class="meta">
      <h1>FACTURE</h1>
      <table>
        <tr><td>Numéro</td><td><strong>${esc(inv.number)}</strong></td></tr>
        <tr><td>Date de facturation</td><td>${esc(longDate(inv.issueDate))}</td></tr>
        <tr><td>Date d'échéance</td><td>${esc(longDate(inv.dueDate))}</td></tr>
      </table>
      ${paid ? `<span class="stamp paid">Payée${inv.paidAt ? " le " + esc(longDate(new Date(inv.paidAt))) : ""}</span>` : inv.status === "annulée" ? `<span class="stamp cancel">Annulée</span>` : inv.status === "brouillon" ? `<span class="stamp">Brouillon</span>` : ""}
    </div>
  </header>

  <section class="parties">
    <div class="client">
      <div class="label">Facturé à</div>
      <strong>${esc(c.name)}</strong>
      ${c.contactName ? `<div>À l'attention de ${esc(c.contactName)}</div>` : ""}
      ${addressLines(c).map((l) => `<div>${esc(l)}</div>`).join("")}
      ${c.email ? `<div>${esc(c.email)}</div>` : ""}
    </div>
    <div>
      <div class="label">Modalités de paiement</div>
      <div>${nl2br(inv.paymentTerms || issuer.paymentTerms)}</div>
    </div>
  </section>

  <table class="items">
    <thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix unitaire</th><th class="num">Montant</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    <tr><td>Sous-total</td><td class="num">${esc(money(inv.subtotal, inv.currency))}</td></tr>
    ${registrant ? `
    <tr><td>TPS (5 %)${issuer.gstNumber ? ` — n° ${esc(issuer.gstNumber)}` : ""}</td><td class="num">${esc(money(inv.gst, inv.currency))}</td></tr>
    <tr><td>TVQ (9,975 %)${issuer.qstNumber ? ` — n° ${esc(issuer.qstNumber)}` : ""}</td><td class="num">${esc(money(inv.qst, inv.currency))}</td></tr>` : ""}
    <tr class="total"><td>Total${registrant ? " (taxes incluses)" : ""}</td><td class="num">${esc(money(inv.total, inv.currency))} ${esc(inv.currency)}</td></tr>
  </table>
  ${registrant
    ? `<p class="taxnote">Le montant de taxe indiqué comprend la TPS et la TVQ, calculées sur le sous-total.</p>`
    : `<p class="taxnote">TPS et TVQ non applicables : fournisseur non inscrit aux fichiers de la TPS et de la TVQ (petit fournisseur). Aucune taxe n'est perçue sur cette facture.</p>`}

  <section class="terms">
    <div>
      <div class="label">Paiement</div>
      <p>${nl2br(issuer.paymentInstructions)}</p>
      <p>Merci d'indiquer le numéro de facture <strong>${esc(inv.number)}</strong> avec votre paiement.</p>
    </div>
    <div>
      ${inv.notes ? `<div class="label">Notes</div><p>${nl2br(inv.notes)}</p>` : ""}
    </div>
  </section>

  <footer class="foot">
    <span>${esc(issuer.businessName || issuer.fullName)} — travailleur autonome, ${esc(issuer.city)} (${esc(issuer.province)})</span>
    <span>Facture ${esc(inv.number)}</span>
  </footer>
</article>
</body>
</html>`;
}
