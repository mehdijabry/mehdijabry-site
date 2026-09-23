import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Users, Mail, Settings, LayoutDashboard, LogOut, ExternalLink } from "lucide-react";
import { api, AdminApiError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/factures", label: "Factures", icon: FileText },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/courriels", label: "Courriels", icon: Mail },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

function Login({ configured }: { configured: boolean }) {
  const qc = useQueryClient();
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

export function AdminShell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const [location] = useLocation();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["admin", "me"], queryFn: api.me, retry: false, staleTime: 60_000 });

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
            <button onClick={logout} className="lg:hidden text-sm text-muted-foreground inline-flex items-center gap-1"><LogOut className="w-4 h-4" /> Quitter</button>
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
            <button onClick={logout} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Se déconnecter</button>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <h1 className="font-display text-3xl tracking-tight">{title}</h1>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
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
