/* mehdijabry.dev — service worker de l'espace admin (portée : /admin).
 * Rôle : satisfaire les critères d'installation de Chrome (application installable sur Mac, Windows, Android).
 * Aucune mise en cache : les données de l'admin doivent toujours venir du serveur. Le gestionnaire fetch est un
 * simple passe-plat ; hors ligne, une page d'attente remplace le dinosaure de Chrome. */
const VERSION = "admin-v1";

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

void VERSION;
