import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminShell, ErrorNote, Panel } from "@/components/admin/shell";
import { api, trustedDemoUrl, type ActivityEvent, type ActivityKind, type PushNotification, type SiteActivity } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { Bell, MailOpen, MousePointerClick, Eye, ScrollText, ChevronLeft, Trash2 } from "lucide-react";

/**
 * Suivi (2026-10-05) — ce que les notifications push annoncent sans le détailler.
 *
 * Une notification reçue sur l'iPhone puis balayée ne laisse aucune trace : on sait qu'il s'est passé quelque
 * chose, mais plus quoi ni sur quelle maquette. Trois onglets répondent à ça :
 *   • Notifications — l'archive de tout ce qui a été envoyé (table push_notifications) ;
 *   • Activité — le flux brut des ouvertures, clics, visites et sections atteintes, toutes maquettes confondues ;
 *   • Maquettes — une fiche par maquette : entonnoir courriel → clic → visite, sessions, profondeur de lecture.
 * Le clic sur une notification arrive ici avec ?site=<maquette>, donc directement sur la fiche concernée.
 */

const KINDS: Record<string, { label: string; icon: typeof Eye; tone: string }> = {
  open: { label: "Ouverture", icon: MailOpen, tone: "text-sky-600 dark:text-sky-400" },
  click: { label: "Clic", icon: MousePointerClick, tone: "text-violet-600 dark:text-violet-400" },
  visit: { label: "Visite", icon: Eye, tone: "text-emerald-600 dark:text-emerald-400" },
  section: { label: "Lecture", icon: ScrollText, tone: "text-amber-600 dark:text-amber-400" },
  test: { label: "Test", icon: Bell, tone: "text-muted-foreground" },
};

const dt = (iso: string) => new Date(iso).toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
/** « il y a 4 min » — un suivi se lit en relatif, pas en horodatage. */
function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hier" : `il y a ${d} jours`;
}
const slugOf = (site: string) => site.replace(/-demo\.pages\.dev$/, "");
/** Le titre d'une notification commence par un emoji, utile sur le téléphone ; ici l'icône colorée le dit déjà. */
const withoutEmoji = (title: string) => title.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, "");

export default function AdminTracking() {
  const [tab, setTab] = useState<"notifs" | "flux" | "sites">("notifs");
  const [site, setSite] = useState<string | null>(null);
  const [kinds, setKinds] = useState<Set<ActivityKind>>(new Set());
  const [bots, setBots] = useState(false);

  // Arrivée depuis une notification push : ?site=<maquette> ouvre directement sa fiche.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("site");
    if (s) { setSite(s); setTab("sites"); }
  }, []);

  // Rafraîchissement automatique : la page est souvent ouverte juste après une alerte, l'événement doit apparaître.
  const notifs = useQuery({ queryKey: ["admin", "push-history"], queryFn: () => api.pushHistory(100), refetchInterval: 60_000 });
  const feed = useQuery({ queryKey: ["admin", "activity", bots], queryFn: () => api.activity({ limit: 200, bots }), refetchInterval: 60_000 });
  const sites = useQuery({ queryKey: ["admin", "sites"], queryFn: api.siteStats });
  const detail = useQuery({ queryKey: ["admin", "site-activity", site], queryFn: () => api.siteActivity(site!), enabled: Boolean(site) });

  const shown = useMemo(() => (feed.data ?? []).filter((e) => kinds.size === 0 || kinds.has(e.kind)), [feed.data, kinds]);
  const toggleKind = (k: ActivityKind) => setKinds((prev) => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const unseen = (notifs.data ?? []).filter((n) => Date.now() - new Date(n.at).getTime() < 24 * 3600_000).length;

  return (
    <AdminShell title="Suivi">
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        {([["notifs", `Notifications${unseen ? ` (${unseen})` : ""}`], ["flux", "Activité"], ["sites", "Maquettes"]] as const).map(([v, label]) => (
          <button key={v} onClick={() => { setTab(v); if (v !== "sites") setSite(null); }} className={cn("rounded-full px-3 py-1 border", tab === v ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground")}>{label}</button>
        ))}
      </div>

      {/* ───── Notifications ───── */}
      {tab === "notifs" && (
        <Panel>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <p className="text-xs text-muted-foreground max-w-prose">
              Tout ce qui a été envoyé sur vos appareils. Une notification balayée sur le téléphone reste ici — c'est la seule trace de ce qui a été annoncé.
            </p>
            {(notifs.data ?? []).length > 0 && (
              <button type="button" className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 shrink-0"
                onClick={() => { if (confirm("Effacer tout l'historique des notifications ?")) void api.clearPushHistory().then(() => notifs.refetch()); }}>
                <Trash2 className="w-3.5 h-3.5" /> vider
              </button>
            )}
          </div>
          {notifs.isError ? <ErrorNote error={notifs.error} onRetry={() => notifs.refetch()} /> : !notifs.data ? <p className="text-sm text-muted-foreground">Chargement…</p> : notifs.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune notification pour l'instant. Elles s'enregistrent ici dès la prochaine ouverture de courriel, clic ou visite de maquette.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notifs.data.map((n) => <NotifRow key={n.id} n={n} onSite={(s) => { setSite(s); setTab("sites"); }} />)}
            </ul>
          )}
        </Panel>
      )}

      {/* ───── Flux d'activité ───── */}
      {tab === "flux" && (
        <Panel>
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
            {(["open", "click", "visit", "section"] as const).map((k) => {
              const K = KINDS[k]!;
              return (
                <button key={k} onClick={() => toggleKind(k)} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1", kinds.has(k) ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
                  <K.icon className="w-3.5 h-3.5" /> {K.label}
                </button>
              );
            })}
            <label className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={bots} onChange={(e) => setBots(e.target.checked)} className="accent-current" /> afficher les robots
            </label>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Vos propres appareils sont exclus, ainsi que les robots (indexation, antivirus de courriel) — cochez la case pour les voir. Une « lecture » est une section de page atteinte en défilant : c'est ce qui distingue un visiteur qui a lu de quelqu'un qui a refermé tout de suite.
          </p>
          {feed.isError ? <ErrorNote error={feed.error} onRetry={() => feed.refetch()} /> : !feed.data ? <p className="text-sm text-muted-foreground">Chargement…</p> : shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun événement{kinds.size ? " de ce type" : ""} pour l'instant.</p>
          ) : (
            <ul className="divide-y divide-border">
              {shown.map((e) => <EventRow key={e.id} e={e} onSite={(s) => { setSite(s); setTab("sites"); }} />)}
            </ul>
          )}
        </Panel>
      )}

      {/* ───── Maquettes ───── */}
      {tab === "sites" && !site && (
        <Panel>
          <p className="text-xs text-muted-foreground mb-3">Une fiche par maquette : l'entonnoir complet (courriel ouvert → lien cliqué → maquette visitée), les sessions et ce que chaque visiteur a lu.</p>
          {sites.isError ? <ErrorNote error={sites.error} onRetry={() => sites.refetch()} /> : !sites.data ? <p className="text-sm text-muted-foreground">Chargement…</p> : sites.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune visite enregistrée.</p>
          ) : (
            <ul className="divide-y divide-border">
              {sites.data.map((s) => {
                const max = Math.max(1, ...s.days.map((d) => d.visits));
                return (
                  <li key={s.site}>
                    <button type="button" onClick={() => setSite(s.site)} className="w-full text-left py-3 hover:bg-muted/40 rounded-md px-2 -mx-2 transition-colors">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium truncate">{s.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{s.visits} visite{s.visits > 1 ? "s" : ""} · {s.visitors} visiteur{s.visitors > 1 ? "s" : ""}</span>
                      </div>
                      <div className="mt-1.5 flex h-5 items-end gap-px" aria-hidden>
                        {s.days.map((d) => <span key={d.day} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${Math.max(2, (d.visits / max) * 100)}%`, opacity: d.visits ? 1 : 0.25 }} title={`${d.day} : ${d.visits}`} />)}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{s.lastVisitAt ? `dernière visite ${ago(s.lastVisitAt)}` : "aucune visite"}{s.fromEmail ? ` · ${s.fromEmail} via courriel` : ""}{s.mobile ? ` · ${s.mobile} sur mobile` : ""}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      {tab === "sites" && site && (
        <>
          <button type="button" onClick={() => setSite(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" /> toutes les maquettes
          </button>
          {detail.isError ? <ErrorNote error={detail.error} onRetry={() => detail.refetch()} /> : !detail.data ? <p className="text-sm text-muted-foreground">Chargement…</p> : <SiteDetail d={detail.data} />}
        </>
      )}
    </AdminShell>
  );
}

function NotifRow({ n, onSite }: { n: PushNotification; onSite: (site: string) => void }) {
  const K = KINDS[n.kind] ?? KINDS["test"]!;
  return (
    <li className="py-3 flex gap-3">
      <K.icon className={cn("w-4 h-4 mt-0.5 shrink-0", K.tone)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-medium text-sm truncate">{withoutEmoji(n.title)}</p>
          <span className="text-[11px] text-muted-foreground shrink-0" title={dt(n.at)}>{ago(n.at)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{n.body}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {n.devices > 0 ? `reçue sur ${n.devices} appareil${n.devices > 1 ? "s" : ""}` : "aucun appareil abonné à ce moment-là"}
          {n.site && <> · <button type="button" onClick={() => onSite(n.site!)} className="text-primary hover:underline">voir la maquette</button></>}
        </p>
      </div>
    </li>
  );
}

function EventRow({ e, onSite }: { e: ActivityEvent; onSite: (site: string) => void }) {
  const K = KINDS[e.kind] ?? KINDS["test"]!;
  return (
    <li className="py-2.5 flex gap-3">
      <K.icon className={cn("w-4 h-4 mt-0.5 shrink-0", K.tone)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm truncate">
            <span className="font-medium">{e.label}</span>
            <span className="text-muted-foreground"> — {K.label.toLowerCase()}{e.kind === "section" && e.path ? ` « ${e.path} »` : ""}</span>
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0" title={dt(e.at)}>{ago(e.at)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {e.origin}
          {e.visitor && ` · visiteur ${e.visitor}`}
          {e.viaEmail && " · depuis le courriel"}
          {e.prefetch && " · préchargement (pas une lecture)"}
          {e.isBot && " · robot"}
          {e.kind === "visit" && e.path && e.path !== "/" && ` · ${e.path}`}
          {e.site && <> · <button type="button" onClick={() => onSite(e.site!)} className="text-primary hover:underline">{slugOf(e.site)}</button></>}
        </p>
      </div>
    </li>
  );
}

function SiteDetail({ d }: { d: SiteActivity }) {
  const max = Math.max(1, ...d.days.map((x) => x.visits));
  const demoUrl = trustedDemoUrl(d.mockUrl ?? `https://${d.site}`);
  // Entonnoir : chaque étape rapportée à la précédente, pour voir où ça décroche.
  const funnel = [
    { label: "Courriels ouverts", value: d.totals.opens },
    { label: "Liens cliqués", value: d.totals.clicks },
    { label: "Visites", value: d.totals.visits },
    { label: "Visiteurs", value: d.totals.visitors },
  ];
  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl">{d.label}</h2>
            <p className="text-xs text-muted-foreground">{d.site}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {demoUrl && <a href={demoUrl} target="_blank" rel="noopener" className="text-primary hover:underline">ouvrir la maquette</a>}
            {d.prospectId && <Link href="/admin/prospects" className="text-primary hover:underline">fiche prospect</Link>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {funnel.map((f) => (
            <div key={f.label} className="rounded-lg border border-border p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{f.label}</p>
              <p className="font-display text-2xl tabular-nums mt-1">{f.value}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {d.totals.sections} section{d.totals.sections > 1 ? "s" : ""} lue{d.totals.sections > 1 ? "s" : ""} · {d.totals.mobile} visite{d.totals.mobile > 1 ? "s" : ""} sur mobile · {d.totals.fromEmail} venue{d.totals.fromEmail > 1 ? "s" : ""} du courriel
          {d.firstVisitAt && ` · première visite ${dt(d.firstVisitAt)}`}
          {d.lastVisitAt && ` · dernière ${ago(d.lastVisitAt)}`}
        </p>
        {d.totals.botHits > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1">
            {d.totals.botHits} passage{d.totals.botHits > 1 ? "s" : ""} de robot écarté{d.totals.botHits > 1 ? "s" : ""} des chiffres ci-dessus — robots d'indexation et antivirus de courriel qui suivent le lien envoyé.
          </p>
        )}

        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">30 derniers jours</p>
          <div className="flex h-12 items-end gap-px" aria-hidden>
            {d.days.map((x) => <span key={x.day} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${Math.max(2, (x.visits / max) * 100)}%`, opacity: x.visits ? 1 : 0.2 }} title={`${x.day} : ${x.visits}`} />)}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Jusqu'où ils ont lu">
          {d.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune section enregistrée. La balise de défilement n'envoie un signal qu'une fois la section réellement atteinte — personne n'a encore fait défiler cette maquette.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {d.sections.map((s) => {
                const pct = d.totals.visitors ? Math.round((s.visitors / d.totals.visitors) * 100) : 0;
                return (
                  <li key={s.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate">{s.id}</span>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">{s.visitors} visiteur{s.visitors > 1 ? "s" : ""}{pct ? ` · ${pct} %` : ""}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="D'où ils viennent">
          {d.sources.length === 0 ? <p className="text-sm text-muted-foreground">Aucune visite.</p> : (
            <ul className="space-y-1.5 text-sm">
              {d.sources.map((s) => <li key={s.label} className="flex items-baseline justify-between gap-2"><span className="truncate">{s.label}</span><span className="text-xs text-muted-foreground tabular-nums">{s.hits}</span></li>)}
            </ul>
          )}
          {d.devices.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mt-4 mb-1.5">Appareils</p>
              <ul className="space-y-1.5 text-sm">
                {d.devices.map((s) => <li key={s.label} className="flex items-baseline justify-between gap-2"><span className="truncate">{s.label}</span><span className="text-xs text-muted-foreground tabular-nums">{s.hits}</span></li>)}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <Panel title={`Sessions (${d.sessions.length})`}>
        <p className="text-xs text-muted-foreground mb-3">Une session = un visiteur, avec une coupure au-delà de 30 minutes sans activité. Les pages et les sections sont dans l'ordre où elles ont été vues.</p>
        {d.sessions.length === 0 ? <p className="text-sm text-muted-foreground">Aucune session.</p> : (
          <ul className="space-y-3">
            {d.sessions.map((s, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{s.device}{s.viaEmail ? " · depuis le courriel" : ""}</p>
                  <span className="text-[11px] text-muted-foreground">visiteur {s.visitor} · {dt(s.startedAt)}</span>
                </div>
                <ol className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                  {s.pages.map((p, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="tabular-nums shrink-0">{new Date(p.at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="truncate">{p.kind === "section" ? <>a défilé jusqu'à « {p.path} »</> : <>a ouvert {p.path}</>}</span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
