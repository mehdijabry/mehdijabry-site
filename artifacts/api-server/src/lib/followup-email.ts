import type { IssuerSettings } from "./invoice-html";
import { esc, formatPhone, dollars } from "./proposal-email";

/**
 * « Relance courtoise » (2026-09-28) — second courriel envoyé quelques jours après la proposition, quand le premier a été
 * ouvert sans que le lien soit cliqué. Constat : un courriel d'un inconnu avec un lien ressemble à de l'hameçonnage, donc
 * le message explique noir sur blanc ce que le lien fait et ne fait pas, montre déjà le site en image, et rappelle que
 * regarder ne coûte rien. Mise en page sobre (fond blanc, pas de carte) comme la variante « plain » de la proposition.
 */
export type FollowupEmailInput = {
  toName?: string | null;
  business: string;
  siteUrl: string;
  previewImageUrl?: string | null;
  /** Domaine que le client possède déjà (ex. lebette.com). */
  ownDomain?: string | null;
  price: number;
  phone: string;
  adminUrl?: string | null;
  adminPassword?: string | null;
  /** Quand le premier courriel est parti, tel qu'on le dirait à l'oral : « jeudi dernier ». */
  firstSentLabel?: string | null;
  /** Jusqu'à quand la maquette reste en ligne : « vendredi 9 octobre ». */
  keepUntil?: string | null;
  googleRating?: string | null;
  googleReviews?: number | null;
  /** « Ce que vous y trouverez », un point par ligne ; vide = menus, horaires, réservation, espace admin. */
  bullets?: string | null;
  subject?: string | null;
};

export function renderFollowupEmail(p: FollowupEmailInput, issuer: IssuerSettings, opts: { logoUrl?: string | null; trackUrl?: string | null } = {}): { subject: string; html: string; text: string } {
  const link = opts.trackUrl || p.siteUrl;
  const host = p.siteUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const subject = p.subject?.trim() || `${p.business} — j'ai construit votre site, voici comment le voir sans risque`;
  const greeting = p.toName?.trim() ? `Bonjour ${p.toName.trim()},` : "Bonjour,";
  const signer = issuer.fullName;
  const site = (issuer.website || "mehdijabry.dev").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const phone = formatPhone(p.phone);
  const city = issuer.city || "Trois-Rivières";
  const address = [issuer.addressLine1, issuer.addressLine2, `${issuer.city} (${issuer.province})`].filter(Boolean).join(", ");
  const when = p.firstSentLabel?.trim() || "il y a quelques jours";
  const own = p.ownDomain?.trim();
  const rating = p.googleRating?.trim();
  const reviews = p.googleReviews ?? null;
  const ink = "#16161a", muted = "#6b6560", amber = "#b8863b", paper = "#f4f1ea";

  const safety = [
    `Il ouvre une simple page web, à l'adresse ${host}, hébergée chez Cloudflare, l'un des plus grands hébergeurs au monde.`,
    "Rien à télécharger, rien à installer, aucun mot de passe à entrer, aucun paiement, aucune carte.",
    `Vous n'êtes même pas obligés de cliquer : tapez ${host} vous-mêmes dans votre navigateur, c'est exactement la même page.`,
    `Et je suis un vrai humain, à ${city} : ${signer}, ${address}. Appelez-moi au ${phone} avant d'ouvrir quoi que ce soit si vous préférez, ou tapez ${site} dans Google.`,
  ];
  const defaultBullets = [
    "Vos menus au complet, lisibles sur un téléphone, sans PDF à télécharger.",
    "Vos horaires, affichés avant même que le client appelle.",
    "La réservation en ligne, 24 heures sur 24, sans abonnement mensuel ni commission.",
    "Un espace d'administration où vous changez un plat, un prix ou une annonce vous-mêmes, en une minute.",
  ];
  const bullets = (p.bullets || "").split(/\n+/).map((b) => b.trim()).filter(Boolean).slice(0, 8);
  const found = bullets.length ? bullets : defaultBullets;
  const proof = rating && reviews
    ? `Avec ${reviews} avis et une note de ${rating} sur Google, vos clients vous cherchent déjà. Autant qu'ils trouvent un site à la hauteur.`
    : rating ? `Avec une note de ${rating} sur Google, vos clients vous cherchent déjà. Autant qu'ils trouvent un site à la hauteur.` : "";
  const admin = p.adminUrl?.trim()
    ? `Pour l'essayer : ${p.adminUrl.trim()} — mot de passe : ${p.adminPassword?.trim() || "fourni sur demande"}. C'est une démonstration, rien n'y est enregistré.`
    : "";
  const money = `Regarder ne coûte rien et ne vous engage à rien. Si le site vous plaît : ${dollars(p.price)} une seule fois, pas d'abonnement${own ? `, ${own} conservé` : ""}, et le site vous appartient à 100 %. S'il ne vous plaît pas : je le retire, sans relance, et on en reste là.${p.keepUntil?.trim() ? ` Je garde la maquette en ligne jusqu'au ${p.keepUntil.trim()}.` : ""}`;

  // ── texte brut ──
  const text = [
    greeting, "",
    `Je vous ai écrit ${when} : sans que vous me demandiez rien, j'ai construit un nouveau site pour ${p.business}. Je me doute qu'un courriel d'un inconnu avec un lien, ça ressemble à de l'hameçonnage, et qu'on le laisse de côté. Alors je vais être très clair.`, "",
    "Ce que le lien fait, et ne fait pas :", ...safety.map((s) => `- ${s}`), "",
    `Le site : ${p.siteUrl}`, "",
    "Ce que vous y trouverez :", ...found.map((b) => `- ${b}`), admin ? admin : "", proof ? proof : "",
    "", money, "",
    "Un simple « oui, on regarde » ou « non merci » en réponse me suffit.", "",
    "Au plaisir,", signer, `Développeur web indépendant — ${city}`, `${site} · ${issuer.emailFrom} · ${phone}`, "",
    `${signer}, ${address}. Pour ne plus recevoir de message de ma part, répondez simplement « STOP ».`,
  ].filter((l) => l !== null).join("\n");

  // ── HTML ──
  const para = (inner: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${ink}">${inner}</p>`;
  const li = (inner: string) => `<li style="margin:0 0 8px">${inner}</li>`;
  const bold = (s: string, needle: string) => esc(s).replace(esc(needle), `<strong>${esc(needle)}</strong>`);
  const signatureHtml = `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:6px"><tr>
  ${opts.logoUrl ? `<td valign="top" style="padding:4px 14px 0 0"><a href="https://${esc(site)}" style="text-decoration:none"><img src="${esc(opts.logoUrl)}" width="44" height="44" alt="${esc(signer)}" style="display:block;width:44px;height:44px;border-radius:9px"></a></td>` : ""}
  <td valign="top" style="font-size:16px;line-height:1.6;color:${ink}"><strong>${esc(signer)}</strong><br><span style="color:${muted}">Développeur web indépendant — ${esc(city)}</span><br><a href="https://${esc(site)}" style="color:${amber};text-decoration:none">${esc(site)}</a> &middot; <a href="mailto:${esc(issuer.emailFrom)}" style="color:${amber};text-decoration:none">${esc(issuer.emailFrom)}</a> &middot; ${esc(phone)}</td>
</tr></table>`;

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;-webkit-text-size-adjust:100%">
<div style="max-width:600px;margin:0 auto;font-family:Helvetica Neue,Arial,sans-serif">
${para(esc(greeting))}
${para(`Je vous ai écrit ${esc(when)} : sans que vous me demandiez rien, <strong>j'ai construit un nouveau site pour ${esc(p.business)}</strong>. Je me doute qu'un courriel d'un inconnu avec un lien, ça ressemble à de l'hameçonnage, et qu'on le laisse de côté. Alors je vais être très clair.`)}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px"><tr><td style="background:${paper};border-radius:10px;padding:18px 20px 10px">
  <p style="margin:0 0 10px;font-size:13px;line-height:1.4;letter-spacing:.12em;text-transform:uppercase;color:${muted}">Ce que le lien fait, et ne fait pas</p>
  <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.55;color:${ink}">
    ${li(bold(safety[0]!, host))}
    ${li(esc(safety[1]!))}
    ${li(bold(safety[2]!, host))}
    ${li(bold(safety[3]!, phone))}
  </ul>
</td></tr></table>
${p.previewImageUrl?.trim() ? `${para("Voici déjà la page d'accueil, sans rien ouvrir :")}<p style="margin:0 0 6px"><a href="${esc(link)}"><img src="${esc(p.previewImageUrl.trim())}" width="600" alt="Aperçu du site ${esc(p.business)}" style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #e6e1d8;border-radius:8px"></a></p><p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:${muted}">Cliquez l'image pour naviguer dans le site, ou tapez ${esc(host)} dans votre navigateur.</p>` : ""}
<p style="margin:0 0 6px"><a href="${esc(link)}" style="display:inline-block;border:2px solid ${ink};color:${ink};text-decoration:none;font-weight:700;font-size:15px;padding:10px 22px;border-radius:999px">Voir le site ${esc(p.business)} &rarr;</a></p>
<p style="margin:0 0 22px;font-size:13px;line-height:1.5;color:${muted}">ou tapez <strong>${esc(host)}</strong></p>
${para("<strong>Ce que vous y trouverez :</strong>")}
<ul style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;color:${ink}">${found.map((b) => li(esc(b))).join("")}</ul>
${admin ? para(esc(admin).replace(esc(p.adminUrl!.trim()), `<a href="${esc(p.adminUrl!.trim())}" style="color:${amber};font-weight:700">${esc(p.adminUrl!.trim())}</a>`)) : ""}
${proof ? para(esc(proof)) : ""}
${para(bold(money, "Regarder ne coûte rien et ne vous engage à rien."))}
${para("Un simple « oui, on regarde » ou « non merci » en réponse me suffit.")}
<div style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${ink}">Au plaisir,${signatureHtml}</div>
<p style="margin:0;font-size:12px;line-height:1.5;color:${muted}">${esc(signer)}, ${esc(address)}. Pour ne plus recevoir de message de ma part, répondez simplement «&nbsp;STOP&nbsp;».</p>
</div>
</body></html>`;

  return { subject, html, text };
}
