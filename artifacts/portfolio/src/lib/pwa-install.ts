// Installation de l'espace admin comme application (PWA) — Chrome/Edge sur Mac, Windows et Android.
// Le navigateur émet `beforeinstallprompt` très tôt, souvent avant le montage de React : ce module, importé
// depuis main.tsx, capture l'événement au chargement puis le met à disposition du bouton « Installer ».
import { useEffect, useReducer } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // pas de mini-bannière automatique sur mobile ; l'icône d'installation de la barre d'adresse reste
    deferred = e as BeforeInstallPromptEvent;
    document.documentElement.dataset.install = "ready"; // repère de diagnostic : Chrome juge l'admin installable
    notify();
  });
  window.addEventListener("appinstalled", () => { deferred = null; document.documentElement.dataset.install = "done"; notify(); });
}

/** Vrai quand la page tourne déjà dans la fenêtre de l'application installée. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function useInstallPrompt() {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => { listeners.add(rerender); return () => { listeners.delete(rerender); }; }, []);
  return {
    canInstall: deferred !== null && !isStandalone(),
    async install() {
      const ev = deferred; if (!ev) return;
      await ev.prompt();
      const { outcome } = await ev.userChoice;
      if (outcome === "accepted") { deferred = null; notify(); }
    },
  };
}
