import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell, ErrorNote, Field, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, shortDate, type ProposalInput } from "@/lib/admin-api";

const TEMPLATES: Array<{ key: string; label: string; subject: string; text: string }> = [
  {
    key: "maquette",
    label: "Proposition de maquette",
    subject: "Une maquette de site web pour {entreprise}",
    text: `Bonjour,

Je m'appelle Mehdi Jabry, développeur web indépendant à Trois-Rivières. En regardant votre fiche Google, j'ai vu que le lien vers votre site ne fonctionne plus, alors que vos avis, vos photos et votre menu méritent une vraie vitrine en ligne.

J'ai pris la liberté de préparer une maquette complète pour {entreprise}, avec vos horaires, votre menu et vos avis, que vous pouvez consulter ici :
{lien}

Si elle vous plaît, je la mets en ligne sur votre propre domaine en 72 heures, prête pour Google et les téléphones, pour un montant fixe convenu à l'avance. Si elle ne vous convient pas, aucun engagement : vous n'aurez rien perdu.

Je peux passer vous la montrer sur place quand ça vous arrange.

Au plaisir,
Mehdi Jabry
Développeur web indépendant — Trois-Rivières
mehdijabry.dev · contact@mehdijabry.dev`,
  },
  {
    key: "relance",
    label: "Relance courtoise",
    subject: "Petit suivi — votre maquette de site web",
    text: `Bonjour,

Je me permets un court suivi au sujet de la maquette de site que je vous ai envoyée la semaine dernière ({lien}).

Si vous avez des questions, ou si vous préférez que je passe vous la montrer, dites-moi simplement le moment qui vous convient.

Bonne journée,
Mehdi Jabry
mehdijabry.dev · contact@mehdijabry.dev`,
  },
  {
    key: "libre",
    label: "Courriel libre",
    subject: "",
    text: "",
  },
];

export default function AdminEmails() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const history = useQuery({ queryKey: ["admin", "emails"], queryFn: api.emails });
  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: api.settings });
  const [to, setTo] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState(TEMPLATES[0]!.subject);
  const [text, setText] = useState(TEMPLATES[0]!.text);
  const [vars, setVars] = useState({ entreprise: "", lien: "" });

  const fill = (s: string) => s.replace(/\{entreprise\}/g, vars.entreprise || "{entreprise}").replace(/\{lien\}/g, vars.lien || "{lien}");
  const ready = to && subject && text && !/\{(entreprise|lien)\}/.test(fill(subject) + fill(text));

  const send = useMutation({
    mutationFn: () => api.sendEmail({ to, toName: toName || null, subject: fill(subject), text: fill(text) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "emails"] }); toast({ title: `Courriel envoyé à ${to}` }); },
    onError: (e) => toast({ title: "Envoi impossible", description: String((e as Error).message), variant: "destructive" }),
  });

  return (
    <AdminShell title="Courriels">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
        <ProposalPanel defaultPhone={settings.data?.phone || "438 525-7119"} />
        <Panel title={`Nouveau courriel — envoyé depuis ${settings.data?.emailFromName ?? "Mehdi Jabry"} <${settings.data?.emailFrom ?? "contact@mehdijabry.dev"}>`}>
          <div className="flex flex-wrap gap-2 mb-4">
            {TEMPLATES.map((t) => (
              <button key={t.key} type="button" onClick={() => { setSubject(t.subject); setText(t.text); }} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:border-foreground">{t.label}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Destinataire *"><Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="proprietaire@restaurant.com" /></Field>
            <Field label="Nom du destinataire"><Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Seau de Crabe Trois-Rivières" /></Field>
            <Field label="Variable {entreprise}"><Input value={vars.entreprise} onChange={(e) => setVars({ ...vars, entreprise: e.target.value })} placeholder="Seau de Crabe" /></Field>
            <Field label="Variable {lien}"><Input value={vars.lien} onChange={(e) => setVars({ ...vars, lien: e.target.value })} placeholder="https://seaudecrabe-demo.pages.dev" /></Field>
            <Field label="Objet *" className="sm:col-span-2"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
            <Field label="Message *" className="sm:col-span-2" hint="Texte brut : les paragraphes et les liens sont mis en forme automatiquement. Les variables entre accolades sont remplacées à l'envoi."><Textarea rows={14} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-[13px]" /></Field>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={() => send.mutate()} disabled={!ready || send.isPending}>{send.isPending ? "Envoi…" : "Envoyer"}</Button>
            {!ready && (to || subject) && <span className="text-xs text-muted-foreground">Remplissez le destinataire, l'objet, le message et les variables utilisées.</span>}
          </div>
          {(vars.entreprise || vars.lien) && (
            <details className="mt-4 text-sm"><summary className="cursor-pointer text-muted-foreground">Aperçu du texte final</summary><pre className="mt-2 whitespace-pre-wrap font-sans text-sm bg-muted/50 rounded-md p-3">{fill(text)}</pre></details>
          )}
        </Panel>
        </div>
        <Panel title="Historique" className="p-0 overflow-hidden">
          {history.isLoading ? <p className="p-5 text-sm text-muted-foreground">Chargement…</p> : history.isError ? <ErrorNote error={history.error} onRetry={() => history.refetch()} className="m-4" /> : (history.data ?? []).length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucun courriel envoyé pour l'instant.</p>
          ) : (
            <ul className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto">
              {(history.data ?? []).map((m) => (
                <li key={m.id} className="p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium truncate">{m.toName || m.toEmail}</span>
                    <span className={`text-xs shrink-0 ${m.status === "envoyé" ? "text-emerald-600" : "text-destructive"}`}>{m.status}</span>
                  </div>
                  <div className="text-muted-foreground truncate">{m.subject}</div>
                  <div className="text-xs text-muted-foreground">{shortDate(m.createdAt)}{m.invoiceId ? " · facture" : ""}{m.error ? ` · ${m.error}` : ""} · <a href={`/api/admin/emails/${m.id}/html`} target="_blank" rel="noopener" className="text-primary hover:underline">Voir le courriel ↗</a></div>
                  {m.status === "envoyé" && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.tracking.opens > 0 ? <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300" title={`Première ouverture ${shortDate(m.tracking.firstOpenedAt!)}`}>Ouvert ×{m.tracking.opens}</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Pas encore ouvert</span>}
                      {m.tracking.clicks > 0 && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium" title={`Premier clic ${shortDate(m.tracking.firstClickedAt!)}`}>Cliqué ×{m.tracking.clicks}</span>}
                      {m.tracking.visits > 0 && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">Maquette visitée ×{m.tracking.visits}</span>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}

const PROPOSAL_DEFAULTS: ProposalInput = {
  toName: "", business: "Seau de Crabe Trois-Rivières", city: "Trois-Rivières", siteUrl: "https://seaudecrabe-demo.pages.dev",
  previewImageUrl: "https://seaudecrabe-demo.pages.dev/img/apercu-courriel.jpg", brokenDomain: "seaudecrabe.com", googleRating: "4,7",
  googleReviews: 324, searchPhrase: "seafood boil Trois-Rivières", price: 600, newDomain: "seau2crab.com", newDomainPrice: 100,
  newDomainYears: 3, deliveryHours: 48, forwardToFranchisee: false, phone: "", variant: "plain",
  headline: "", problemText: "", ownDomain: "", extraBullets: "", adminUrl: "", adminPassword: "", subject: "",
};

/** Préréglages par prospect : on charge, on ajuste, on envoie. */
const PROSPECTS: Array<{ label: string; values: Partial<ProposalInput> }> = [
  { label: "Seau de Crabe", values: { ...PROPOSAL_DEFAULTS, phone: "" } },
  {
    label: "Le Bette",
    values: {
      toName: "Jo-Annie et Hubert", business: "Le Bette", city: "Trois-Rivières", siteUrl: "https://lebette-demo.pages.dev",
      previewImageUrl: "https://lebette-demo.pages.dev/img/apercu-courriel.jpg", brokenDomain: "", ownDomain: "lebette.com",
      googleRating: "4,8", googleReviews: 425, searchPhrase: "restaurant tapas Trois-Rivières", price: 600,
      newDomain: "", newDomainPrice: "", newDomainYears: "", deliveryHours: 48, forwardToFranchisee: false, variant: "plain",
      headline: "Vos clients cherchent votre menu et vos horaires — votre site ne les montre pas.",
      problemText: "En regardant votre site après votre fiche Google, j'ai remarqué qu'il ne montre ni vos horaires, ni votre menu autrement qu'en PDF, ni vos photos — et qu'un texte de remplissage (« à remplacer ») y est encore visible. Avec 425 avis et une note de 4,8, votre cuisine mérite une vitrine à sa hauteur.",
      extraBullets: "Un espace d'administration simple : vous changez un plat, un prix, vos horaires ou annoncez une soirée vous-même, depuis votre téléphone\nLa réservation en ligne intégrée, confirmée à l'instant, sans frais par couvert — et vos clients gardent Restomontreal s'ils y tiennent",
      adminUrl: "https://lebette-demo.pages.dev/admin/", adminPassword: "bette-demo",
    },
  },
];

/** Gabarit HTML « proposition de site clés en main » : aperçu dans un onglet, test à soi-même, puis envoi au prospect. */
function ProposalPanel({ defaultPhone }: { defaultPhone: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [p, setP] = useState<ProposalInput>({ ...PROPOSAL_DEFAULTS, phone: defaultPhone });
  const [to, setTo] = useState("");
  const [bcc, setBcc] = useState("");
  const [isTest, setIsTest] = useState(true);
  const set = <K extends keyof ProposalInput>(k: K) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP({ ...p, [k]: e.target.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value });
  const send = useMutation({
    mutationFn: () => api.sendProposal({ ...p, to, isTest, bcc: bcc || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "emails"] }); toast({ title: `${isTest ? "Test envoyé" : "Proposition envoyée"} à ${to}` }); },
    onError: (e) => toast({ title: "Envoi impossible", description: String((e as Error).message), variant: "destructive" }),
  });
  const ready = Boolean(to && p.business && p.city && p.siteUrl && p.price !== "" && p.phone);
  return (
    <Panel title="Proposition de site clés en main — gabarit HTML (bouton, aperçu du site, offre)">
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <span className="text-muted-foreground">Charger un prospect :</span>
        {PROSPECTS.map((pr) => (
          <button key={pr.label} type="button" onClick={() => setP({ ...PROPOSAL_DEFAULTS, ...pr.values, phone: p.phone || defaultPhone })} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground hover:border-foreground">{pr.label}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Destinataire *"><Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="info@seaudecrabe.com" /></Field>
        <Field label="Prénom / nom (salutation)" hint="Vide = « Bonjour, »"><Input value={p.toName} onChange={set("toName")} /></Field>
        <Field label="Copie cachée (Cci)" hint="Pour recevoir un exemplaire exact de ce qui part"><Input type="email" value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="vous@gmail.com" /></Field>
        <Field label="Entreprise *"><Input value={p.business} onChange={set("business")} /></Field>
        <Field label="Ville *"><Input value={p.city} onChange={set("city")} /></Field>
        <Field label="Lien de la maquette *"><Input value={p.siteUrl} onChange={set("siteUrl")} /></Field>
        <Field label="Image d'aperçu (URL)" hint="Capture du site, ≈1200 px de large ; vide = pas d'image"><Input value={p.previewImageUrl} onChange={set("previewImageUrl")} /></Field>
        <Field label="Domaine mort sur la fiche Google" hint="Vide si leur site fonctionne"><Input value={p.brokenDomain} onChange={set("brokenDomain")} /></Field>
        <Field label="Domaine qu'ils possèdent déjà" hint="Ex. lebette.com — remplace l'option « nouveau domaine »"><Input value={p.ownDomain} onChange={set("ownDomain")} /></Field>
        <Field label="Objet du courriel" className="sm:col-span-2" hint="Vide = objet automatique : « J'ai construit un site pour Entreprise — voici à quoi il ressemble » (ou, si le lien Google est mort, « Votre lien Google mène à une page d'erreur — j'ai construit le site de Entreprise »). Dire vrai, donner envie de voir ; pas de « prêt », « gratuit », majuscules ni point d'exclamation."><Input value={p.subject} onChange={set("subject")} placeholder={p.brokenDomain ? `Votre lien Google mène à une page d'erreur — j'ai construit le site de ${p.business || "Entreprise"}` : `J'ai construit un site pour ${p.business || "Entreprise"} — voici à quoi il ressemble`} /></Field>
        <Field label="Titre (mise en page carte)" className="sm:col-span-2"><Input value={p.headline} onChange={set("headline")} placeholder="Vide = « Votre fiche Google envoie vos clients vers un site qui ne fonctionne plus. »" /></Field>
        <Field label="Accroche personnalisée" className="sm:col-span-2" hint="Vide = phrase automatique sur le lien mort. Sinon, ce paragraphe remplace le constat."><Textarea rows={3} value={p.problemText} onChange={(e) => setP({ ...p, problemText: e.target.value })} /></Field>
        <Field label="Arguments supplémentaires dans l'offre" className="sm:col-span-2" hint="Un par ligne (admin, réservation en ligne, etc.)"><Textarea rows={2} value={p.extraBullets} onChange={(e) => setP({ ...p, extraBullets: e.target.value })} /></Field>
        <Field label="Espace admin de démonstration (lien)" hint="Vide = pas de paragraphe"><Input value={p.adminUrl} onChange={set("adminUrl")} placeholder="https://…/admin/" /></Field>
        <Field label="Mot de passe de démonstration" hint="Compte en lecture seule (rien n'est enregistré)"><Input value={p.adminPassword} onChange={set("adminPassword")} /></Field>
        <Field label="Recherche Google visée"><Input value={p.searchPhrase} onChange={set("searchPhrase")} /></Field>
        <Field label="Note Google"><Input value={p.googleRating} onChange={set("googleRating")} /></Field>
        <Field label="Nombre d'avis"><Input type="number" value={p.googleReviews} onChange={set("googleReviews")} /></Field>
        <Field label="Prix ($) *"><Input type="number" value={p.price} onChange={set("price")} /></Field>
        <Field label="Livraison (heures)"><Input type="number" value={p.deliveryHours} onChange={set("deliveryHours")} /></Field>
        <Field label="Nouveau domaine proposé" hint="Vide = pas d'option domaine"><Input value={p.newDomain} onChange={set("newDomain")} /></Field>
        <Field label="Prix du domaine ($) / années"><div className="flex gap-2"><Input type="number" value={p.newDomainPrice} onChange={set("newDomainPrice")} /><Input type="number" value={p.newDomainYears} onChange={set("newDomainYears")} /></div></Field>
        <Field label="Téléphone *"><Input value={p.phone} onChange={set("phone")} /></Field>
        <Field label="Mise en page" hint="« Sobre » ressemble à un courriel personnel : Gmail le classe plus souvent dans la boîte principale ; « Carte » est la version design (bouton plein, encadré), plus souvent triée dans « Promotions ».">
          <select value={p.variant} onChange={(e) => setP({ ...p, variant: e.target.value as "card" | "plain" })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="plain">Sobre (boîte principale)</option>
            <option value="card">Carte design (bouton, encadré)</option>
          </select>
        </Field>
        <div className="space-y-2 pt-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={p.forwardToFranchisee} onChange={(e) => setP({ ...p, forwardToFranchisee: e.target.checked })} /> Ajouter la ligne « transmettre au franchisé » (envoi au siège)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={isTest} onChange={(e) => setIsTest(e.target.checked)} /> Envoi de test (objet préfixé [TEST], exclu des statistiques)</label>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Button variant="outline" onClick={() => window.open(api.proposalPreviewUrl(p), "_blank", "noopener")}>Aperçu</Button>
        <Button onClick={() => send.mutate()} disabled={!ready || send.isPending} variant={isTest ? "secondary" : "default"}>{send.isPending ? "Envoi…" : isTest ? "Envoyer le test" : "Envoyer la proposition"}</Button>
      </div>
    </Panel>
  );
}
