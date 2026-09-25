import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db, sentEmailsTable, trackingEventsTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Suivi des courriels de prospection et des maquettes (2026-09-24).
 *  - /o/<jeton>.gif   pixel d'ouverture (signal indicatif : Apple Mail et certains filtres « ouvrent » tout seuls)
 *  - /go/<jeton>      lien suivi → clic enregistré, redirection vers la maquette avec ?src=courriel&e=<jeton>
 *  - /api/track/visit.gif?site=…   balise posée sur chaque site démo (page vue, provenance, appareil)
 * L'IP n'est jamais stockée : seulement un hachage salé, pour distinguer « 3 visites » de « 3 visiteurs ».
 */
export const PUBLIC_BASE_URL = (process.env["PUBLIC_BASE_URL"] ?? "https://mehdijabry.dev").replace(/\/+$/, "");
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|fetch|scan|monitor|facebookexternalhit|slackbot|whatsapp|twitterbot|linkedinbot|telegrambot|discordbot|curl|wget|python-requests|go-http-client|safelinks|proofpoint|mimecast|barracuda|outlook-ios|yahoocachesystem/i;
const MAIL_PROXY_RE = /googleimageproxy|ggpht\.com|yahoomailproxy|outlook/i;

export const newTrackToken = (): string => randomBytes(12).toString("base64url");
const clip = (v: unknown, max: number): string | null => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const hashIp = (req: Request): string => {
  const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0] ?? req.ip ?? "").trim();
  return createHash("sha256").update(`${process.env["ADMIN_SECRET"] ?? process.env["ADMIN_PASSWORD"] ?? "mj"}:${ip}`).digest("hex").slice(0, 24);
};
const gif = (res: Response): void => { res.set({ "content-type": "image/gif", "cache-control": "no-store, no-cache, must-revalidate, private", pragma: "no-cache", expires: "0" }); res.status(200).end(GIF); };

async function findByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(token)) return null;
  const [row] = await db.select().from(sentEmailsTable).where(eq(sentEmailsTable.trackToken, token)).limit(1);
  return row ?? null;
}
async function record(kind: "open" | "click" | "visit", req: Request, extra: { emailId?: number | null; site?: string | null; path?: string | null; referrer?: string | null; source?: string | null; isBot?: boolean }): Promise<void> {
  const ua = clip(req.headers["user-agent"], 300);
  try {
    await db.insert(trackingEventsTable).values({ kind, emailId: extra.emailId ?? null, site: extra.site ?? null, path: extra.path ?? null, referrer: extra.referrer ?? null, source: extra.source ?? null, userAgent: ua, ipHash: hashIp(req), isBot: extra.isBot ?? Boolean(ua && BOT_RE.test(ua)) });
  } catch (err) { logger.warn({ err, kind }, "tracking insert failed"); }
}

/** Pixel d'ouverture : GET /o/:token.gif */
export async function trackOpenHandler(req: Request, res: Response): Promise<void> {
  const token = String(req.params["token"] ?? "");
  const row = await findByToken(token);
  if (row) {
    const ua = String(req.headers["user-agent"] ?? "");
    // Les proxys d'images de Gmail/Yahoo/Outlook relaient une vraie ouverture ; les scanners de liens, non.
    const isBot = BOT_RE.test(ua) && !MAIL_PROXY_RE.test(ua);
    await record("open", req, { emailId: row.id, isBot });
  }
  gif(res);
}

/** Lien suivi : GET /go/:token → redirection vers la maquette. */
export async function trackClickHandler(req: Request, res: Response): Promise<void> {
  const token = String(req.params["token"] ?? "");
  const row = await findByToken(token);
  res.set("cache-control", "no-store");
  if (!row || !row.trackUrl) { res.redirect(302, PUBLIC_BASE_URL); return; }
  await record("click", req, { emailId: row.id, referrer: clip(req.headers["referer"], 300) });
  const target = new URL(row.trackUrl);
  target.searchParams.set("src", "courriel"); target.searchParams.set("e", token);
  res.redirect(302, target.toString());
}

/** Balise des maquettes : GET /api/track/visit.gif?site=&path=&ref=&src=&e= */
export async function trackVisitHandler(req: Request, res: Response): Promise<void> {
  const q = req.query as Record<string, unknown>;
  const site = clip(q["site"], 120)?.toLowerCase().replace(/[^a-z0-9.-]/g, "") ?? null;
  if (site) {
    let emailId: number | null = null;
    const e = clip(q["e"], 40);
    if (e) { const row = await findByToken(e); emailId = row?.id ?? null; }
    await record("visit", req, { site, emailId, path: clip(q["path"], 200), referrer: clip(q["ref"], 300), source: clip(q["src"], 40) });
  }
  gif(res);
}

export type EmailTracking = { opens: number; clicks: number; visits: number; firstOpenedAt: string | null; firstClickedAt: string | null; lastActivityAt: string | null };
/** Gmail / Workspace préchargent le pixel à la réception : une « ouverture » dans les 2 minutes qui suivent l'envoi n'est
 *  pas une lecture. */
export const PREFETCH_MS = 120_000;
export const isPrefetch = (eventAt: Date, sentAt: Date): boolean => eventAt.getTime() - sentAt.getTime() < PREFETCH_MS;

/** Compteurs par courriel (événements humains seulement : robots et préchargements exclus). */
export async function emailTracking(emailIds: number[]): Promise<Map<number, EmailTracking>> {
  const map = new Map<number, EmailTracking>();
  if (!emailIds.length) return map;
  const sent = await db.select({ id: sentEmailsTable.id, createdAt: sentEmailsTable.createdAt }).from(sentEmailsTable).where(inArray(sentEmailsTable.id, emailIds));
  const sentAt = new Map(sent.map((s) => [s.id, new Date(s.createdAt)]));
  const rows = await db.select({ emailId: trackingEventsTable.emailId, kind: trackingEventsTable.kind, createdAt: trackingEventsTable.createdAt })
    .from(trackingEventsTable).where(and(inArray(trackingEventsTable.emailId, emailIds), eq(trackingEventsTable.isBot, false))).orderBy(trackingEventsTable.createdAt);
  for (const r of rows) {
    if (r.emailId == null) continue;
    const at = new Date(r.createdAt), sentTime = sentAt.get(r.emailId);
    if (r.kind === "open" && sentTime && isPrefetch(at, sentTime)) continue;
    const t = map.get(r.emailId) ?? { opens: 0, clicks: 0, visits: 0, firstOpenedAt: null, firstClickedAt: null, lastActivityAt: null };
    const iso = at.toISOString();
    if (r.kind === "open") { t.opens += 1; t.firstOpenedAt = t.firstOpenedAt ?? iso; }
    if (r.kind === "click") { t.clicks += 1; t.firstClickedAt = t.firstClickedAt ?? iso; }
    if (r.kind === "visit") t.visits += 1;
    if (!t.lastActivityAt || iso > t.lastActivityAt) t.lastActivityAt = iso;
    map.set(r.emailId, t);
  }
  return map;
}

export type SiteStats = { site: string; visits: number; visitors: number; mobile: number; fromEmail: number; lastVisitAt: string | null; days: { day: string; visits: number }[] };
/** Visites par site démo sur les 30 derniers jours. */
export async function siteStats(): Promise<SiteStats[]> {
  const since = new Date(Date.now() - 30 * 86400 * 1000);
  const rows = await db.select().from(trackingEventsTable).where(and(eq(trackingEventsTable.kind, "visit"), eq(trackingEventsTable.isBot, false), gte(trackingEventsTable.createdAt, since))).orderBy(desc(trackingEventsTable.createdAt)).limit(5000);
  const bySite = new Map<string, { rows: typeof rows }>();
  for (const r of rows) { if (!r.site) continue; const s = bySite.get(r.site) ?? { rows: [] }; s.rows.push(r); bySite.set(r.site, s); }
  const out: SiteStats[] = [];
  for (const [site, { rows: rs }] of bySite) {
    const days = new Map<string, number>();
    for (let i = 13; i >= 0; i--) days.set(new Date(Date.now() - i * 86400 * 1000).toISOString().slice(0, 10), 0);
    for (const r of rs) { const d = new Date(r.createdAt).toISOString().slice(0, 10); if (days.has(d)) days.set(d, (days.get(d) ?? 0) + 1); }
    out.push({
      site, visits: rs.length, visitors: new Set(rs.map((r) => r.ipHash)).size,
      mobile: rs.filter((r) => /Mobile|Android|iPhone/i.test(r.userAgent ?? "")).length,
      fromEmail: rs.filter((r) => r.source === "courriel" || r.emailId != null).length,
      lastVisitAt: rs[0] ? new Date(rs[0].createdAt).toISOString() : null,
      days: [...days].map(([day, visits]) => ({ day, visits })),
    });
  }
  return out.sort((a, b) => b.visits - a.visits);
}
