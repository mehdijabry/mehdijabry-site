import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { and, desc, eq, gte, inArray, isNull, notInArray, or, sql } from "drizzle-orm";
import { db, sentEmailsTable, trackingEventsTable, trackingIgnoredTable, prospectsTable } from "@workspace/db";
import { logger } from "./logger";
import { sendPush, pushedRecentlyFor } from "./push";

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
/**
 * Robots qui ne se déclarent pas (2026-10-06). Dans la nuit du 5 au 6 octobre, Mehdi a reçu des
 * notifications toute la nuit sans trouver la moindre visite réelle derrière. Les relevés montrent la
 * signature, sans ambiguïté :
 *   • la même adresse IP charge une maquette DEUX fois à 10 secondes d'intervalle, une fois avec un
 *     user-agent Windows puis une fois avec un user-agent Android — 25 « visiteurs » sur 136 ;
 *   • chaque chargement déclenche les 6 ou 7 sections de la page dans LA MÊME SECONDE, ce qu'aucun
 *     humain ne peut faire en défilant ;
 *   • 78 événements viennent de « X11; Linux », c'est-à-dire d'un serveur, pas d'un client de
 *     Trois-Rivières (un navigateur de bureau sous Linux l'annonce ainsi, et c'est aussi la signature
 *     par défaut de Chrome sans interface, utilisé par les robots d'indexation et les antivirus de
 *     courriel qui suivent les liens qu'on envoie).
 * Ces user-agents sont donc classés « robot » : ils ne déclenchent plus d'alerte et sortent des
 * compteurs. La règle s'applique aussi À LA LECTURE, donc les visites déjà enregistrées sont
 * reclassées sans migration.
 */
const AUTOMATION_RE = /headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver|okhttp|java\/|libwww|httpclient|apache-http|axios|node-fetch|got\/|dart:io/i;
export function isAutomatedAgent(ua: string | null | undefined): boolean {
  const u = (ua ?? "").trim();
  if (!u) return true;                       // une vraie page envoie toujours un user-agent
  if (BOT_RE.test(u) || AUTOMATION_RE.test(u)) return true;
  if (/\(X11;/i.test(u)) return true;        // serveur Linux — voir le commentaire ci-dessus
  if (/^mozilla\/[\d.]+$/i.test(u)) return true; // « Mozilla/5.0 » tout court, sans plateforme
  return false;
}
/** Un événement déjà en base compte-t-il comme robot ? (drapeau enregistré OU user-agent reclassé) */
const rowIsBot = (r: { isBot: boolean; userAgent: string | null }): boolean => r.isBot || isAutomatedAgent(r.userAgent);

/**
 * Clé canonique d'une maquette (2026-10-05). Une même maquette est visitée de deux façons :
 *   • directement sur <slug>-demo.pages.dev ;
 *   • via le lien montré aux prospects, mehdijabry.dev/maquette-v1/<slug>, qui PROXIE la maquette — la balise de
 *     app.js reporte alors `location.hostname` = « mehdijabry.dev », identique pour toutes les maquettes.
 * Sans cette normalisation, toutes les visites passées par le lien proxy s'agglomèrent sous un seul « site » :
 * Aura Lunosa, La Flânerie et le Chemin du Roy affichaient les deux mêmes visites, à la même seconde. On normalise
 * à l'écriture (données propres ensuite) ET à la lecture (les lignes déjà enregistrées sont réattribuées).
 */
export function canonicalSite(site: string | null | undefined, path: string | null | undefined): string | null {
  if (!site) return null;
  const s = site.toLowerCase();
  if (s === "mehdijabry.dev" || s.endsWith(".mehdijabry.dev")) {
    const m = /^\/maquette-v1\/([a-z0-9-]+)/i.exec(path ?? "");
    if (m) return `${m[1]!.toLowerCase()}-demo.pages.dev`;
  }
  return s;
}
/** Même normalisation à partir d'une URL complète (le champ `mockUrl` d'un prospect, par exemple). */
export function canonicalSiteFromUrl(url: string | null | undefined): string | null {
  try { return url ? canonicalSite(new URL(url).hostname, new URL(url).pathname) : null; } catch { return null; }
}

export const newTrackToken = (): string => randomBytes(12).toString("base64url");
const clip = (v: unknown, max: number): string | null => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const hashIp = (req: Request): string => {
  const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0] ?? req.ip ?? "").trim();
  return createHash("sha256").update(`${process.env["ADMIN_SECRET"] ?? process.env["ADMIN_PASSWORD"] ?? "mj"}:${ip}`).digest("hex").slice(0, 24);
};

// ── Appareils de l'admin (2026-09-28) ──
// Chaque requête admin authentifiée mémorise le hachage d'IP de l'appareil (au plus une écriture par heure et par appareil).
// Les événements portant ces hachages — nos propres essais sur les maquettes, nos relectures de courriels — sortent des
// compteurs, rétroactivement puisque le filtre s'applique à la lecture.
const remembered = new Map<string, number>();
export function rememberAdminDevice(req: Request): void {
  const h = hashIp(req), now = Date.now();
  if ((remembered.get(h) ?? 0) > now - 3600_000) return;
  remembered.set(h, now);
  db.insert(trackingIgnoredTable).values({ ipHash: h, label: clip(req.headers["user-agent"], 120) })
    .onConflictDoUpdate({ target: trackingIgnoredTable.ipHash, set: { lastSeenAt: new Date() } })
    .then(() => { ignoredCache = null; }, (err: unknown) => { remembered.delete(h); logger.warn({ err }, "tracking_ignored upsert failed"); });
}
let ignoredCache: { at: number; hashes: string[] } | null = null;
export async function ignoredHashes(): Promise<string[]> {
  if (ignoredCache && ignoredCache.at > Date.now() - 60_000) return ignoredCache.hashes;
  const rows = await db.select({ ipHash: trackingIgnoredTable.ipHash }).from(trackingIgnoredTable);
  ignoredCache = { at: Date.now(), hashes: rows.map((r) => r.ipHash) };
  return ignoredCache.hashes;
}
/** Condition SQL « pas un de nos appareils » (undefined = aucun appareil connu, donc pas de filtre). */
async function notOwnDevice() {
  const ignored = await ignoredHashes();
  return ignored.length ? or(isNull(trackingEventsTable.ipHash), notInArray(trackingEventsTable.ipHash, ignored)) : undefined;
}

const gif = (res: Response): void => { res.set({ "content-type": "image/gif", "cache-control": "no-store, no-cache, must-revalidate, private", pragma: "no-cache", expires: "0" }); res.status(200).end(GIF); };

async function findByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(token)) return null;
  const [row] = await db.select().from(sentEmailsTable).where(eq(sentEmailsTable.trackToken, token)).limit(1);
  return row ?? null;
}

/**
 * Nom lisible pour une notification push (2026-10-05) : le prospect relié au courriel si on en a un, sinon le
 * prospect dont la maquette correspond à l'hôte visité — gère aussi le lien raccourci /maquette-v1/<slug>
 * (même logique que prospectJourney). Retombe sur l'adresse ou l'hôte si personne ne correspond.
 */
async function resolveLabel(opts: { site?: string | null; path?: string | null; emailRow?: { toEmail: string } | null }): Promise<string> {
  if (opts.emailRow) {
    const [p] = await db.select({ name: prospectsTable.name }).from(prospectsTable)
      .where(sql`lower(${prospectsTable.email}) = lower(${opts.emailRow.toEmail})`).limit(1);
    return p?.name ?? opts.emailRow.toEmail;
  }
  const site = canonicalSite(opts.site, opts.path);
  if (!site) return "inconnu";
  const rows = await db.select({ name: prospectsTable.name, mockUrl: prospectsTable.mockUrl }).from(prospectsTable);
  // Comparaison sur la clé canonique des deux côtés : le mockUrl d'un prospect est souvent le lien proxy
  // (mehdijabry.dev/maquette-v1/<slug>), jamais l'hôte de la maquette.
  for (const r of rows) if (canonicalSiteFromUrl(r.mockUrl) === site) return r.name;
  return site.replace(/-demo\.pages\.dev$/, "");
}
async function record(kind: "open" | "click" | "visit" | "section", req: Request, extra: { emailId?: number | null; site?: string | null; path?: string | null; referrer?: string | null; source?: string | null; isBot?: boolean }): Promise<void> {
  const ua = clip(req.headers["user-agent"], 300);
  try {
    await db.insert(trackingEventsTable).values({ kind, emailId: extra.emailId ?? null, site: canonicalSite(extra.site, extra.path), path: extra.path ?? null, referrer: extra.referrer ?? null, source: extra.source ?? null, userAgent: ua, ipHash: hashIp(req), isBot: extra.isBot ?? isAutomatedAgent(ua) });
  } catch (err) { logger.warn({ err, kind }, "tracking insert failed"); }
}

/** Pixel d'ouverture : GET /o/:token.gif */
export async function trackOpenHandler(req: Request, res: Response): Promise<void> {
  const token = String(req.params["token"] ?? "");
  const row = await findByToken(token);
  if (row) {
    const ua = String(req.headers["user-agent"] ?? "");
    // Les proxys d'images de Gmail/Yahoo/Outlook relaient une vraie ouverture ; les scanners de liens, non.
    const isBot = isAutomatedAgent(ua) && !MAIL_PROXY_RE.test(ua);
    await record("open", req, { emailId: row.id, isBot });
    if (!isBot && !isPrefetch(new Date(), new Date(row.createdAt))) {
      void resolveLabel({ emailRow: { toEmail: row.toEmail } })
        .then((label) => sendPush({ title: "📬 Courriel ouvert", body: label, url: `${PUBLIC_BASE_URL}/admin/suivi`, tag: "open", kind: "open", emailId: row.id }))
        .catch(() => {});
    }
  }
  gif(res);
}

/** Lien suivi : GET /go/:token → redirection vers la maquette. */
export async function trackClickHandler(req: Request, res: Response): Promise<void> {
  const token = String(req.params["token"] ?? "");
  const row = await findByToken(token);
  res.set("cache-control", "no-store");
  if (!row || !row.trackUrl) { res.redirect(302, PUBLIC_BASE_URL); return; }
  const ua = String(req.headers["user-agent"] ?? "");
  const isBot = isAutomatedAgent(ua);
  await record("click", req, { emailId: row.id, referrer: clip(req.headers["referer"], 300), isBot });
  if (!isBot) {
    void resolveLabel({ emailRow: { toEmail: row.toEmail } })
      .then((label) => sendPush({ title: "🖱️ Lien cliqué", body: label, url: `${PUBLIC_BASE_URL}/admin/suivi?site=${encodeURIComponent(canonicalSiteFromUrl(row.trackUrl) ?? "")}`, tag: "click", kind: "click", emailId: row.id, site: canonicalSiteFromUrl(row.trackUrl) }))
      .catch(() => {});
  }
  const target = new URL(row.trackUrl);
  target.searchParams.set("src", "courriel"); target.searchParams.set("e", token);
  res.redirect(302, target.toString());
}

/** Balise des maquettes : GET /api/track/visit.gif?site=&path=&ref=&src=&e=
 *  Une notification push ne part que pour une « nouvelle » visite (aucune visite du même visiteur sur ce site dans
 *  les 30 dernières minutes, même fenêtre que les sessions du parcours) — sinon chaque section défilée ou chaque
 *  rechargement de page alerterait l'iPhone de Mehdi. */
export async function trackVisitHandler(req: Request, res: Response): Promise<void> {
  const q = req.query as Record<string, unknown>;
  const rawSite = clip(q["site"], 120)?.toLowerCase().replace(/[^a-z0-9.-]/g, "") ?? null;
  const path = clip(q["path"], 200);
  // La maquette vue par le lien proxy reporte « mehdijabry.dev » : on la ramène à sa clé canonique avant
  // d'enregistrer, de chercher la session en cours et de nommer la notification.
  const site = canonicalSite(rawSite, path);
  if (site) {
    let emailId: number | null = null, emailRow: { toEmail: string } | null = null;
    const e = clip(q["e"], 40);
    if (e) { const row = await findByToken(e); if (row) { emailId = row.id; emailRow = { toEmail: row.toEmail }; } }
    const ua = String(req.headers["user-agent"] ?? "");
    const isBot = isAutomatedAgent(ua);
    const ih = hashIp(req);
    let isNewSession = true;
    if (!isBot) {
      const cutoff = new Date(Date.now() - SESSION_GAP_MS);
      const [recent] = await db.select({ id: trackingEventsTable.id }).from(trackingEventsTable)
        .where(and(eq(trackingEventsTable.kind, "visit"), eq(trackingEventsTable.ipHash, ih), eq(trackingEventsTable.site, site), gte(trackingEventsTable.createdAt, cutoff)))
        .limit(1);
      isNewSession = !recent;
    }
    await record("visit", req, { site, emailId, path, referrer: clip(q["ref"], 300), source: clip(q["src"], 40), isBot });
    // Quatre conditions avant d'alerter : ce n'est pas un robot, c'est une nouvelle session pour ce
    // visiteur, ce n'est pas un de nos appareils, et aucune alerte n'est déjà partie pour cette maquette
    // dans la dernière demi-heure (voir PUSH_DEBOUNCE_MS).
    if (!isBot && isNewSession && !(await ignoredHashes()).includes(ih) && !(await pushedRecentlyFor(site))) {
      void resolveLabel({ site, path, emailRow })
        .then((label) => sendPush({ title: "👀 Visite de la maquette", body: label, url: `${PUBLIC_BASE_URL}/admin/suivi?site=${encodeURIComponent(site)}`, tag: "visit", kind: "visit", site, emailId }))
        .catch(() => {});
    }
  }
  gif(res);
}

/**
 * Profondeur de défilement (2026-10-05) : GET /api/track/section.gif?site=&id=&e= — posée une fois par section
 * <section id="…"> atteinte par chargement de page (app.js, IntersectionObserver). Kind distinct de « visit » pour
 * ne pas gonfler les compteurs de visites (emailTracking, siteStats) ; prospectJourney() les inclut explicitement
 * pour reconstruire ce que le visiteur a réellement parcouru, pas seulement la page d'arrivée.
 */
export async function trackSectionHandler(req: Request, res: Response): Promise<void> {
  const q = req.query as Record<string, unknown>;
  const rawSite = clip(q["site"], 120)?.toLowerCase().replace(/[^a-z0-9.-]/g, "") ?? null;
  // La balise de section n'envoie pas le chemin de la page (contrairement à celle de visite). Pour normaliser
  // malgré tout une maquette vue par le lien proxy, on lit `p` quand la maquette l'envoie (ajouté 2026-10-05)
  // et, à défaut, le chemin du Referer — c'est la page qui a chargé l'image, donc la maquette elle-même. Ça
  // couvre les 25 maquettes déjà déployées sans avoir à les redéployer.
  const refPath = (() => { try { return new URL(String(req.headers["referer"] ?? "")).pathname; } catch { return null; } })();
  const site = canonicalSite(rawSite, clip(q["p"], 200) ?? refPath);
  const id = clip(q["id"], 60);
  if (site && id) {
    let emailId: number | null = null;
    const e = clip(q["e"], 40);
    if (e) { const row = await findByToken(e); emailId = row?.id ?? null; }
    await record("section", req, { site, emailId, path: id });
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
  const all = await db.select({ emailId: trackingEventsTable.emailId, kind: trackingEventsTable.kind, createdAt: trackingEventsTable.createdAt, isBot: trackingEventsTable.isBot, userAgent: trackingEventsTable.userAgent })
    .from(trackingEventsTable).where(and(inArray(trackingEventsTable.emailId, emailIds), eq(trackingEventsTable.isBot, false), await notOwnDevice())).orderBy(trackingEventsTable.createdAt);
  const rows = all.filter((r) => !rowIsBot(r));   // reclasse les robots déjà enregistrés comme humains
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

/** Origine devinée du navigateur, à partir du user-agent — partagée entre /emails/:id/events et le parcours. */
export function originLabel(ua: string | null): string {
  const u = ua ?? "";
  if (/GoogleImageProxy|ggpht/i.test(u)) return "Gmail (ouverture relayée par le proxy Google)";
  if (/YahooMailProxy/i.test(u)) return "Yahoo Mail";
  if (/Outlook|Microsoft Office/i.test(u)) return "Outlook";
  if (/iPhone|iPad/i.test(u)) return "iPhone / iPad";
  if (/Android/i.test(u)) return "Android";
  if (/Macintosh/i.test(u)) return "Mac";
  if (/Windows/i.test(u)) return "Windows";
  return u ? u.slice(0, 60) : "inconnu";
}

export type JourneySession = { visitor: string; device: string; viaEmail: boolean; startedAt: string; endedAt: string; pages: { path: string; at: string; kind: "visit" | "section" }[] };
const SESSION_GAP_MS = 30 * 60_000; // au-delà de 30 min d'inactivité, on considère que c'est une nouvelle visite

/**
 * Parcours d'un prospect sur sa maquette (2026-10-05) — reconstruit, pour affichage dans l'admin, la suite des
 * pages vues par le ou les visiteurs venus de ses courriels. Le lien se fait en deux temps :
 *  1. On repère les hachages d'IP qui ont déjà un événement rattaché à l'un de ses courriels (le clic, et la
 *     première page vue juste après, portent toujours emailId — voir trackVisitHandler).
 *  2. On regarde ensuite TOUTES les visites de son site (direct, ex. sacrecoeurcafe-demo.pages.dev, OU via le
 *     lien court /maquette-v1/<slug> sur mehdijabry.dev) qui partagent un de ces hachages, même sans emailId —
 *     app.js ne reporte ?e= que sur le tout premier chargement de page, pas sur la navigation interne au site.
 * Les visites sont regroupées en « sessions » par hachage, avec une coupure au-delà de 30 minutes d'inactivité.
 */
type EventRow = typeof trackingEventsTable.$inferSelect;

/** Condition SQL « cet événement appartient à cette maquette » — lignes normalisées (site = <slug>-demo.pages.dev)
 *  comme lignes antérieures à la normalisation (site = mehdijabry.dev, path = /maquette-v1/<slug>…). */
function siteEventsMatch(site: string) {
  const slug = site.replace(/-demo\.pages\.dev$/, "");
  return or(
    eq(trackingEventsTable.site, site),
    and(eq(trackingEventsTable.site, "mehdijabry.dev"), sql`${trackingEventsTable.path} like ${"/maquette-v1/" + slug + "%"}`),
  );
}

/** Regroupe des événements en sessions : une coupure au-delà de 30 minutes d'inactivité pour un même visiteur. */
function buildSessions(rows: EventRow[]): JourneySession[] {
  const byHash = new Map<string, EventRow[]>();
  for (const r of rows) { if (!r.ipHash) continue; const list = byHash.get(r.ipHash) ?? []; list.push(r); byHash.set(r.ipHash, list); }
  const sessions: JourneySession[] = [];
  for (const [h, evs] of byHash) {
    evs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let cur: EventRow[] = [];
    const flush = () => {
      if (!cur.length) return;
      sessions.push({
        visitor: h.slice(0, 6), device: originLabel(cur[0]!.userAgent), viaEmail: cur.some((e) => e.emailId != null || e.source === "courriel"),
        startedAt: new Date(cur[0]!.createdAt).toISOString(), endedAt: new Date(cur[cur.length - 1]!.createdAt).toISOString(),
        pages: cur.map((e) => ({ path: e.path ?? "/", at: new Date(e.createdAt).toISOString(), kind: e.kind === "section" ? "section" as const : "visit" as const })),
      });
      cur = [];
    };
    for (const e of evs) {
      if (cur.length && new Date(e.createdAt).getTime() - new Date(cur[cur.length - 1]!.createdAt).getTime() > SESSION_GAP_MS) flush();
      cur.push(e);
    }
    flush();
  }
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function prospectJourney(opts: { mockUrl: string | null; emailIds: number[] }): Promise<JourneySession[]> {
  const site = canonicalSiteFromUrl(opts.mockUrl);
  if (!site) return [];

  const known = opts.emailIds.length
    ? await db.select({ ipHash: trackingEventsTable.ipHash }).from(trackingEventsTable).where(inArray(trackingEventsTable.emailId, opts.emailIds))
    : [];
  const knownHashes = new Set(known.map((r) => r.ipHash).filter((h): h is string => Boolean(h)));
  if (!knownHashes.size) return [];

  const rows = await db.select().from(trackingEventsTable)
    .where(and(inArray(trackingEventsTable.kind, ["visit", "section"]), eq(trackingEventsTable.isBot, false), siteEventsMatch(site), await notOwnDevice()))
    .orderBy(trackingEventsTable.createdAt);
  return buildSessions(rows.filter((r) => !rowIsBot(r) && r.ipHash && knownHashes.has(r.ipHash)));
}

export type SiteStats = { site: string; label: string; visits: number; visitors: number; mobile: number; fromEmail: number; lastVisitAt: string | null; days: { day: string; visits: number }[] };
/** Visites par site démo sur les 30 derniers jours. */
export async function siteStats(): Promise<SiteStats[]> {
  const since = new Date(Date.now() - 30 * 86400 * 1000);
  const rows = await db.select().from(trackingEventsTable).where(and(eq(trackingEventsTable.kind, "visit"), eq(trackingEventsTable.isBot, false), gte(trackingEventsTable.createdAt, since), await notOwnDevice())).orderBy(desc(trackingEventsTable.createdAt)).limit(5000);
  const bySite = new Map<string, { rows: typeof rows }>();
  // Normalisation à la lecture : les visites déjà enregistrées sous « mehdijabry.dev » via le lien proxy sont
  // réattribuées à leur maquette (voir canonicalSite).
  for (const r of rows) { if (rowIsBot(r)) continue; const key = canonicalSite(r.site, r.path); if (!key) continue; const s = bySite.get(key) ?? { rows: [] }; s.rows.push(r); bySite.set(key, s); }
  // Nom du prospect plutôt que l'hôte technique : « Aura Lunosa » se lit, « auralunosa-demo.pages.dev » non.
  const { bySite: names } = await labelMaps();
  const out: SiteStats[] = [];
  for (const [site, { rows: rs }] of bySite) {
    const days = new Map<string, number>();
    for (let i = 13; i >= 0; i--) days.set(new Date(Date.now() - i * 86400 * 1000).toISOString().slice(0, 10), 0);
    for (const r of rs) { const d = new Date(r.createdAt).toISOString().slice(0, 10); if (days.has(d)) days.set(d, (days.get(d) ?? 0) + 1); }
    out.push({
      site, label: siteLabel(site, names), visits: rs.length, visitors: new Set(rs.map((r) => r.ipHash)).size,
      mobile: rs.filter((r) => /Mobile|Android|iPhone/i.test(r.userAgent ?? "")).length,
      fromEmail: rs.filter((r) => r.source === "courriel" || r.emailId != null).length,
      lastVisitAt: rs[0] ? new Date(rs[0].createdAt).toISOString() : null,
      days: [...days].map(([day, visits]) => ({ day, visits })),
    });
  }
  return out.sort((a, b) => b.visits - a.visits);
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// Suivi approfondi (2026-10-05) — panneau « Suivi » de l'admin
//
// Les notifications push disent qu'il s'est passé quelque chose ; ces deux fonctions disent QUOI. Le flux
// d'activité liste tous les événements, toutes maquettes confondues ; la fiche de maquette reconstruit, pour
// un seul site, ses visiteurs, leurs sessions, les sections qu'ils ont atteintes et d'où ils venaient.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════

export type ActivityEvent = {
  id: number; kind: "open" | "click" | "visit" | "section"; at: string; label: string;
  site: string | null; path: string | null; source: string | null; referrer: string | null;
  origin: string; visitor: string | null; viaEmail: boolean; isBot: boolean; prefetch: boolean;
  emailId: number | null; emailTo: string | null;
};

/** Noms lisibles : adresse du courriel → prospect, hôte de maquette → prospect. Chargé une fois par requête. */
async function labelMaps() {
  const prospects = await db.select({ name: prospectsTable.name, email: prospectsTable.email, mockUrl: prospectsTable.mockUrl }).from(prospectsTable);
  const byEmail = new Map<string, string>(), bySite = new Map<string, string>();
  for (const p of prospects) {
    if (p.email) byEmail.set(p.email.toLowerCase(), p.name);
    const s = canonicalSiteFromUrl(p.mockUrl);
    if (s) bySite.set(s, p.name);
  }
  return { byEmail, bySite };
}

/** Nom d'affichage d'une maquette : le prospect à qui elle est destinée, sinon son slug. */
export function siteLabel(site: string, bySite: Map<string, string>): string {
  return bySite.get(site) ?? site.replace(/-demo\.pages\.dev$/, "");
}

/**
 * Flux d'activité, le plus récent d'abord. `site` restreint à une maquette ; `includeBots` garde les robots
 * (filtres anti-pourriel, aperçus de lien) qui sont sinon masqués — ils expliquent les ouvertures fantômes.
 */
export async function recentActivity(opts: { limit?: number; site?: string | null; includeBots?: boolean } = {}): Promise<ActivityEvent[]> {
  const limit = Math.min(Math.max(opts.limit ?? 120, 1), 500);
  const conds = [opts.site ? siteEventsMatch(opts.site) : undefined, opts.includeBots ? undefined : eq(trackingEventsTable.isBot, false), await notOwnDevice()].filter(Boolean);
  const fetched = await db.select().from(trackingEventsTable)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(trackingEventsTable.createdAt)).limit(limit);
  const rows = opts.includeBots ? fetched : fetched.filter((r) => !rowIsBot(r));

  const { byEmail, bySite } = await labelMaps();
  const emailIds = [...new Set(rows.map((r) => r.emailId).filter((i): i is number => i != null))];
  const emails = emailIds.length
    ? await db.select({ id: sentEmailsTable.id, toEmail: sentEmailsTable.toEmail, createdAt: sentEmailsTable.createdAt }).from(sentEmailsTable).where(inArray(sentEmailsTable.id, emailIds))
    : [];
  const emailById = new Map(emails.map((e) => [e.id, e]));

  return rows.map((r) => {
    const email = r.emailId != null ? emailById.get(r.emailId) : undefined;
    const site = canonicalSite(r.site, r.path);
    const label = (email ? byEmail.get(email.toEmail.toLowerCase()) : undefined) ?? (site ? siteLabel(site, bySite) : null) ?? email?.toEmail ?? "inconnu";
    return {
      id: r.id, kind: r.kind as ActivityEvent["kind"], at: new Date(r.createdAt).toISOString(), label,
      site, path: r.path, source: r.source, referrer: r.referrer,
      origin: originLabel(r.userAgent), visitor: r.ipHash ? r.ipHash.slice(0, 6) : null,
      viaEmail: r.emailId != null || r.source === "courriel", isBot: rowIsBot(r),
      prefetch: Boolean(r.kind === "open" && email && isPrefetch(new Date(r.createdAt), new Date(email.createdAt))),
      emailId: r.emailId, emailTo: email?.toEmail ?? null,
    };
  });
}

export type SiteActivity = {
  site: string; label: string; prospectId: number | null; prospectName: string | null; mockUrl: string | null;
  totals: { visits: number; visitors: number; sections: number; mobile: number; fromEmail: number; opens: number; clicks: number; botHits: number };
  firstVisitAt: string | null; lastVisitAt: string | null;
  days: { day: string; visits: number }[];
  sections: { id: string; visitors: number; hits: number }[];
  pages: { path: string; hits: number }[];
  sources: { label: string; hits: number }[];
  devices: { label: string; hits: number }[];
  sessions: JourneySession[];
};

/**
 * Tout ce qu'on sait d'une maquette. Les sessions ne sont PAS limitées aux visiteurs venus du courriel (comme
 * prospectJourney) : ici on veut aussi les visites directes, c'est le but du panneau.
 */
export async function siteActivity(site: string): Promise<SiteActivity> {
  // Pas de filtre isBot en SQL ici : on veut pouvoir DIRE combien de passages de robots ont été écartés,
  // qu'ils aient été marqués à l'écriture ou reclassés à la lecture.
  const raw = await db.select().from(trackingEventsTable)
    .where(and(siteEventsMatch(site), await notOwnDevice()))
    .orderBy(trackingEventsTable.createdAt);
  const rows = raw.filter((r) => !rowIsBot(r));
  const botHits = raw.filter((r) => rowIsBot(r) && r.kind === "visit").length;

  const visits = rows.filter((r) => r.kind === "visit");
  const sections = rows.filter((r) => r.kind === "section");
  const { bySite } = await labelMaps();

  const [prospect] = await db.select({ id: prospectsTable.id, name: prospectsTable.name, mockUrl: prospectsTable.mockUrl, email: prospectsTable.email }).from(prospectsTable)
    .where(sql`${prospectsTable.mockUrl} is not null`).limit(500)
    .then((list) => list.filter((p) => canonicalSiteFromUrl(p.mockUrl) === site));

  // Ouvertures et clics des courriels envoyés à ce prospect — l'entonnoir complet, pas seulement les visites.
  let opens = 0, clicks = 0;
  if (prospect?.email) {
    const mails = await db.select({ id: sentEmailsTable.id }).from(sentEmailsTable)
      .where(and(eq(sentEmailsTable.isTest, false), sql`lower(${sentEmailsTable.toEmail}) = lower(${prospect.email})`));
    if (mails.length) {
      const tracking = await emailTracking(mails.map((m) => m.id));
      for (const t of tracking.values()) { opens += t.opens; clicks += t.clicks; }
    }
  }

  const count = <T>(items: T[], key: (t: T) => string | null) => {
    const m = new Map<string, number>();
    for (const it of items) { const k = key(it); if (!k) continue; m.set(k, (m.get(k) ?? 0) + 1); }
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const sectionVisitors = new Map<string, Set<string>>();
  for (const s of sections) { if (!s.path) continue; const set = sectionVisitors.get(s.path) ?? new Set<string>(); if (s.ipHash) set.add(s.ipHash); sectionVisitors.set(s.path, set); }

  const days = new Map<string, number>();
  for (let i = 29; i >= 0; i--) days.set(new Date(Date.now() - i * 86400 * 1000).toISOString().slice(0, 10), 0);
  for (const v of visits) { const d = new Date(v.createdAt).toISOString().slice(0, 10); if (days.has(d)) days.set(d, (days.get(d) ?? 0) + 1); }

  return {
    site, label: siteLabel(site, bySite),
    prospectId: prospect?.id ?? null, prospectName: prospect?.name ?? null, mockUrl: prospect?.mockUrl ?? null,
    totals: {
      visits: visits.length, visitors: new Set(visits.map((v) => v.ipHash)).size, sections: sections.length,
      mobile: visits.filter((v) => /Mobile|Android|iPhone/i.test(v.userAgent ?? "")).length,
      fromEmail: visits.filter((v) => v.source === "courriel" || v.emailId != null).length,
      opens, clicks, botHits,
    },
    firstVisitAt: visits[0] ? new Date(visits[0].createdAt).toISOString() : null,
    lastVisitAt: visits.length ? new Date(visits[visits.length - 1]!.createdAt).toISOString() : null,
    days: [...days].map(([day, v]) => ({ day, visits: v })),
    sections: count(sections, (s) => s.path).map(([id, hits]) => ({ id, hits, visitors: sectionVisitors.get(id)?.size ?? 0 })),
    pages: count(visits, (v) => v.path ?? "/").map(([path, hits]) => ({ path, hits })),
    sources: count(visits, (v) => (v.source === "courriel" || v.emailId != null) ? "Courriel de prospection" : v.referrer ? new URL(v.referrer, "https://x").hostname || "Lien externe" : "Accès direct").map(([label, hits]) => ({ label, hits })),
    devices: count(visits, (v) => originLabel(v.userAgent)).map(([label, hits]) => ({ label, hits })),
    sessions: buildSessions(rows.filter((r) => r.kind === "visit" || r.kind === "section")),
  };
}
