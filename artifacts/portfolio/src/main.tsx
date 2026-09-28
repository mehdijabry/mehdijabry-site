import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/lib/pwa-install"; // capture l'événement d'installation de l'espace admin avant le montage de React

// Espace admin installable : service worker passe-plat (aucune mise en cache) limité à /admin — voir public/admin-sw.js.
if ("serviceWorker" in navigator && location.pathname.startsWith("/admin")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch((err) => console.warn("[admin] service worker :", err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
