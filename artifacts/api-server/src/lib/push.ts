import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Notifications push sur navigateur (2026-10-05) — alerte l'iPhone de Mehdi (admin installé depuis Safari, voir
 * pwa-install.ts) dès qu'un courriel de prospection est ouvert, qu'un lien est cliqué, ou qu'une maquette reçoit
 * une nouvelle visite. Déclenché depuis lib/tracking.ts, jamais bloquant pour la réponse au pixel/redirection.
 * Variables Render à poser : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (générées avec `npx web-push generate-vapid-keys`).
 */
const PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"];
const PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"];
const SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:contact@mehdijabry.dev";
export const pushConfigured = Boolean(PUBLIC_KEY && PRIVATE_KEY);
export const vapidPublicKey = PUBLIC_KEY ?? null;

if (pushConfigured) webpush.setVapidDetails(SUBJECT, PUBLIC_KEY!, PRIVATE_KEY!);

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

/** Envoie à tous les appareils abonnés ; retire silencieusement ceux que le navigateur a désabonnés (410/404). */
export async function sendPush(payload: PushPayload): Promise<void> {
  if (!pushConfigured) return;
  try {
    const subs = await db.select().from(pushSubscriptionsTable);
    await Promise.all(subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload));
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, s.endpoint));
        } else {
          logger.warn({ err, endpoint: s.endpoint }, "push send failed");
        }
      }
    }));
  } catch (err) { logger.warn({ err }, "sendPush failed"); }
}
