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
  monthlyPrice?: number | null;
  phone: string;
  adminUrl?: string | null;
  adminPassword?: string | null;
  /** Quand le premier courriel est parti, tel qu'on le dirait à l'oral : « jeudi dernier ». */
  firstSentLabel?: string | null;
  /** Phrase sur l'appel passé entre-temps : « J'ai aussi appelé le même jour, mais le gérant était occupé… ». */
  callNote?: string | null;
  /** Jusqu'à quand la maquette reste en ligne : « vendredi 9 octobre ». */
  keepUntil?: string | null;
  googleRating?: string | null;
  googleReviews?: number | null;
  /** « Ce que vous y trouverez », un point par ligne ; vide = menus, horaires, réservation, espace admin. */
  bullets?: string | null;
  subject?: string | null;
  /** « classic » (par défaut avant le 02/10, gardé en archive) = bloc anti-hameçonnage détaillé + liste de ce que le
   *  site contient ; « brut » (recommandé depuis) = même esprit que la proposition « brut » : ~120 mots, aucun bloc
   *  anti-hameçonnage, une seule question en guise d'appel à l'action. */
  variant?: "classic" | "brut" | null;
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
  const call = p.callNote?.trim() ? ` ${p.callNote.trim()}` : "";
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
    "La réservation en ligne, 24 heures sur 24, sans commission.",
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
  const monthly = p.monthlyPrice && p.monthlyPrice > 0 ? p.monthlyPrice : null;
  // Élément nouveau par rapport au premier courriel (2026-10-02) : une relance qui répète la même offre
  // n'ajoute aucune raison de regarder à nouveau — et baisser le prix pour faire revenir quelqu'un qui n'a
  // pas répondu ressemble à du rabais de fin de saison, pas à un studio qui a de la demande. Le tarif de
  // lancement évolue plutôt à la hausse : la mise à jour elle-même est la raison de regarder à nouveau.
  const money = `Mise à jour depuis mon dernier message : le tarif de lancement a changé, le temps que je signe mes tout premiers clients. Regarder reste sans coût et sans engagement. Si le site vous plaît : ${monthly ? `${dollars(p.price)} à la mise en ligne, puis ${dollars(monthly)} par mois pour l'hébergement, le domaine et vos modifications — résiliable en tout temps` : `${dollars(p.price)} une seule fois, pas d'abonnement`}${own ? `, ${own} conservé` : ""}, et le site vous appartient à 100 %.${p.keepUntil?.trim() ? ` Je garde la maquette en ligne jusqu'au ${p.keepUntil.trim()}.` : ""}`;
  // Phrase de confiance mise en évidence tôt et seule sur sa ligne (2026-10-02) — même raisonnement que la
  // proposition initiale : noyée dans un paragraphe, personne ne la lit avant de décider de cliquer ou non.
  const risque = "Vous ne risquez rien : si le site ne vous plaît pas, je le retire, sans relance, et vous n'aurez rien payé.";

  if (p.variant === "brut") {
    // Même esprit que la proposition « brut » (2026-10-02) : pas de bloc anti-hameçonnage (l'hypothèse testée est
    // que trop se justifier éveille le doute au lieu de l'éteindre), pas de liste de fonctionnalités — la relance
    // s'appuie sur ce que le premier courriel a déjà montré — et une question en guise d'appel à l'action.
    const prenom = signer.split(" ")[0] ?? signer;
    const rappel = `Je vous ai écrit ${when} : j'ai construit un nouveau site pour ${p.business}, sans que vous me demandiez rien.${call}`;
    const keepUntilSentence = p.keepUntil?.trim() ? ` Je garde la maquette en ligne jusqu'au ${p.keepUntil.trim()}.` : "";
    const prixBrut = monthly
      ? `Depuis mon premier message, le tarif de lancement a changé : ${dollars(p.price)} à la mise en ligne. Les ${dollars(monthly)} par mois ensuite restent à votre choix, pas obligatoires — c'est pour que je m'occupe de l'hébergement${own ? "" : ", du nom de domaine"} et de vos modifications à votre place. Si le site ne vous plaît pas, vous ne me devez rien.${keepUntilSentence}`
      : `Depuis mon premier message, le tarif de lancement a changé : ${dollars(p.price)}, une seule fois, pas d'abonnement. Si le site ne vous plaît pas, vous ne me devez rien.${keepUntilSentence}`;
    const adminBrut = p.adminUrl?.trim()
      ? `Vous pourrez aussi changer un plat, un prix ou vos horaires vous-même, sans me rappeler, depuis un espace d'administration : ${p.adminUrl.trim()} — mot de passe ${p.adminPassword?.trim() || "fourni sur demande"}. C'est une démonstration, rien n'y est enregistré.`
      : "";
    const modifBrut = "Et avant la mise en ligne, si quelque chose doit changer — un texte, une photo, un prix — dites-le-moi : rien n'est figé. Pour en parler, écrivez-moi ou appelez-moi, ça ne vous engage à rien.";
    const questionBrut = "Qu'en pensez-vous ?";
    const legalBrut = `${signer}, ${address}. Pour ne plus recevoir de message de ma part, répondez simplement « STOP ».`;

    const textBrut = [
      greeting, "",
      rappel, "",
      `Vous pouvez le voir ici, ça ne coûte rien : ${p.siteUrl}`, "",
      prixBrut, "",
      ...(adminBrut ? [adminBrut, ""] : []),
      modifBrut, "",
      questionBrut, "",
      prenom, "",
      signer, `Développeur web indépendant — ${city}`, `${site} · ${issuer.emailFrom} · ${phone}`, "",
      "—", legalBrut,
    ].join("\n");

    const adminBrutHtml = p.adminUrl?.trim()
      ? `Vous pourrez aussi changer un plat, un prix ou vos horaires vous-m&ecirc;me, sans me rappeler, depuis un espace d'administration : <a href="${esc(p.adminUrl.trim())}" style="color:#a9712c;text-decoration:none;border-bottom:1px solid #d9b98c">${esc(p.adminUrl.trim().replace(/^https?:\/\//, ""))}</a> — mot de passe <strong style="color:#16161a">${esc(p.adminPassword?.trim() || "fourni sur demande")}</strong>. C'est une d&eacute;monstration, rien n'y est enregistr&eacute;.`
      : "";
    const htmlBrut = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:40px 20px;background:#fbfaf8;-webkit-text-size-adjust:100%">
<div style="max-width:540px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:16.5px;line-height:1.7;color:#232220">
<p style="margin:0 0 20px">${esc(greeting)}</p>
<p style="margin:0 0 20px">${esc(rappel)}</p>
<p style="margin:0 0 20px">Vous pouvez le voir ici, &ccedil;a ne co&ucirc;te rien&nbsp;: <a href="${esc(link)}" style="color:#a9712c;text-decoration:none;border-bottom:1px solid #d9b98c">${esc(p.siteUrl.replace(/^https?:\/\//, ""))}</a></p>
<p style="margin:0 0 20px">${esc(prixBrut)}</p>
${adminBrutHtml ? `<p style="margin:0 0 20px">${adminBrutHtml}</p>` : ""}
<p style="margin:0 0 28px">${esc(modifBrut)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 30px"><tr>
  <td style="padding-right:14px"><div style="width:5px;height:38px;background:#d9b98c;border-radius:3px"></div></td>
  <td style="font-size:17px;line-height:1.5;color:#16161a">${esc(questionBrut)}</td>
</tr></table>
<p style="margin:0 0 3px;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#16161a">${esc(prenom)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px 0 30px;border-top:1px solid #e6e1d8;padding-top:14px;width:100%"><tr>
  <td valign="top" style="padding-right:12px">${opts.logoUrl ? `<img src="${esc(opts.logoUrl)}" width="36" height="36" alt="${esc(signer)}" style="display:block;width:36px;height:36px;border-radius:8px">` : ""}</td>
  <td valign="top" style="font-size:14px;line-height:1.55;color:#6b6560">
    <strong style="color:#232220">${esc(signer)}</strong> — d&eacute;veloppeur web ind&eacute;pendant, ${esc(city)}<br>
    ${esc(phone)} &middot; <a href="mailto:${esc(issuer.emailFrom)}" style="color:#6b6560;text-decoration:none">${esc(issuer.emailFrom)}</a> &middot; ${esc(site)}
  </td>
</tr></table>
<p style="margin:0;color:#aba69e;font-size:11.5px;line-height:1.5">${esc(legalBrut)}</p>
</div>
</body></html>`;
    return { subject, html: htmlBrut, text: textBrut };
  }

  // ── texte (variante « classic ») ──
  const text = [
    greeting, "",
    `Je vous ai écrit ${when} : sans que vous me demandiez rien, j'ai construit un nouveau site pour ${p.business}.${call} Je me doute qu'un courriel d'un inconnu avec un lien, ça ressemble à de l'hameçonnage, et qu'on le laisse de côté. Alors je vais être très clair.`, "",
    "Ce que le lien fait, et ne fait pas :", ...safety.map((s) => `- ${s}`), "",
    `Le site : ${p.siteUrl}`, "",
    "Ce que vous y trouverez :", ...found.map((b) => `- ${b}`), admin ? admin : "", proof ? proof : "",
    "", money, "",
    risque, "",
    "Une seule chose à faire pour avancer : répondez « oui » à ce courriel.", "",
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
${para(`Je vous ai écrit ${esc(when)} : sans que vous me demandiez rien, <strong>j'ai construit un nouveau site pour ${esc(p.business)}</strong>.${esc(call)} Je me doute qu'un courriel d'un inconnu avec un lien, ça ressemble à de l'hameçonnage, et qu'on le laisse de côté. Alors je vais être très clair.`)}
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
${para(bold(money, "Mise à jour depuis mon dernier message : le tarif de lancement a changé, le temps que je signe mes tout premiers clients."))}
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${ink};font-weight:700">${esc(risque)}</p>
${para("Une seule chose à faire pour avancer : répondez « oui » à ce courriel.")}
<div style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${ink}">Au plaisir,${signatureHtml}</div>
<p style="margin:0;font-size:12px;line-height:1.5;color:${muted}">${esc(signer)}, ${esc(address)}. Pour ne plus recevoir de message de ma part, répondez simplement «&nbsp;STOP&nbsp;».</p>
</div>
</body></html>`;

  return { subject, html, text };
}
