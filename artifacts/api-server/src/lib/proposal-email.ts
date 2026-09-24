import type { IssuerSettings } from "./invoice-html";

/**
 * « Proposition de site clés en main » — the prospecting e-mail sent from the studio address once a
 * mock site has been built for a local business (2026-09-23, first used for Seau de Crabe Trois-Rivières).
 * Table-based HTML with inline styles (Gmail/Outlook safe) + a plain-text twin. Every field the pitch
 * depends on is a parameter so the same template serves the next prospect.
 */
export type ProposalEmailInput = {
  toName?: string | null;
  business: string;
  city: string;
  siteUrl: string;
  previewImageUrl?: string | null;
  brokenDomain?: string | null;
  googleRating?: string | null;
  googleReviews?: number | null;
  searchPhrase?: string | null;
  price: number;
  newDomain?: string | null;
  newDomainPrice?: number | null;
  newDomainYears?: number | null;
  deliveryHours?: number | null;
  forwardToFranchisee?: boolean | null;
  phone: string;
  /** Titre de la carte (variante « card ») ; défaut : la fiche Google renvoie vers un site mort. */
  headline?: string | null;
  /** Accroche complète (remplace la phrase « lien mort ») — pour un site existant mais sommaire, par exemple. */
  problemText?: string | null;
  /** Domaine que le client possède déjà (ex. lebette.com) : la mise en ligne s'y fait, rien ne change pour ses clients. */
  ownDomain?: string | null;
  /** Arguments supplémentaires dans l'encadré de l'offre, un par ligne (admin, réservation en ligne…). */
  extraBullets?: string | null;
  /** « card » = mise en page design (carte, bouton) ; « plain » = courriel sobre, proche d'un message personnel — Gmail le classe
   *  plus volontiers dans la boîte principale que dans « Promotions ». */
  variant?: "card" | "plain" | null;
};

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
/** "4385257119" → "438 525-7119" (Québec convention); anything else is left as typed. */
const formatPhone = (raw: string): string => {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1")) return `${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7)}`;
  return raw.trim();
};
const dollars = (n: number): string => `${new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 0 }).format(n)} $`;

export function renderProposalEmail(p: ProposalEmailInput, issuer: IssuerSettings, opts: { logoUrl?: string | null; trackUrl?: string | null } = {}): { subject: string; html: string; text: string } {
  // Dans le HTML, les liens vers la maquette passent par /go/<jeton> (clic compté) ; le texte brut garde l'adresse réelle.
  const link = opts.trackUrl || p.siteUrl;
  const hours = p.deliveryHours ?? 48;
  const subject = `${p.business} — votre site web est prêt (aperçu à l'intérieur)`;
  const greeting = p.toName?.trim() ? `Bonjour ${p.toName.trim()},` : "Bonjour,";
  const signer = issuer.fullName;
  // Settings may hold "https://mehdijabry.dev" or "mehdijabry.dev": display the bare host, link with one scheme.
  const site = (issuer.website || "mehdijabry.dev").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const phone = formatPhone(p.phone);
  // Signature block shared by both layouts: the logo mark (PNG — e-mail clients don't render SVG) beside the name.
  const signatureHtml = (textColor: string, mutedColor: string, accent: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:6px"><tr>
  ${opts.logoUrl ? `<td valign="top" style="padding:4px 14px 0 0"><a href="https://${esc(site)}" style="text-decoration:none"><img src="${esc(opts.logoUrl)}" width="44" height="44" alt="${esc(signer)}" style="display:block;width:44px;height:44px;border-radius:9px"></a></td>` : ""}
  <td valign="top" style="font-size:16px;line-height:1.6;color:${textColor}"><strong>${esc(signer)}</strong><br><span style="color:${mutedColor}">D&eacute;veloppeur web ind&eacute;pendant — ${esc(issuer.city || p.city)}</span><br><a href="https://${esc(site)}" style="color:${accent};text-decoration:none">${esc(site)}</a> &middot; <a href="mailto:${esc(issuer.emailFrom)}" style="color:${accent};text-decoration:none">${esc(issuer.emailFrom)}</a> &middot; ${esc(phone)}</td>
</tr></table>`;

  const broken = p.brokenDomain?.trim();
  const rating = p.googleRating?.trim();
  const reviews = p.googleReviews ?? null;
  const proofSentence = rating && reviews
    ? ` Avec ${reviews} avis et une note de ${rating}, c'est dommage de perdre ces visiteurs juste avant la commande.`
    : rating ? ` Avec une note de ${rating} sur Google, c'est dommage de perdre ces visiteurs juste avant la commande.` : "";
  const problem = p.problemText?.trim() ? p.problemText.trim() : broken
    ? `En cherchant votre restaurant sur Google Maps, j'ai remarqué que le lien « Site Web » de votre fiche (${broken}) ne fonctionne plus : les clients qui cliquent tombent sur une page d'erreur.${proofSentence}`
    : `En cherchant votre restaurant sur Google Maps, j'ai remarqué que votre fiche ne mène vers aucun site web qui fonctionne.${proofSentence}`;
  const headline = p.headline?.trim() || "Votre fiche Google envoie vos clients vers un site qui ne fonctionne plus.";
  const own = p.ownDomain?.trim();
  const search = p.searchPhrase?.trim() || `${p.business.split(" ")[0]} ${p.city}`;

  const bullets: string[] = [
    "Le site complet, ajusté selon vos retours avant la mise en ligne",
    own ? `La mise en ligne sur votre domaine actuel, ${own} : rien ne change pour vos clients` : "La mise en ligne sur votre nom de domaine" + (broken ? ` (${broken} ou un autre)` : "") + " si vous y avez accès",
  ];
  (p.extraBullets || "").split(/\n+/).map((b) => b.trim()).filter(Boolean).slice(0, 6).forEach((b) => bullets.push(b));
  if (!own && p.newDomain?.trim() && p.newDomainPrice) {
    bullets.push(`Sinon, j'ai vérifié : ${p.newDomain.trim()} est disponible — je l'enregistre à votre nom pour ${p.newDomainYears ?? 3} ans pour ${dollars(p.newDomainPrice)} de plus`);
  }
  bullets.push("Hébergement sécurisé, sans abonnement mensuel");
  bullets.push("À la livraison, vous recevez tous les accès (hébergement et nom de domaine, créés à votre nom) : le site vous appartient à 100 %");
  bullets.push(`En ligne en moins de ${hours} heures après votre accord`);

  const forward = p.forwardToFranchisee ? `Si la décision revient au franchisé de ${p.city}, je vous serais reconnaissant de lui transmettre ce message.` : "";

  // ── plain text ──
  const text = [
    greeting,
    "",
    `Je m'appelle ${signer}, développeur web indépendant ici à ${issuer.city || p.city}.`,
    "",
    problem,
    "",
    "Plutôt que de vous envoyer un devis, j'ai construit votre site. Vous pouvez le voir ici :",
    p.siteUrl,
    "",
    `Il reprend votre menu officiel, vos horaires, vos photos, vos avis Google, l'adresse avec itinéraire et le lien vers votre commande en ligne — pensé pour le téléphone et pour ressortir sur Google quand quelqu'un cherche « ${search} ». Tout est modifiable : textes, photos, promotions, ce que vous voulez.`,
    "",
    `L'offre — ${dollars(p.price)}, montant fixe, sans abonnement mensuel :`,
    ...bullets.map((b) => `- ${b}`),
    "",
    "Aucun engagement : si le site ne vous convient pas, vous ne payez rien.",
    "",
    `Je suis à ${issuer.city || p.city} — je peux passer vous le montrer sur place, quand ça vous arrange. Répondez à ce courriel ou appelez-moi au ${phone}.`,
    "",
    ...(forward ? [forward, ""] : []),
    "Au plaisir,",
    signer,
    `Développeur web indépendant — ${issuer.city || p.city}`,
    `${site} · ${issuer.emailFrom} · ${phone}`,
    "",
    "—",
    `${signer}, ${[issuer.addressLine1, issuer.addressLine2, `${issuer.city} (${issuer.province})`].filter(Boolean).join(", ")}. Pour ne plus recevoir de message de ma part, répondez simplement « STOP ».`,
  ].join("\n");

  // ── HTML ──
  const ink = "#16161a", muted = "#6b6560", amber = "#b8863b", paper = "#f4f1ea";
  const pStyle = `padding:0 0 16px;font-size:16px;line-height:1.6;color:${ink}`; // padding: margins are ignored on table cells
  const bulletRows = bullets.map((b) => `
        <tr>
          <td valign="top" style="padding:6px 10px 6px 0;font-size:16px;line-height:1.5;color:${amber};font-weight:700">&#10003;</td>
          <td valign="top" style="padding:6px 0;font-size:15px;line-height:1.5;color:${ink}">${esc(b)}</td>
        </tr>`).join("");
  const preview = p.previewImageUrl?.trim() ? `
      <tr><td style="padding:4px 0 20px">
        <a href="${esc(link)}" style="text-decoration:none">
          <img src="${esc(p.previewImageUrl.trim())}" width="552" alt="Aperçu du site ${esc(p.business)}" style="display:block;width:100%;max-width:552px;height:auto;border-radius:10px;border:1px solid #e6e1d8">
        </a>
      </td></tr>` : "";

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${paper};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(p.problemText?.trim() ? `J'ai construit votre nouveau site — il est prêt à voir.` : `Votre fiche Google renvoie vers un site qui ne fonctionne plus — j'ai construit le vôtre, il est prêt à voir.`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${paper}">
  <tr><td align="center" style="padding:28px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">
      <tr><td style="padding:0 0 14px;font-family:Helvetica Neue,Arial,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${muted}">${esc(signer)} &middot; D&eacute;veloppeur web ind&eacute;pendant &middot; ${esc(issuer.city || p.city)}</td></tr>
      <tr><td style="background:#ffffff;border:1px solid #e6e1d8;border-radius:14px;padding:32px 28px;font-family:Helvetica Neue,Arial,sans-serif">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:${ink}">${esc(headline)}</td></tr>
          <tr><td style="${pStyle}">${esc(greeting)}</td></tr>
          <tr><td style="${pStyle}">Je m'appelle ${esc(signer)}, d&eacute;veloppeur web ind&eacute;pendant ici &agrave; ${esc(issuer.city || p.city)}.</td></tr>
          <tr><td style="${pStyle}">${esc(problem)}</td></tr>
          <tr><td style="${pStyle}">Plut&ocirc;t que de vous envoyer un devis, <strong>j'ai construit votre site</strong>. Vous pouvez le voir ici&nbsp;:</td></tr>
          ${preview}
          <tr><td align="center" style="padding:0 0 26px">
            <a href="${esc(link)}" style="display:inline-block;background:${amber};color:#16161a;text-decoration:none;font-weight:700;font-size:16px;padding:14px 30px;border-radius:999px">Voir votre site &rarr;</a>
            <div style="padding-top:8px;font-size:12px;color:${muted}">${esc(p.siteUrl.replace(/^https?:\/\//, ""))}</div>
          </td></tr>
          <tr><td style="${pStyle}">Il reprend votre menu officiel, vos horaires, vos photos, vos avis Google, l'adresse avec itin&eacute;raire et le lien vers votre commande en ligne — pens&eacute; pour le t&eacute;l&eacute;phone et pour ressortir sur Google quand quelqu'un cherche «&nbsp;${esc(search)}&nbsp;». <strong>Tout est modifiable</strong>&nbsp;: textes, photos, promotions, ce que vous voulez.</td></tr>
          <tr><td style="padding:6px 0 22px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${paper};border:1px solid #e6e1d8;border-radius:12px">
              <tr><td style="padding:20px 22px">
                <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${muted};padding-bottom:6px">L'offre</div>
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.1;color:${ink};padding-bottom:4px">${dollars(p.price)}</div>
                <div style="font-size:14px;color:${muted};padding-bottom:12px">Montant fixe, sans abonnement mensuel</div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${bulletRows}
                </table>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="${pStyle}"><strong>Aucun engagement</strong>&nbsp;: si le site ne vous convient pas, vous ne payez rien.</td></tr>
          <tr><td style="${pStyle}">Je suis &agrave; ${esc(issuer.city || p.city)} — je peux passer vous le montrer sur place, quand &ccedil;a vous arrange. R&eacute;pondez &agrave; ce courriel ou appelez-moi au <a href="tel:${esc(phone.replace(/[^\d+]/g, ""))}" style="color:${ink};font-weight:700;text-decoration:none">${esc(phone)}</a>.</td></tr>
          ${forward ? `<tr><td style="${pStyle}">${esc(forward)}</td></tr>` : ""}
          <tr><td style="padding:8px 0 0;font-size:16px;line-height:1.6;color:${ink}">Au plaisir,${signatureHtml(ink, muted, amber)}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:18px 8px 0;font-family:Helvetica Neue,Arial,sans-serif;font-size:12px;line-height:1.5;color:${muted}">
        ${esc(signer)}, ${esc([issuer.addressLine1, issuer.addressLine2, `${issuer.city} (${issuer.province})`].filter(Boolean).join(", "))}. Vous recevez ce courriel parce que votre adresse est publi&eacute;e sur votre site ou votre fiche d'entreprise. Pour ne plus recevoir de message de ma part, r&eacute;pondez simplement «&nbsp;STOP&nbsp;».
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  if (p.variant === "plain") {
    // Sober layout: white background, no card, no coloured blocks, a single bordered link instead of a filled button,
    // no hidden preheader — the fewer marketing signals, the likelier the primary inbox.
    const para = (inner: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${ink}">${inner}</p>`;
    const plainHtml = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;-webkit-text-size-adjust:100%">
<div style="max-width:600px;margin:0 auto;font-family:Helvetica Neue,Arial,sans-serif">
${para(esc(greeting))}
${para(`Je m'appelle ${esc(signer)}, d&eacute;veloppeur web ind&eacute;pendant ici &agrave; ${esc(issuer.city || p.city)}.`)}
${para(esc(problem))}
${para(`Plut&ocirc;t que de vous envoyer un devis, <strong>j'ai construit votre site</strong>. Vous pouvez le voir ici&nbsp;: <a href="${esc(link)}" style="color:${amber}">${esc(p.siteUrl.replace(/^https?:\/\//, ""))}</a>`)}
${p.previewImageUrl?.trim() ? `<p style="margin:0 0 18px"><a href="${esc(link)}"><img src="${esc(p.previewImageUrl.trim())}" width="600" alt="Aper&ccedil;u du site ${esc(p.business)}" style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #e6e1d8;border-radius:8px"></a></p>` : ""}
<p style="margin:0 0 22px"><a href="${esc(link)}" style="display:inline-block;border:2px solid ${ink};color:${ink};text-decoration:none;font-weight:700;font-size:15px;padding:10px 22px;border-radius:999px">Voir votre site &rarr;</a></p>
${para(`Il reprend votre menu officiel, vos horaires, vos photos, vos avis Google, l'adresse avec itin&eacute;raire et le lien vers votre commande en ligne — pens&eacute; pour le t&eacute;l&eacute;phone et pour ressortir sur Google quand quelqu'un cherche «&nbsp;${esc(search)}&nbsp;». <strong>Tout est modifiable</strong>&nbsp;: textes, photos, promotions, ce que vous voulez.`)}
${para(`<strong>L'offre — ${dollars(p.price)}, montant fixe, sans abonnement mensuel&nbsp;:</strong>`)}
<ul style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;color:${ink}">${bullets.map((b) => `<li style="margin:0 0 6px">${esc(b)}</li>`).join("")}</ul>
${para(`<strong>Aucun engagement</strong>&nbsp;: si le site ne vous convient pas, vous ne payez rien.`)}
${para(`Je suis &agrave; ${esc(issuer.city || p.city)} — je peux passer vous le montrer sur place, quand &ccedil;a vous arrange. R&eacute;pondez &agrave; ce courriel ou appelez-moi au <a href="tel:${esc(phone.replace(/[^\d+]/g, ""))}" style="color:${ink};font-weight:700;text-decoration:none">${esc(phone)}</a>.`)}
${forward ? para(esc(forward)) : ""}
<div style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${ink}">Au plaisir,${signatureHtml(ink, muted, amber)}</div>
<p style="margin:0;font-size:12px;line-height:1.5;color:${muted}">${esc(signer)}, ${esc([issuer.addressLine1, issuer.addressLine2, `${issuer.city} (${issuer.province})`].filter(Boolean).join(", "))}. Pour ne plus recevoir de message de ma part, r&eacute;pondez simplement «&nbsp;STOP&nbsp;».</p>
</div>
</body></html>`;
    return { subject, html: plainHtml, text };
  }

  return { subject, html, text };
}
