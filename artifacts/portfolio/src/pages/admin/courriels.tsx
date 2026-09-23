import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell, ErrorNote, Field, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, shortDate } from "@/lib/admin-api";

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
                  <div className="text-xs text-muted-foreground">{shortDate(m.createdAt)}{m.invoiceId ? " · facture" : ""}{m.error ? ` · ${m.error}` : ""}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
