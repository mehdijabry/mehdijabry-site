import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod/v4";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { Resend } from "resend";
import { db, ensureAdminSchema, adminSettingsTable, clientsTable, invoicesTable, sentEmailsTable, trackingEventsTable } from "@workspace/db";
import { requireAdmin, checkPassword, issueAdminCookie, clearAdminCookie, isAdminConfigured, hasValidSession } from "../middlewares/admin-auth";
import { DEFAULT_ISSUER, computeTotals, renderInvoiceHtml, money, longDate, type IssuerSettings, type InvoiceItem, type ClientSnapshot, type TaxMode } from "../lib/invoice-html";
import { renderProposalEmail } from "../lib/proposal-email";
import { newTrackToken, emailTracking, siteStats } from "../lib/tracking";
import prospectsRouter from "./prospects";
import { logger } from "../lib/logger";

/**
 * Admin API (2026-09-23) — /api/admin/*
 * Invoicing for a Québec travailleur autonome + outbound e-mails from the studio address.
 * Internal, cookie-authenticated; deliberately kept out of the public OpenAPI contract.
 */
const router: IRouter = Router();

const PUBLIC_BASE_URL = (process.env["PUBLIC_BASE_URL"] ?? "https://mehdijabry.dev").replace(/\/+$/, "");

// ───── Auth ─────
router.post("/login", (req, res) => {
  if (!isAdminConfigured()) { res.status(503).json({ error: "Espace admin désactivé : ADMIN_PASSWORD n'est pas défini sur le serveur." }); return; }
  const password = String((req.body as { password?: unknown })?.password ?? "");
  if (!checkPassword(password)) { res.status(401).json({ error: "Mot de passe incorrect." }); return; }
  issueAdminCookie(res);
  res.json({ ok: true });
});
router.post("/logout", (_req, res) => { clearAdminCookie(res); res.json({ ok: true }); });
router.get("/me", (req, res) => { res.json({ configured: isAdminConfigured(), authenticated: hasValidSession(req) }); });

router.use(requireAdmin);
// Tables are also created lazily: when the database was down at boot, the first admin request after it is
// back creates them — no redeploy needed. A failure here reaches the JSON error handler in app.ts.
router.use((_req, _res, next) => { ensureAdminSchema().then(() => next(), next); });
router.use("/prospects", prospectsRouter);

// ───── Settings (issuer) ─────
const IssuerSchema = z.object({
  fullName: z.string().min(1),
  businessName: z.string().optional().default(""),
  addressLine1: z.string().optional().default(""),
  addressLine2: z.string().optional().default(""),
  city: z.string().optional().default(""),
  province: z.string().optional().default("QC"),
  postalCode: z.string().optional().default(""),
  country: z.string().optional().default("Canada"),
  email: z.email(),
  phone: z.string().optional().default(""),
  website: z.string().optional().default(""),
  neq: z.string().optional().default(""),
  gstNumber: z.string().optional().default(""),
  qstNumber: z.string().optional().default(""),
  taxMode: z.enum(["none", "registrant"]),
  showAddress: z.boolean(),
  paymentTerms: z.string().optional().default(""),
  paymentInstructions: z.string().optional().default(""),
  invoicePrefix: z.string().min(1).max(6).optional().default("F"),
  defaultDueDays: z.number().int().min(0).max(120).optional().default(15),
  emailFrom: z.email(),
  emailFromName: z.string().min(1),
  emailSignature: z.string().optional().default(""),
});

async function loadIssuer(): Promise<IssuerSettings> {
  const rows = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, "issuer")).limit(1);
  const stored = (rows[0]?.value ?? {}) as Partial<IssuerSettings>;
  return { ...DEFAULT_ISSUER, ...stored };
}

router.get("/settings", async (_req, res) => { res.json(await loadIssuer()); });

router.put("/settings", async (req, res) => {
  const parsed = IssuerSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Paramètres invalides", details: parsed.error.issues }); return; }
  if (parsed.data.taxMode === "registrant" && (!parsed.data.gstNumber || !parsed.data.qstNumber)) {
    res.status(400).json({ error: "En mode inscrit, les numéros de TPS et de TVQ sont obligatoires sur chaque facture." }); return;
  }
  await db.insert(adminSettingsTable).values({ key: "issuer", value: parsed.data })
    .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value: parsed.data, updatedAt: new Date() } });
  res.json(parsed.data);
});

// ───── Clients ─────
const ClientSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional().nullable(),
  email: z.email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
const clean = <T extends Record<string, unknown>>(o: T): T => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === "" ? null : v])) as T;

router.get("/clients", async (_req, res) => {
  res.json(await db.select().from(clientsTable).orderBy(clientsTable.name));
});
router.post("/clients", async (req, res) => {
  const parsed = ClientSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Client invalide", details: parsed.error.issues }); return; }
  const [row] = await db.insert(clientsTable).values(clean(parsed.data)).returning();
  res.status(201).json(row);
});
router.put("/clients/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const parsed = ClientSchema.safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) { res.status(400).json({ error: "Client invalide" }); return; }
  const [row] = await db.update(clientsTable).set(clean(parsed.data)).where(eq(clientsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Client introuvable" }); return; }
  res.json(row);
});
router.delete("/clients/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(clientsTable).where(eq(clientsTable.id, id));
  res.json({ ok: true });
});

// ───── Invoices ─────
const ItemSchema = z.object({ description: z.string().min(1), quantity: z.number().positive(), unitPrice: z.number().min(0) });
const SnapshotSchema = z.object({
  name: z.string().min(1), contactName: z.string().optional(), email: z.string().optional(),
  addressLine1: z.string().optional(), addressLine2: z.string().optional(), city: z.string().optional(),
  province: z.string().optional(), postalCode: z.string().optional(), country: z.string().optional(),
});
const InvoiceInput = z.object({
  clientId: z.number().int().nullable().optional(),
  clientSnapshot: SnapshotSchema.optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().length(3).optional().default("CAD"),
  items: z.array(ItemSchema).min(1),
  taxMode: z.enum(["none", "registrant"]).optional(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

async function nextInvoiceNumber(prefix: string, issueDate: string): Promise<string> {
  const year = issueDate.slice(0, 4);
  const head = `${prefix}${year}-`;
  const rows = await db.select({ number: invoicesTable.number }).from(invoicesTable)
    .where(like(invoicesTable.number, `${head}%`)).orderBy(desc(invoicesTable.id)).limit(200);
  const max = rows.reduce((m, r) => Math.max(m, parseInt(r.number.slice(head.length), 10) || 0), 0);
  return `${head}${String(max + 1).padStart(3, "0")}`;
}

async function snapshotFor(input: z.infer<typeof InvoiceInput>): Promise<ClientSnapshot> {
  if (input.clientSnapshot) return input.clientSnapshot;
  if (input.clientId) {
    const [c] = await db.select().from(clientsTable).where(eq(clientsTable.id, input.clientId)).limit(1);
    if (c) return { name: c.name, contactName: c.contactName ?? undefined, email: c.email ?? undefined, addressLine1: c.addressLine1 ?? undefined, addressLine2: c.addressLine2 ?? undefined, city: c.city ?? undefined, province: c.province ?? undefined, postalCode: c.postalCode ?? undefined, country: c.country ?? undefined };
  }
  throw new Error("client requis");
}

function toView(row: typeof invoicesTable.$inferSelect) {
  return { ...row, items: row.items as InvoiceItem[], clientSnapshot: row.clientSnapshot as ClientSnapshot, taxMode: row.taxMode as TaxMode, publicUrl: `${PUBLIC_BASE_URL}/f/${row.publicToken}` };
}

router.get("/invoices", async (req, res) => {
  const year = String(req.query["year"] ?? "");
  const where = /^\d{4}$/.test(year) ? sql`extract(year from ${invoicesTable.issueDate}) = ${Number(year)}` : undefined;
  const rows = await db.select().from(invoicesTable).where(where).orderBy(desc(invoicesTable.issueDate), desc(invoicesTable.id));
  res.json(rows.map(toView));
});

router.post("/invoices", async (req, res) => {
  const parsed = InvoiceInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Facture invalide", details: parsed.error.issues }); return; }
  const issuer = await loadIssuer();
  const taxMode = parsed.data.taxMode ?? issuer.taxMode;
  if (taxMode === "registrant" && (!issuer.gstNumber || !issuer.qstNumber)) { res.status(400).json({ error: "Ajoutez vos numéros de TPS et de TVQ dans les paramètres avant de facturer des taxes." }); return; }
  let snapshot: ClientSnapshot;
  try { snapshot = await snapshotFor(parsed.data); } catch { res.status(400).json({ error: "Choisissez un client." }); return; }
  const t = computeTotals(parsed.data.items, taxMode);
  const number = await nextInvoiceNumber(issuer.invoicePrefix || "F", parsed.data.issueDate);
  const [row] = await db.insert(invoicesTable).values({
    number, clientId: parsed.data.clientId ?? null, clientSnapshot: snapshot, issueDate: parsed.data.issueDate, dueDate: parsed.data.dueDate,
    currency: parsed.data.currency, items: parsed.data.items, subtotal: t.subtotal.toFixed(2), gst: t.gst.toFixed(2), qst: t.qst.toFixed(2), total: t.total.toFixed(2),
    taxMode, paymentTerms: parsed.data.paymentTerms || issuer.paymentTerms, notes: parsed.data.notes || null, publicToken: randomBytes(18).toString("base64url"),
  }).returning();
  res.status(201).json(toView(row!));
});

router.get("/invoices/export.csv", async (req, res) => {
  const year = String(req.query["year"] ?? new Date().getFullYear());
  const rows = await db.select().from(invoicesTable)
    .where(/^\d{4}$/.test(year) ? sql`extract(year from ${invoicesTable.issueDate}) = ${Number(year)}` : undefined)
    .orderBy(invoicesTable.issueDate, invoicesTable.id);
  const q = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const lines = [["Numéro", "Date", "Échéance", "Client", "Statut", "Devise", "Sous-total", "TPS", "TVQ", "Total", "Payée le", "Description"].map(q).join(";")];
  for (const r of rows) {
    const c = r.clientSnapshot as ClientSnapshot; const items = r.items as InvoiceItem[];
    lines.push([r.number, r.issueDate, r.dueDate, c.name, r.status, r.currency, r.subtotal, r.gst, r.qst, r.total, r.paidAt ? new Date(r.paidAt).toISOString().slice(0, 10) : "", items.map((i) => i.description).join(" | ")].map(q).join(";"));
  }
  const paid = rows.filter((r) => r.status === "payée");
  lines.push("", [q("TOTAL FACTURÉ (hors annulées)"), "", "", "", "", "", q(rows.filter((r) => r.status !== "annulée").reduce((s, r) => s + Number(r.subtotal), 0).toFixed(2)), q(rows.filter((r) => r.status !== "annulée").reduce((s, r) => s + Number(r.gst), 0).toFixed(2)), q(rows.filter((r) => r.status !== "annulée").reduce((s, r) => s + Number(r.qst), 0).toFixed(2)), q(rows.filter((r) => r.status !== "annulée").reduce((s, r) => s + Number(r.total), 0).toFixed(2))].join(";"));
  lines.push([q("TOTAL ENCAISSÉ (payées)"), "", "", "", "", "", q(paid.reduce((s, r) => s + Number(r.subtotal), 0).toFixed(2)), q(paid.reduce((s, r) => s + Number(r.gst), 0).toFixed(2)), q(paid.reduce((s, r) => s + Number(r.qst), 0).toFixed(2)), q(paid.reduce((s, r) => s + Number(r.total), 0).toFixed(2))].join(";"));
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader("content-disposition", `attachment; filename="factures-${year}.csv"`);
  res.send("﻿" + lines.join("\r\n"));
});

router.get("/invoices/:id", async (req, res) => {
  const [row] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, Number(req.params["id"]))).limit(1);
  if (!row) { res.status(404).json({ error: "Facture introuvable" }); return; }
  res.json(toView(row));
});

router.put("/invoices/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const parsed = InvoiceInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Facture invalide", details: parsed.error.issues }); return; }
  const [existing] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Facture introuvable" }); return; }
  if (existing.status === "payée") { res.status(409).json({ error: "Une facture payée ne se modifie plus. Créez une nouvelle facture ou une note de crédit." }); return; }
  const issuer = await loadIssuer();
  const taxMode = parsed.data.taxMode ?? (existing.taxMode as TaxMode);
  let snapshot: ClientSnapshot;
  try { snapshot = await snapshotFor(parsed.data); } catch { snapshot = existing.clientSnapshot as ClientSnapshot; }
  const t = computeTotals(parsed.data.items, taxMode);
  const [row] = await db.update(invoicesTable).set({
    clientId: parsed.data.clientId ?? existing.clientId, clientSnapshot: snapshot, issueDate: parsed.data.issueDate, dueDate: parsed.data.dueDate,
    currency: parsed.data.currency, items: parsed.data.items, subtotal: t.subtotal.toFixed(2), gst: t.gst.toFixed(2), qst: t.qst.toFixed(2), total: t.total.toFixed(2),
    taxMode, paymentTerms: parsed.data.paymentTerms || issuer.paymentTerms, notes: parsed.data.notes || null, updatedAt: new Date(),
  }).where(eq(invoicesTable.id, id)).returning();
  res.json(toView(row!));
});

router.post("/invoices/:id/status", async (req, res) => {
  const id = Number(req.params["id"]);
  const status = String((req.body as { status?: unknown })?.status ?? "");
  if (!["brouillon", "envoyée", "payée", "annulée"].includes(status)) { res.status(400).json({ error: "Statut inconnu" }); return; }
  const [row] = await db.update(invoicesTable).set({ status, paidAt: status === "payée" ? new Date() : null, updatedAt: new Date() }).where(eq(invoicesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Facture introuvable" }); return; }
  res.json(toView(row));
});

router.delete("/invoices/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const [row] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Facture introuvable" }); return; }
  if (row.status !== "brouillon" && row.status !== "annulée") { res.status(409).json({ error: "Seules les factures en brouillon ou annulées peuvent être supprimées — les autres doivent être conservées (6 ans)." }); return; }
  await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
  res.json({ ok: true });
});

// ───── E-mails (Resend, from the studio address) ─────
function textToHtml(text: string): string {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
  const linkify = (s: string) => s.replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" style="color:#b8863b">${u}</a>`);
  return text.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px;line-height:1.55">${linkify(esc(p)).replace(/\n/g, "<br>")}</p>`).join("");
}

// Chaque courriel reçoit un jeton : pixel d'ouverture ajouté au HTML, lien suivi /go/<jeton> quand une destination est fournie.
async function sendEmail(opts: { to: string; toName?: string | null; bcc?: string | null; subject: string; text: string; html?: string; invoiceId?: number | null; isTest?: boolean; trackToken?: string; trackUrl?: string | null }): Promise<{ ok: boolean; id?: string; error?: string }> {
  const trackToken = opts.trackToken ?? newTrackToken();
  const issuer = await loadIssuer();
  const apiKey = process.env["RESEND_API_KEY"];
  const from = `${issuer.emailFromName} <${issuer.emailFrom}>`;
  let result: { ok: boolean; id?: string; error?: string };
  const pixel = `<img src="${PUBLIC_BASE_URL}/o/${trackToken}.gif" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0">`;
  const base = opts.html ?? `<div style="font-family:Helvetica Neue,Arial,sans-serif;font-size:15px;color:#16161a;max-width:640px">${textToHtml(opts.text)}</div>`;
  const html = base.includes("</body>") ? base.replace("</body>", `${pixel}</body>`) : base + pixel;
  if (!apiKey) result = { ok: false, error: "RESEND_API_KEY n'est pas défini sur le serveur." };
  else {
    try {
      const resend = new Resend(apiKey);
      const r = await resend.emails.send({ from, to: opts.toName ? `${opts.toName} <${opts.to}>` : opts.to, bcc: opts.bcc || undefined, replyTo: issuer.emailFrom, subject: opts.subject, text: opts.text, html });
      result = r.error ? { ok: false, error: r.error.message } : { ok: true, id: r.data?.id };
    } catch (e) { result = { ok: false, error: String((e as Error).message ?? e) }; }
  }
  await db.insert(sentEmailsTable).values({ toEmail: opts.to, toName: opts.toName ?? null, fromEmail: issuer.emailFrom, subject: opts.subject, bodyText: opts.text, invoiceId: opts.invoiceId ?? null, resendId: result.id ?? null, status: result.ok ? "envoyé" : "échec", error: result.error ?? null, isTest: !!opts.isTest, trackToken, trackUrl: opts.trackUrl ?? null, bodyHtml: html });
  if (!result.ok) logger.warn({ error: result.error }, "admin e-mail failed");
  return result;
}

const EmailInput = z.object({ to: z.email(), toName: z.string().optional().nullable(), subject: z.string().min(1).max(200), text: z.string().min(1).max(20000), invoiceId: z.number().int().optional().nullable() });

router.get("/emails", async (_req, res) => {
  const rows = await db.select().from(sentEmailsTable).orderBy(desc(sentEmailsTable.id)).limit(200);
  const t = await emailTracking(rows.map((r) => r.id));
  res.json(rows.map((r) => ({ ...r, tracking: t.get(r.id) ?? { opens: 0, clicks: 0, visits: 0, firstOpenedAt: null, firstClickedAt: null, lastActivityAt: null } })));
});
// Aperçu d'un courriel tel que le client l'a reçu. Le pixel de suivi est retiré et les liens suivis pointent
// directement vers la destination : regarder son propre envoi ne doit pas compter comme une ouverture ou un clic.
router.get("/emails/:id/html", async (req, res) => {
  const id = Number(req.params["id"]);
  const [m] = await db.select().from(sentEmailsTable).where(eq(sentEmailsTable.id, id)).limit(1);
  if (!m) { res.status(404).type("text/plain").send("Courriel introuvable"); return; }
  let html = m.bodyHtml ?? `<div style="font-family:Helvetica Neue,Arial,sans-serif;font-size:15px;color:#16161a;max-width:640px">${textToHtml(m.bodyText)}</div>`;
  html = html.replace(/<img[^>]+\/o\/[A-Za-z0-9_-]+\.gif[^>]*>/g, "");
  if (m.trackToken && m.trackUrl) html = html.split(`${PUBLIC_BASE_URL}/go/${m.trackToken}`).join(m.trackUrl);
  const esc = (v: string) => v.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
  const banner = `<div style="position:sticky;top:0;background:#16161a;color:#f4f1ea;font:13px/1.5 Helvetica Neue,Arial,sans-serif;padding:10px 16px;display:flex;flex-wrap:wrap;gap:6px 18px;align-items:baseline"><strong>Aperçu — tel que reçu</strong><span>À : ${esc(m.toName ? `${m.toName} <${m.toEmail}>` : m.toEmail)}</span><span>Objet : ${esc(m.subject)}</span><span>${esc(new Date(m.createdAt).toLocaleString("fr-CA", { dateStyle: "long", timeStyle: "short", timeZone: "America/Toronto" }))}</span><span style="opacity:.7">${m.status === "envoyé" ? "Envoyé" : `Échec${m.error ? " : " + esc(m.error) : ""}`}</span></div>`;
  const page = html.includes("<body") ? html.replace(/<body([^>]*)>/, `<body$1>${banner}`) : `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(m.subject)}</title></head><body style="margin:0;background:#f4f1ea">${banner}<div style="padding:24px 16px">${html}</div></body></html>`;
  res.setHeader("cache-control", "no-store");
  res.type("html").send(page);
});
router.get("/tracking/sites", async (_req, res) => { res.json(await siteStats()); });
// Retire un site des statistiques (sondes, essais locaux) : ses visites sont effacées.
router.delete("/tracking/sites/:site", async (req, res) => {
  const site = String(req.params["site"] ?? "").toLowerCase().slice(0, 120);
  if (!site) { res.status(400).json({ error: "Site manquant" }); return; }
  await db.delete(trackingEventsTable).where(and(eq(trackingEventsTable.kind, "visit"), eq(trackingEventsTable.site, site)));
  res.json({ ok: true });
});
router.post("/emails", async (req, res) => {
  const parsed = EmailInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Courriel invalide", details: parsed.error.issues }); return; }
  const r = await sendEmail(parsed.data);
  if (!r.ok) { res.status(502).json({ error: r.error }); return; }
  res.status(201).json({ ok: true, id: r.id });
});

// ───── Proposition de site clés en main (gabarit HTML) ─────
const ProposalFields = z.object({
  toName: z.string().max(120).optional().nullable(),
  business: z.string().min(1).max(120),
  city: z.string().min(1).max(80),
  siteUrl: z.url(),
  previewImageUrl: z.url().optional().nullable().or(z.literal("")),
  brokenDomain: z.string().max(120).optional().nullable(),
  googleRating: z.string().max(10).optional().nullable(),
  googleReviews: z.coerce.number().int().min(0).optional().nullable(),
  searchPhrase: z.string().max(120).optional().nullable(),
  price: z.coerce.number().min(0),
  newDomain: z.string().max(120).optional().nullable(),
  newDomainPrice: z.coerce.number().min(0).optional().nullable(),
  newDomainYears: z.coerce.number().int().min(1).max(10).optional().nullable(),
  deliveryHours: z.coerce.number().int().min(1).max(720).optional().nullable(),
  forwardToFranchisee: z.preprocess((v) => v === true || v === "1" || v === "true", z.boolean()).optional(),
  phone: z.string().min(7).max(30),
  variant: z.enum(["card", "plain"]).optional().nullable(),
  headline: z.string().max(160).optional().nullable(),
  problemText: z.string().max(900).optional().nullable(),
  ownDomain: z.string().max(120).optional().nullable(),
  extraBullets: z.string().max(900).optional().nullable(),
  adminUrl: z.url().optional().nullable().or(z.literal("")),
  adminPassword: z.string().max(60).optional().nullable(),
  subject: z.string().max(150).optional().nullable(),
});
const ProposalSend = ProposalFields.extend({ to: z.email(), isTest: z.boolean().optional(), bcc: z.email().optional().nullable().or(z.literal("")) });

router.get("/emails/proposal/preview", async (req, res) => {
  const parsed = ProposalFields.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: "Paramètres invalides", details: parsed.error.issues }); return; }
  const issuer = await loadIssuer();
  const { html } = renderProposalEmail({ ...parsed.data, previewImageUrl: parsed.data.previewImageUrl || null }, issuer, { logoUrl: `${PUBLIC_BASE_URL}/logo-mark.png` });
  res.setHeader("cache-control", "no-store");
  res.type("html").send(html);
});
router.post("/emails/proposal", async (req, res) => {
  const parsed = ProposalSend.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Courriel invalide", details: parsed.error.issues }); return; }
  const { to, isTest, bcc, ...fields } = parsed.data;
  const issuer = await loadIssuer();
  const trackToken = newTrackToken();
  const mail = renderProposalEmail({ ...fields, previewImageUrl: fields.previewImageUrl || null }, issuer, { logoUrl: `${PUBLIC_BASE_URL}/logo-mark.png`, trackUrl: `${PUBLIC_BASE_URL}/go/${trackToken}` });
  const r = await sendEmail({ to, toName: fields.toName ?? null, bcc: bcc || null, subject: isTest ? `[TEST] ${mail.subject}` : mail.subject, text: mail.text, html: mail.html, isTest: !!isTest, trackToken, trackUrl: fields.siteUrl });
  if (!r.ok) { res.status(502).json({ error: r.error }); return; }
  res.status(201).json({ ok: true, id: r.id });
});

router.post("/invoices/:id/send", async (req, res) => {
  const id = Number(req.params["id"]);
  const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
  if (!inv) { res.status(404).json({ error: "Facture introuvable" }); return; }
  const issuer = await loadIssuer();
  const snap = inv.clientSnapshot as ClientSnapshot;
  const body = req.body as { to?: string; message?: string };
  const to = String(body?.to ?? snap.email ?? "").trim();
  if (!z.email().safeParse(to).success) { res.status(400).json({ error: "Adresse courriel du client manquante ou invalide." }); return; }
  const link = `${PUBLIC_BASE_URL}/f/${inv.publicToken}`;
  const text = (body?.message?.trim() ||
    `Bonjour${snap.contactName ? " " + snap.contactName : ""},\n\nVous trouverez ci-dessous la facture ${inv.number} d'un montant de ${money(inv.total, inv.currency)}, payable au plus tard le ${longDate(inv.dueDate)}.\n\nVoir et télécharger la facture : ${link}\n\n${issuer.paymentInstructions}\n\nMerci de votre confiance,\n${issuer.emailSignature || issuer.fullName}`)
    .replace(/\{lien\}/g, link);
  const r = await sendEmail({ to, toName: snap.contactName ?? snap.name, subject: `Facture ${inv.number} — ${issuer.businessName || issuer.fullName}`, text, invoiceId: inv.id });
  if (!r.ok) { res.status(502).json({ error: r.error }); return; }
  const [row] = await db.update(invoicesTable).set({ status: inv.status === "brouillon" ? "envoyée" : inv.status, sentAt: new Date(), updatedAt: new Date() }).where(eq(invoicesTable.id, id)).returning();
  res.json({ ok: true, invoice: toView(row!) });
});

// ───── Dashboard ─────
router.get("/dashboard", async (_req, res) => {
  const year = new Date().getFullYear();
  const rows = await db.select().from(invoicesTable).where(sql`extract(year from ${invoicesTable.issueDate}) = ${year}`);
  const sum = (f: (r: typeof rows[number]) => boolean) => rows.filter(f).reduce((s, r) => s + Number(r.total), 0);
  const [{ n: clients }] = await db.select({ n: sql<number>`count(*)` }).from(clientsTable);
  const [{ n: emails }] = await db.select({ n: sql<number>`count(*)` }).from(sentEmailsTable).where(and(eq(sentEmailsTable.status, "envoyé"), eq(sentEmailsTable.isTest, false)));
  res.json({ year, invoices: rows.length, billed: sum((r) => r.status !== "annulée" && r.status !== "brouillon"), paid: sum((r) => r.status === "payée"), outstanding: sum((r) => r.status === "envoyée"), clients: Number(clients), emails: Number(emails), smallSupplierThreshold: 30000 });
});

export default router;

/** GET /f/:token — the invoice as a printable page, shared with the client by link. No session needed, token is the secret. */
export async function publicInvoiceHandler(req: Request, res: Response): Promise<void> {
  const token = String(req.params["token"] ?? "");
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) { res.status(404).type("text/plain").send("Introuvable"); return; }
  await ensureAdminSchema();
  const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.publicToken, token)).limit(1);
  if (!inv) { res.status(404).type("text/plain").send("Cette facture n'existe pas ou n'est plus disponible."); return; }
  const issuer = await loadIssuer();
  res.setHeader("cache-control", "private, no-store");
  res.type("html").send(renderInvoiceHtml({ ...inv, items: inv.items as InvoiceItem[], clientSnapshot: inv.clientSnapshot as ClientSnapshot, taxMode: inv.taxMode as TaxMode }, issuer));
}
