import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Users, Mail, Settings, LayoutDashboard, LogOut, ExternalLink, Target, MonitorDown, RefreshCw, Bell, BellOff, Activity } from "lucide-react";
import { api, AdminApiError } from "@/lib/admin-api";
import { useInstallPrompt } from "@/lib/pwa-install";
import { usePushSubscription } from "@/lib/push-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/prospects", label: "Prospects", icon: Target },
  { href: "/admin/suivi", label: "Suivi", icon: Activity },
  { href: "/admin/factures", label: "Factures", icon: FileText },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/courriels", label: "Courriels", icon: Mail },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

function Login({ configured }: { configured: boolean }) {
  const qc = useQueryClient();
  const pwa = useInstallPrompt();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    try { await api.login(password); await qc.invalidateQueries({ queryKey: ["admin", "me"] }); }
    catch (err) { setError(err instanceof AdminApiError ? err.message : "Connexion impossible"); }
    finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">mehdijabry.dev</p>
          <h1 className="font-display text-2xl mt-1">Espace admin</h1>
        </div>
        {!configured ? (
          <p className="text-sm text-destructive">Le mot de passe admin n'est pas configuré sur le serveur. Définissez la variable d'environnement <code className="font-mono">ADMIN_PASSWORD</code> puis redéployez.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="pw">Mot de passe</Label>
              <Input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || !password}>{busy ? "Connexion…" : "Se connecter"}</Button>
          </>
        )}
        {pwa.canInstall && (
          <button type="button" onClick={() => pwa.install()} className="w-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"><MonitorDown className="w-3.5 h-3.5" /> Installer l'application sur cet ordinateur</button>
        )}
      </form>
    </div>
  );
}

/** Visible failure state for a query — the admin must never sit on « Chargement… » when the API errored. */
export function ErrorNote({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  const message = error instanceof Error ? error.message : "Erreur inconnue";
  return (
    <div role="alert" className={cn("rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm", className)}>
      <p className="font-medium text-destructive">Impossible de charger les données</p>
      <p className="mt-1 text-muted-foreground break-words">{message}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>Réessayer</Button>}
    </div>
  );
}

/**
 * Recharge les données de la page affichée. `refetchQueries({ type: "active" })` ne touche qu'aux requêtes
 * effectivement montées : on ne réveille pas les écrans qu'on ne regarde pas. Utile surtout pour les compteurs
 * de visites et d'ouvertures de courriels, qui bougent sans qu'on recharge la page.
 */
function RefreshButton() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [lastAt, setLastAt] = useState<Date | null>(null);
  async function refresh() {
    if (busy) return;
    setBusy(true);
    try { await qc.refetchQueries({ type: "active" }); setLastAt(new Date()); }
    finally { setBusy(false); }
  }
  const time = lastAt ? lastAt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) : null;
  return (
    <div className="inline-flex items-center gap-2">
      {time && <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums" aria-live="polite">à jour à {time}</span>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={refresh}
        disabled={busy}
        title="Recharger les données de cette page"
      >
        <RefreshCw className={cn("w-4 h-4", busy && "animate-spin")} aria-hidden="true" />
        <span className="ml-1.5">{busy ? "Actualisation…" : "Actualiser"}</span>
      </Button>
    </div>
  );
}

export function AdminShell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const [location] = useLocation();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["admin", "me"], queryFn: api.me, retry: false, staleTime: 60_000 });
  const pwa = useInstallPrompt();
  // Notifications push (2026-10-05) : visible seulement là où l'API Push existe — sur iPhone, ça veut dire une
  // fois l'admin installé sur l'écran d'accueil et ouvert depuis là (iOS n'expose PushManager qu'en mode standalone).
  const push = usePushSubscription();
  const toggleNotifications = () => (push.subscribed ? push.unsubscribe() : push.subscribe());

  if (me.isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Chargement…</div>;
  if (!me.data?.authenticated) return <Login configured={me.data?.configured ?? true} />;

  async function logout() { await api.logout(); await qc.invalidateQueries({ queryKey: ["admin"] }); }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:flex lg:gap-8">
        <aside className="lg:w-56 shrink-0 mb-6 lg:mb-0">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">mehdijabry.dev</p>
              <p className="font-display text-xl">Admin</p>
            </div>
            <div className="lg:hidden flex items-center gap-4 text-sm text-muted-foreground">
              {pwa.canInstall && <button onClick={() => pwa.install()} className="inline-flex items-center gap-1"><MonitorDown className="w-4 h-4" /> Installer</button>}
              {push.supported && <button onClick={toggleNotifications} disabled={push.busy} title={push.error ?? undefined} className="inline-flex items-center gap-1">{push.subscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />} {push.subscribed ? "Notifs" : "Notifier"}</button>}
              <button onClick={logout} className="inline-flex items-center gap-1"><LogOut className="w-4 h-4" /> Quitter</button>
            </div>
          </div>
          <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.map((n) => {
              const active = n.exact ? location === n.href : location.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={cn("inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors", active ? "bg-primary/15 text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <n.icon className="w-4 h-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden lg:block mt-8 space-y-2 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Voir le site</a><br />
            {pwa.canInstall && (
              <><button onClick={() => pwa.install()} title="Ajouter l'espace admin au Dock, comme une application" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><MonitorDown className="w-3.5 h-3.5" /> Installer l'application</button><br /></>
            )}
            {push.supported && (
              <><button onClick={toggleNotifications} disabled={push.busy} title={push.error ?? "Alerte à chaque ouverture de courriel, clic et visite de maquette"} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">{push.subscribed ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />} {push.busy ? "…" : push.subscribed ? "Désactiver les notifications" : "Activer les notifications"}</button><br /></>
            )}
            <button onClick={logout} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Se déconnecter</button>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h1 className="font-display text-3xl tracking-tight">{title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <RefreshButton />
              {actions}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)}>
      {title && <h2 className="font-medium mb-4">{title}</h2>}
      {children}
    </section>
  );
}
