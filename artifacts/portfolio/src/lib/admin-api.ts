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
  trackToken: string | null; trackUrl: string | null; bodyHtml?: string | null;
  tracking: { opens: number; clicks: number; visits: number; firstOpenedAt: string | null; firstClickedAt: string | null; lastActivityAt: string | null };
};
export type TrackingEvent = { id: number; kind: "open" | "click" | "visit"; at: string; origin: string; isBot: boolean; prefetch?: boolean; site: string | null; path: string | null; source: string | null; visitor: string | null };
export type SiteStats = { site: string; visits: number; visitors: number; mobile: number; fromEmail: number; lastVisitAt: string | null; days: { day: string; visits: number }[] };

export type ProposalInput = {
  toName: string; business: string; city: string; siteUrl: string; previewImageUrl: string; brokenDomain: string;
  googleRating: string; googleReviews: number | ""; searchPhrase: string; price: number | ""; monthlyPrice?: number | ""; newDomain: string;
  newDomainPrice: number | ""; newDomainYears: number | ""; deliveryHours: number | ""; forwardToFranchisee: boolean; phone: string;
  variant: "card" | "plain" | "court" | "brut";
  headline: string; problemText: string; ownDomain: string; extraBullets: string; adminUrl: string; adminPassword: string; subject: string; featuresText: string;
  /** Annonce le prix comme « offre de lancement, le temps de signer mes tout premiers clients » (2026-10-02). */
  launchOffer?: boolean;
};

/** Relance courtoise (2026-09-28) : second courriel, anti-hameçonnage explicite, image du site, « regarder ne coûte rien ». */
export type FollowupInput = {
  toName: string; business: string; siteUrl: string; previewImageUrl: string; ownDomain: string; price: number | ""; monthlyPrice?: number | ""; phone: string;
  adminUrl: string; adminPassword: string; firstSentLabel: string; callNote: string; keepUntil: string;
  googleRating: string; googleReviews: number | ""; bullets: string; subject: string;
  /** « brut » (recommandé depuis le 02/10) = ~120 mots, pas de bloc anti-hameçonnage ; « classic » = archive. */
  variant?: "classic" | "brut";
};

export const PROSPECT_STATUSES = ["nouveau", "maquette", "contacté", "relance", "négociation", "gagné", "perdu"] as const;
export type ProspectStatus = typeof PROSPECT_STATUSES[number];
export type ProspectInput = {
  name: string; city: string; contactName: string; email: string; phone: string; googleMapsUrl: string; websiteUrl: string;
  brokenDomain: string; ownDomain: string; googleRating: string; googleReviews: number | ""; mockUrl: string; adminUrl: string;
  adminDemoPassword: string; hasReservations: boolean; status: ProspectStatus; price: number | ""; notes: string; nextAction: string; nextActionAt: string;
};
export type Prospect = Omit<ProspectInput, "googleReviews" | "price"> & {
  id: number; googleReviews: number | null; price: number | null; clientId: number | null; createdAt: string; updatedAt: string;
  activity: { emails: number; lastEmailAt: string | null; lastEmailId: number | null; lastEmailSubject: string | null; opens: number; clicks: number; lastActivityAt: string | null; visits: number; visitors: number; lastVisitAt: string | null };
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
  emailEvents: (id: number) => adminFetch<TrackingEvent[]>(`/emails/${id}/events`),
  siteStats: () => adminFetch<SiteStats[]>("/tracking/sites"),
  prospects: () => adminFetch<Prospect[]>("/prospects"),
  createProspect: (p: ProspectInput) => adminFetch<Prospect>("/prospects", { method: "POST", body: JSON.stringify(p) }),
  updateProspect: (id: number, p: ProspectInput) => adminFetch<Prospect>(`/prospects/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  deleteProspect: (id: number) => adminFetch<{ ok: true }>(`/prospects/${id}`, { method: "DELETE" }),
  convertProspect: (id: number) => adminFetch<Prospect>(`/prospects/${id}/convert`, { method: "POST" }),
  forgetSite: (site: string) => adminFetch<{ ok: true }>(`/tracking/sites/${encodeURIComponent(site)}`, { method: "DELETE" }),
  sendEmail: (e: { to: string; toName?: string | null; subject: string; text: string; invoiceId?: number | null }) => adminFetch<{ ok: true; id?: string }>("/emails", { method: "POST", body: JSON.stringify(e) }),
  sendProposal: (p: ProposalInput & { to: string; isTest: boolean; bcc?: string }) => adminFetch<{ ok: true; id?: string }>("/emails/proposal", { method: "POST", body: JSON.stringify(p) }),
  sendFollowup: (p: FollowupInput & { to: string; isTest: boolean; bcc?: string }) => adminFetch<{ ok: true; id?: string }>("/emails/followup", { method: "POST", body: JSON.stringify(p) }),
  followupPreviewUrl: (p: FollowupInput) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(p)) { if (v === "" || v === null || v === undefined) continue; q.set(k, String(v)); }
    return `/api/admin/emails/followup/preview?${q.toString()}`;
  },
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

/**
 * "https://lebette-demo.pages.dev" → "https://mehdijabry.dev/maquette-v1/lebette" (2026-10-02).
 * Un lien *.pages.dev envoyé par un inconnu ressemble à un lien d'hameçonnage aux yeux du prospect — c'est la
 * raison la plus probable d'un courriel ouvert mais jamais cliqué. mehdijabry.dev/maquette-v1/<slug> redirige vers la
 * même maquette (voir api-server/src/lib/demo-redirect.ts) mais affiche un domaine que le prospect reconnaît.
 * Ne touche pas aux URL qui ne suivent pas ce format (domaine propre du client, etc.) : retourne tel quel.
 */
export const trustedDemoUrl = (rawUrl: string | null | undefined): string => {
  const u = (rawUrl || "").trim();
  const m = u.match(/^https?:\/\/([a-z0-9-]+)-demo\.pages\.dev\/?$/i);
  return m ? `https://mehdijabry.dev/maquette-v1/${m[1].toLowerCase()}` : u;
};

/** Même raisonnement que trustedDemoUrl, pour le lien vers l'espace d'administration de démonstration. */
export const trustedAdminUrl = (rawUrl: string | null | undefined): string => {
  const u = (rawUrl || "").trim();
  const m = u.match(/^https?:\/\/([a-z0-9-]+)-demo\.pages\.dev\/admin\/?$/i);
  return m ? `https://mehdijabry.dev/maquette-v1/${m[1].toLowerCase()}/admin` : u;
};

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
