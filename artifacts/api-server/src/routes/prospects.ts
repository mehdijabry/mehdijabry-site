import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { desc, eq, sql } from "drizzle-orm";
import { db, prospectsTable, clientsTable, sentEmailsTable } from "@workspace/db";
import { emailTracking, siteStats } from "../lib/tracking";

/**
 * Prospects (2026-09-24) — /api/admin/prospects. Monté derrière requireAdmin par routes/admin.ts.
 * Chaque prospect agrège ce qu'on a construit pour lui (maquette, admin démo, réservations), les courriels envoyés à son
 * adresse (avec ouvertures/clics) et les visites de sa maquette. « Passer en client » copie la fiche dans clients.
 */
const router: IRouter = Router();

export const PROSPECT_STATUSES = ["nouveau", "maquette", "contacté", "relance", "négociation", "gagné", "perdu"] as const;
const opt = (max: number) => z.string().max(max).optional().nullable().transform((v) => (v && v.trim() ? v.trim() : null));
const ProspectSchema = z.object({
  name: z.string().min(1).max(120),
  city: opt(80), contactName: opt(120), email: opt(160), phone: opt(40),
  googleMapsUrl: opt(500), websiteUrl: opt(300), brokenDomain: opt(120), ownDomain: opt(120),
  googleRating: opt(10), googleReviews: z.coerce.number().int().min(0).optional().nullable(),
  mockUrl: opt(300), adminUrl: opt(300), adminDemoPassword: opt(60),
  hasReservations: z.boolean().optional().default(false),
  status: z.enum(PROSPECT_STATUSES).optional().default("nouveau"),
  price: z.coerce.number().min(0).optional().nullable(),
  notes: opt(4000), nextAction: opt(300),
  nextActionAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal("").transform(() => null)),
});
const host = (url: string | null): string | null => { try { return url ? new URL(url).hostname.toLowerCase() : null; } catch { return null; } };

async function withActivity(rows: (typeof prospectsTable.$inferSelect)[]) {
  const sites = await siteStats();
  const emails = await db.select().from(sentEmailsTable).where(eq(sentEmailsTable.isTest, false)).orderBy(desc(sentEmailsTable.id)).limit(500);
  const tracking = await emailTracking(emails.map((e) => e.id));
  return rows.map((p) => {
    const mine = p.email ? emails.filter((e) => e.toEmail.toLowerCase() === p.email!.toLowerCase()) : [];
    const agg = mine.reduce((a, e) => { const t = tracking.get(e.id); if (t) { a.opens += t.opens; a.clicks += t.clicks; if (t.lastActivityAt && (!a.lastActivityAt || t.lastActivityAt > a.lastActivityAt)) a.lastActivityAt = t.lastActivityAt; } return a; }, { opens: 0, clicks: 0, lastActivityAt: null as string | null });
    const site = sites.find((s) => s.site === host(p.mockUrl));
    return {
      ...p, price: p.price == null ? null : Number(p.price),
      activity: {
        emails: mine.length, lastEmailAt: mine[0]?.createdAt ?? null, lastEmailId: mine[0]?.id ?? null, lastEmailSubject: mine[0]?.subject ?? null,
        opens: agg.opens, clicks: agg.clicks, lastActivityAt: agg.lastActivityAt,
        visits: site?.visits ?? 0, visitors: site?.visitors ?? 0, lastVisitAt: site?.lastVisitAt ?? null,
      },
    };
  });
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(prospectsTable).orderBy(desc(prospectsTable.updatedAt));
  res.json(await withActivity(rows));
});
router.post("/", async (req, res) => {
  const parsed = ProspectSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Prospect invalide", details: parsed.error.issues }); return; }
  const [row] = await db.insert(prospectsTable).values({ ...parsed.data, price: parsed.data.price == null ? null : String(parsed.data.price) }).returning();
  res.status(201).json((await withActivity([row!]))[0]);
});
router.put("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const parsed = ProspectSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Prospect invalide", details: parsed.error.issues }); return; }
  const [row] = await db.update(prospectsTable).set({ ...parsed.data, price: parsed.data.price == null ? null : String(parsed.data.price), updatedAt: new Date() }).where(eq(prospectsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Prospect introuvable" }); return; }
  res.json((await withActivity([row]))[0]);
});
router.delete("/:id", async (req, res) => {
  await db.delete(prospectsTable).where(eq(prospectsTable.id, Number(req.params["id"])));
  res.json({ ok: true });
});
// Passer en client : la fiche est copiée dans clients (adresse à compléter), le prospect passe « gagné ».
router.post("/:id/convert", async (req, res) => {
  const id = Number(req.params["id"]);
  const [p] = await db.select().from(prospectsTable).where(eq(prospectsTable.id, id)).limit(1);
  if (!p) { res.status(404).json({ error: "Prospect introuvable" }); return; }
  let clientId = p.clientId;
  if (!clientId) {
    const [c] = await db.insert(clientsTable).values({ name: p.name, contactName: p.contactName, email: p.email, phone: p.phone, city: p.city, province: "QC", country: "Canada", notes: p.notes ? `Prospect → client. ${p.notes}` : "Prospect → client." }).returning();
    clientId = c!.id;
  }
  const [row] = await db.update(prospectsTable).set({ status: "gagné", clientId, updatedAt: new Date() }).where(eq(prospectsTable.id, id)).returning();
  res.json({ ...(await withActivity([row!]))[0], clientId });
});
router.get("/stats", async (_req, res) => {
  const rows = await db.select({ status: prospectsTable.status, n: sql<number>`count(*)` }).from(prospectsTable).groupBy(prospectsTable.status);
  res.json(Object.fromEntries(rows.map((r) => [r.status, Number(r.n)])));
});
export default router;
