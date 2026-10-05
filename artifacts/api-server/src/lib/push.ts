import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db, pushSubscriptionsTable, pushNotificationsTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Notifications push sur navigateur (2026-10-05) — alerte l'iPhone de Mehdi (admin installé depuis Safari, voir
 * pwa-install.ts) dès qu'un courriel de prospection est ouvert, qu'un lien est cliqué, ou qu'une maquette reçoit
 * une nouvelle visite. Déclenché depuis lib/tracking.ts, jamais bloquant pour la réponse au pixel/redirection.
 * Variables Render à poser : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (générées avec `npx web-push generate-vapid-keys`).
 *
 * Chaque envoi est ARCHIVÉ dans push_notifications : une notification balayée sur le téléphone est sinon perdue
 * — on sait qu'il s'est passé quelque chose, mais plus quoi. Le panneau « Suivi » de l'admin relit cet historique.
 * L'archive est écrite même quand aucun appareil n'est abonné (devices = 0) : l'événement a bien eu lieu.
 */
const PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"];
const PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"];
const SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:contact@mehdijabry.dev";
export const pushConfigured = Boolean(PUBLIC_KEY && PRIVATE_KEY);
export const vapidPublicKey = PUBLIC_KEY ?? null;

if (pushConfigured) webpush.setVapidDetails(SUBJECT, PUBLIC_KEY!, PRIVATE_KEY!);

export type PushPayload = {
  title: string; body: string; url?: string; tag?: string;
  /** Pour l'historique : à quoi se rattache l'alerte. `kind` reprend le `tag` par défaut. */
  kind?: string; site?: string | null; emailId?: number | null; prospectId?: number | null;
};

/**
 * Envoie à tous les appareils abonnés, puis archive l'alerte.
 * Les appareils que le navigateur a désabonnés (404/410) sont retirés silencieusement.
 */
export async function sendPush(payload: PushPayload): Promise<void> {
  const { title, body, url, tag, kind, site, emailId, prospectId } = payload;
  let devices = 0;
  try {
    if (pushConfigured) {
      const subs = await db.select().from(pushSubscriptionsTable);
      const results = await Promise.all(subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title, body, url, tag }));
          return true;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, s.endpoint));
          } else {
            logger.warn({ err, endpoint: s.endpoint }, "push send failed");
          }
          return false;
        }
      }));
      devices = results.filter(Boolean).length;
    }
  } catch (err) { logger.warn({ err }, "sendPush failed"); }

  try {
    await db.insert(pushNotificationsTable).values({
      kind: kind ?? tag ?? "info", title, body, url: url ?? null,
      site: site ?? null, emailId: emailId ?? null, prospectId: prospectId ?? null, devices,
    });
  } catch (err) { logger.warn({ err }, "push history insert failed"); }
}
