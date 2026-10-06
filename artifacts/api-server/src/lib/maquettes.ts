import { eq } from "drizzle-orm";
import { db, adminSettingsTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * État des maquettes (2026-10-06) — ce que l'admin peut changer sur une maquette sans toucher au code.
 *
 * Le catalogue (quelle maquette existe, où elle est hébergée) reste dans demo-redirect.ts : ajouter une
 * maquette, c'est ajouter une ligne à DEMOS et déployer, comme avant. Ce module ne porte que l'ÉTAT :
 * une maquette « suspendue » n'est plus servie par mehdijabry.dev/maquette-v1/<slug> — le seul lien
 * qu'un prospect ait jamais reçu — et affiche à la place une page « retirée ». Le projet Cloudflare
 * Pages, lui, n'est pas touché : rien n'est détruit, et remettre en ligne est instantané.
 *
 * L'état vit dans admin_settings sous la clé « maquettes » (un objet { slug → état }), pour ne pas
 * ajouter une table à synchroniser dans ensureAdminSchema(). Il est lu à chaque requête proxifiée, donc
 * mis en cache 30 secondes ; une écriture depuis l'admin vide le cache aussitôt.
 */
export type MaquetteState = { suspendedAt: string | null; reason: string | null };
export type MaquetteStates = Record<string, MaquetteState>;

const KEY = "maquettes";
const TTL_MS = 30_000;
let cache: { at: number; states: MaquetteStates } | null = null;

/** Lit l'état de toutes les maquettes. Si la base ne répond pas, renvoie l'état vide : une maquette ne
 *  disparaît jamais à cause d'une panne — ne pas servir le site d'un prospect serait pire qu'ignorer une
 *  suspension pendant trente secondes. */
export async function loadMaquetteStates(): Promise<MaquetteStates> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.states;
  try {
    const rows = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, KEY)).limit(1);
    const states = (rows[0]?.value ?? {}) as MaquetteStates;
    cache = { at: Date.now(), states };
    return states;
  } catch (err) {
    logger.warn({ err }, "maquettes: état illisible, on sert tout");
    return cache?.states ?? {};
  }
}

export async function isMaquetteSuspended(slug: string): Promise<boolean> {
  const states = await loadMaquetteStates();
  return Boolean(states[slug]?.suspendedAt);
}

/** Suspend ou remet en ligne une maquette. `reason` n'est gardée que pour une suspension. */
export async function setMaquetteState(slug: string, suspended: boolean, reason: string | null): Promise<MaquetteState> {
  const rows = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, KEY)).limit(1);
  const states = { ...((rows[0]?.value ?? {}) as MaquetteStates) };
  const next: MaquetteState = suspended
    ? { suspendedAt: states[slug]?.suspendedAt ?? new Date().toISOString(), reason: reason?.trim() || null }
    : { suspendedAt: null, reason: null };
  if (next.suspendedAt) states[slug] = next; else delete states[slug];
  await db.insert(adminSettingsTable).values({ key: KEY, value: states })
    .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value: states, updatedAt: new Date() } });
  cache = null;
  return next;
}

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

/**
 * La page servie à la place d'une maquette suspendue — pour une personne comme pour un robot d'aperçu
 * de lien, qui lira ce titre plutôt que celui du site retiré. Statut 410 : la ressource a existé et a
 * été retirée volontairement, ce que les moteurs comprennent comme définitif.
 */
export function suspendedHtml(title: string): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — maquette retirée</title>
<meta name="robots" content="noindex">
<meta property="og:title" content="${esc(title)} — maquette retirée">
<meta property="og:description" content="Cette proposition de site n'est plus en ligne. Mehdi Jabry — Independent Web Studio.">
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f1ea;color:#16161a;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif}
  main{max-width:520px;padding:40px 28px;text-align:center}
  h1{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:30px;line-height:1.2;margin:0 0 14px}
  p{margin:0 0 10px;color:#4c4a45}
  a{color:#a9712c}
</style></head><body><main>
<p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8a857d">mehdijabry.dev</p>
<h1>Cette maquette n'est plus en ligne.</h1>
<p>La proposition de site préparée pour <strong>${esc(title)}</strong> a été retirée.</p>
<p>Si vous l'aviez demandée ou si vous souhaitez en parler : <a href="https://mehdijabry.dev/">mehdijabry.dev</a>.</p>
</main></body></html>`;
}
