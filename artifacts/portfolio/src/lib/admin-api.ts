/**
 * Client for the internal admin API (/api/admin/*) — cookie session, JSON in/out.
 * Kept out of the generated OpenAPI client on purpose: these routes are private to the operator.
 */
export type TaxMode = "none" | "registrant";

export type Issuer = {
  fullName: string; businessName: string; addressLine1: string; addressLine2: string; city: string; province: string;
  postalCode: string; country: string; email: string; phone: string; website: string; neq: string; gstNumber: string;
  qstNumber: string; taxMode: TaxMode; showAddress: boolean; paymentTerms: string; paymentInstructions: string;
  invoicePrefix: string; defaultDueDays: number; emailFrom: string; emailFromName: string; emailSignature: string;
};

export type Client = {
  id: number; name: string; contactName: string | null; email: string | null; phone: string | null;
  addressLine1: string | null; addressLine2: string | null; city: string | null; province: string | null;
  postalCode: string | null; country: string | null; notes: string | null; createdAt: string;
};
export type ClientInput = Omit<Client, "id" | "createdAt">;

export type InvoiceItem = { description: string; quantity: number; unitPrice: number };
export type ClientSnapshot = {
  name: string; contactName?: string; email?: string; addressLine1?: string; addressLine2?: string;
  city?: string; province?: string; postalCode?: string; country?: string;
};
export type InvoiceStatus = "brouillon" | "envoyée" | "payée" | "annulée";
export type Invoice = {
  id: number; number: string; clientId: number | null; clientSnapshot: ClientSnapshot; issueDate: string; dueDate: string;
  status: InvoiceStatus; currency: string; items: InvoiceItem[]; subtotal: string; gst: string; qst: string; total: string;
  taxMode: TaxMode; paymentTerms: string | null; notes: string | null; publicToken: string; publicUrl: string;
  sentAt: string | null; paidAt: string | null; createdAt: string; updatedAt: string;
};
export type InvoiceInput = {
  clientId?: number | null; clientSnapshot?: ClientSnapshot; issueDate: string; dueDate: string; currency?: string;
  items: InvoiceItem[]; taxMode?: TaxMode; paymentTerms?: string | null; notes?: string | null;
};

export type SentEmail = {
  id: number; toEmail: string; toName: string | null; fromEmail: string; subject: string; bodyText: string;
  invoiceId: number | null; resendId: string | null; status: string; error: string | null; isTest: boolean; createdAt: string;
  trackToken: string | null; trackUrl: string | null;
  tracking: { opens: number; clicks: number; visits: number; firstOpenedAt: string | null; firstClickedAt: string | null; lastActivityAt: string | null };
};
export type SiteStats = { site: string; visits: number; visitors: number; mobile: number; fromEmail: number; lastVisitAt: string | null; days: { day: string; visits: number }[] };

export type ProposalInput = {
  toName: string; business: string; city: string; siteUrl: string; previewImageUrl: string; brokenDomain: string;
  googleRating: string; googleReviews: number | ""; searchPhrase: string; price: number | ""; newDomain: string;
  newDomainPrice: number | ""; newDomainYears: number | ""; deliveryHours: number | ""; forwardToFranchisee: boolean; phone: string;
  variant: "card" | "plain";
};

export type Dashboard = { year: number; invoices: number; billed: number; paid: number; outstanding: number; clients: number; emails: number; smallSupplierThreshold: number };

export class AdminApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers ?? {}) },
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = null;
  try { data = text ? (JSON.parse(text) as unknown) : null; } catch { data = null; } // proxies may answer with HTML
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? (res.status >= 500 ? `Erreur serveur (${res.status})` : `Erreur ${res.status}`);
    throw new AdminApiError(res.status, msg);
  }
  return data as T;
}

export const api = {
  me: () => adminFetch<{ configured: boolean; authenticated: boolean }>("/me"),
  login: (password: string) => adminFetch<{ ok: true }>("/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => adminFetch<{ ok: true }>("/logout", { method: "POST" }),
  dashboard: () => adminFetch<Dashboard>("/dashboard"),
  settings: () => adminFetch<Issuer>("/settings"),
  saveSettings: (s: Issuer) => adminFetch<Issuer>("/settings", { method: "PUT", body: JSON.stringify(s) }),
  clients: () => adminFetch<Client[]>("/clients"),
  createClient: (c: ClientInput) => adminFetch<Client>("/clients", { method: "POST", body: JSON.stringify(c) }),
  updateClient: (id: number, c: ClientInput) => adminFetch<Client>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(c) }),
  deleteClient: (id: number) => adminFetch<{ ok: true }>(`/clients/${id}`, { method: "DELETE" }),
  invoices: (year?: string) => adminFetch<Invoice[]>(`/invoices${year ? `?year=${year}` : ""}`),
  invoice: (id: number) => adminFetch<Invoice>(`/invoices/${id}`),
  createInvoice: (i: InvoiceInput) => adminFetch<Invoice>("/invoices", { method: "POST", body: JSON.stringify(i) }),
  updateInvoice: (id: number, i: InvoiceInput) => adminFetch<Invoice>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(i) }),
  setInvoiceStatus: (id: number, status: InvoiceStatus) => adminFetch<Invoice>(`/invoices/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
  deleteInvoice: (id: number) => adminFetch<{ ok: true }>(`/invoices/${id}`, { method: "DELETE" }),
  sendInvoice: (id: number, body: { to?: string; message?: string }) => adminFetch<{ ok: true; invoice: Invoice }>(`/invoices/${id}/send`, { method: "POST", body: JSON.stringify(body) }),
  emails: () => adminFetch<SentEmail[]>("/emails"),
  siteStats: () => adminFetch<SiteStats[]>("/tracking/sites"),
  forgetSite: (site: string) => adminFetch<{ ok: true }>(`/tracking/sites/${encodeURIComponent(site)}`, { method: "DELETE" }),
  sendEmail: (e: { to: string; toName?: string | null; subject: string; text: string; invoiceId?: number | null }) => adminFetch<{ ok: true; id?: string }>("/emails", { method: "POST", body: JSON.stringify(e) }),
  sendProposal: (p: ProposalInput & { to: string; isTest: boolean; bcc?: string }) => adminFetch<{ ok: true; id?: string }>("/emails/proposal", { method: "POST", body: JSON.stringify(p) }),
  proposalPreviewUrl: (p: ProposalInput) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(p)) { if (v === "" || v === null || v === undefined) continue; q.set(k, typeof v === "boolean" ? (v ? "1" : "0") : String(v)); }
    return `/api/admin/emails/proposal/preview?${q.toString()}`;
  },
};

export const money = (n: number | string, currency = "CAD"): string =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(Number(n) || 0);

export const shortDate = (d: string | null | undefined): string =>
  d ? new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d.length === 10 ? d + "T12:00:00" : d)) : "—";

export const todayIso = (): string => new Date().toISOString().slice(0, 10);
export const addDaysIso = (iso: string, days: number): string => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

export const GST_RATE = 0.05;
export const QST_RATE = 0.09975;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function computeTotals(items: InvoiceItem[], taxMode: TaxMode) {
  const subtotal = round2(items.reduce((s, it) => s + round2((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)), 0));
  const gst = taxMode === "registrant" ? round2(subtotal * GST_RATE) : 0;
  const qst = taxMode === "registrant" ? round2(subtotal * QST_RATE) : 0;
  return { subtotal, gst, qst, total: round2(subtotal + gst + qst) };
}

export const STATUS_LABEL: Record<InvoiceStatus, string> = { brouillon: "Brouillon", "envoyée": "Envoyée", "payée": "Payée", "annulée": "Annulée" };
