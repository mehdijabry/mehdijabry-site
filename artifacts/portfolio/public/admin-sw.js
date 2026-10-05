/* mehdijabry.dev — service worker de l'espace admin (portée : /admin).
 * Rôle : satisfaire les critères d'installation de Chrome (application installable sur Mac, Windows, Android).
 * Aucune mise en cache : les données de l'admin doivent toujours venir du serveur. Le gestionnaire fetch est un
 * simple passe-plat ; hors ligne, une page d'attente remplace le dinosaure de Chrome. */
const VERSION = "admin-v2";

self.addEventListener("install", (event) => { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", (event) => { event.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => {
    if (event.request.mode === "navigate") {
      return new Response(
        '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin · hors ligne</title>' +
        '<div style="font-family:system-ui,sans-serif;padding:48px;text-align:center;color:#11110F"><p style="letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#777">mehdijabry.dev</p>' +
        '<h1 style="font-weight:600">Espace admin hors ligne</h1><p>Aucune connexion pour le moment. Réessayez une fois le réseau revenu.</p>' +
        '<p><a href="/admin" style="color:#B08D57">Recharger</a></p></div>',
        { headers: { "content-type": "text/html; charset=utf-8" } },
      );
    }
    return new Response("", { status: 504 });
  }));
});

// Notifications push (2026-10-05) : ouverture de courriel, clic, visite de maquette — voir lib/push.ts côté
// serveur et src/lib/push-notifications.ts côté client (abonnement). Le clic sur la notification ramène au
// panneau Prospects, ou fronte un onglet déjà ouvert plutôt que d'en empiler un nouveau.
self.addEventListener("push", (event) => {
  let data = { title: "mehdijabry.dev", body: "" };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (err) { /* payload non-JSON, on garde le texte brut */ data.body = event.data ? event.data.text() : ""; }
  event.waitUntil(self.registration.showNotification(data.title || "mehdijabry.dev", {
    body: data.body || "",
    icon: "/admin-icon-192.png",
    badge: "/admin-icon-192.png",
    tag: data.tag || "default",
    data: { url: data.url || "/admin" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) { if (client.url.startsWith(self.location.origin) && "focus" in client) { client.navigate(target); return client.focus(); } }
      return self.clients.openWindow(target);
    }),
  );
});

void VERSION;
