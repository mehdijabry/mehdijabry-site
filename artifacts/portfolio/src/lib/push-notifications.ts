// Notifications push de l'espace admin (2026-10-05) : ouverture d'un courriel, clic, visite d'une maquette.
// Sur iPhone, l'API Push de Safari n'existe que dans une PWA installée sur l'écran d'accueil (iOS 16.4+) — voir
// isStandalone() dans pwa-install.ts. Le bouton d'activation doit donc rester caché tant que ce n'est pas le cas.
import { useEffect, useState } from "react";
import { api } from "./admin-api";

const urlBase64ToUint8Array = (base64: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function usePushSubscription() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    pushSupported() ? Notification.permission : "unsupported",
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pushSupported()) return;
    navigator.serviceWorker.getRegistration("/admin").then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    }).catch(() => {});
  }, []);

  async function subscribe() {
    if (!pushSupported()) return;
    setBusy(true); setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") { setError("Notifications refusées — autorisez-les dans Réglages > Notifications pour l'app."); return; }
      const { configured, key } = await api.pushPublicKey();
      if (!configured || !key) { setError("Non configuré côté serveur (clé VAPID manquante)."); return; }
      // Déjà enregistré par main.tsx au chargement — on l'attend plutôt que de le réenregistrer.
      const reg = await navigator.serviceWorker.getRegistration("/admin") ?? await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" });
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) as BufferSource });
      await api.pushSubscribe(sub.toJSON() as PushSubscriptionJSON);
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Abonnement impossible");
    } finally { setBusy(false); }
  }

  async function unsubscribe() {
    if (!pushSupported()) return;
    setBusy(true); setError(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/admin");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) { await sub.unsubscribe(); await api.pushUnsubscribe(sub.endpoint); }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Désabonnement impossible");
    } finally { setBusy(false); }
  }

  return { supported: pushSupported(), permission, subscribed, busy, error, subscribe, unsubscribe };
}
