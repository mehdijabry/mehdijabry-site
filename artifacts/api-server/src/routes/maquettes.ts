import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, prospectsTable } from "@workspace/db";
import { DEMOS } from "../lib/demo-redirect";
import { loadMaquetteStates, setMaquetteState } from "../lib/maquettes";
import { siteStats, canonicalSiteFromUrl, PUBLIC_BASE_URL } from "../lib/tracking";

/**
 * Maquettes (2026-10-06) — /api/admin/maquettes. Monté derrière requireAdmin par routes/admin.ts.
 * Toutes les maquettes construites, telles que le proxy les connaît (DEMOS), avec leur état, le prospect
 * qu'elles servent et leurs visites des 30 derniers jours. Une maquette se suspend ou se remet en ligne ici.
 */
const router: IRouter = Router();

export type MaquetteSummary = {
  slug: string; title: string; target: string; proxyUrl: string; adminProxyUrl: string;
  suspended: boolean; suspendedAt: string | null; reason: string | null;
  prospect: { id: number; name: string; status: string } | null;
  visits: number; visitors: number; lastVisitAt: string | null;
};

router.get("/", async (_req, res) => {
  const [states, prospects, sites] = await Promise.all([
    loadMaquetteStates(),
    db.select({ id: prospectsTable.id, name: prospectsTable.name, status: prospectsTable.status, mockUrl: prospectsTable.mockUrl }).from(prospectsTable),
    siteStats().catch(() => []),
  ]);
  // Le prospect d'une maquette : celui dont le mockUrl, normalisé, est l'hôte de cette maquette.
  const bySite = new Map<string, { id: number; name: string; status: string }>();
  for (const p of prospects) { const s = canonicalSiteFromUrl(p.mockUrl); if (s && !bySite.has(s)) bySite.set(s, { id: p.id, name: p.name, status: p.status }); }
  const list: MaquetteSummary[] = Object.entries(DEMOS).map(([slug, d]) => {
    const site = `${slug}-demo.pages.dev`;
    const st = states[slug], stats = sites.find((s) => s.site === site);
    return {
      slug, title: d.title, target: d.target,
      proxyUrl: `${PUBLIC_BASE_URL}/maquette-v1/${slug}`, adminProxyUrl: `${PUBLIC_BASE_URL}/maquette-v1/${slug}/admin`,
      suspended: Boolean(st?.suspendedAt), suspendedAt: st?.suspendedAt ?? null, reason: st?.reason ?? null,
      prospect: bySite.get(site) ?? null,
      visits: stats?.visits ?? 0, visitors: stats?.visitors ?? 0, lastVisitAt: stats?.lastVisitAt ?? null,
    };
  });
  // La plus récente en premier : DEMOS est rempli dans l'ordre où les maquettes ont été construites.
  res.json(list.reverse());
});

const StateSchema = z.object({ suspended: z.boolean(), reason: z.string().max(300).optional().nullable() });

router.put("/:slug", async (req, res) => {
  const slug = String(req.params["slug"] ?? "").toLowerCase().trim();
  if (!DEMOS[slug]) { res.status(404).json({ error: "Maquette inconnue" }); return; }
  const parsed = StateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "État invalide", details: parsed.error.issues }); return; }
  const state = await setMaquetteState(slug, parsed.data.suspended, parsed.data.reason ?? null);
  res.json({ slug, suspended: Boolean(state.suspendedAt), suspendedAt: state.suspendedAt, reason: state.reason });
});

export default router;
