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
  /** Frais mensuels (hébergement, domaine, sauvegardes, modifications courantes). Absent = offre à prix unique. */
  monthlyPrice?: number | null;
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
  /** Espace d'administration de démonstration à faire essayer (lecture seule côté serveur). */
  adminUrl?: string | null;
  adminPassword?: string | null;
  /** Ce qu'on invite le prospect à essayer dans l'admin. Par défaut : le cas restaurant (avec réservations). */
  adminExamples?: string | null;
  /** Objet du courriel ; vide = « <entreprise> — votre menu et vos horaires en ligne ». */
  subject?: string | null;
  /** Phrase « Il reprend votre menu officiel… » ; vide = phrase générique (menu, horaires, photos, avis, commande en ligne). */
  featuresText?: string | null;
  /** « card » = mise en page design (carte, bouton) ; « plain » = courriel sobre, proche d'un message personnel — Gmail le classe
   *  plus volontiers dans la boîte principale que dans « Promotions » ; « court » = la version sobre resserrée (30/09/2026) :
   *  le constat en première ligne, l'offre en une phrase et quatre puces au plus, un seul appel à l'action, la note de
   *  confiance en post-scriptum. Moitié moins de mots que « plain ». */
  variant?: "card" | "plain" | "court" | null;
  /** Bloc « ce que le lien fait et ne fait pas » (anti-hameçonnage). Affiché par défaut : un courriel d'un inconnu avec
   *  un lien ressemble à de l'hameçonnage, et c'est la première raison de ne pas cliquer. Mettre false pour l'enlever. */
  safetyNote?: boolean | null;
  /** Annonce le prix comme « offre de lancement, le temps de signer mes tout premiers clients » (2026-10-02) —
   *  à utiliser tant qu'il n'y a pas encore de client payant ; false une fois les premiers clients signés. */
  launchOffer?: boolean | null;
};

export const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
/** "4385257119" → "438 525-7119" (Québec convention); anything else is left as typed. */
export const formatPhone = (raw: string): string => {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1")) return `${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7)}`;
  return raw.trim();
};
export const dollars = (n: number): string => `${new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 0 }).format(n)} $`;

export function renderProposalEmail(p: ProposalEmailInput, issuer: IssuerSettings, opts: { logoUrl?: string | null; trackUrl?: string | null } = {}): { subject: string; html: string; text: string } {
  // Dans le HTML, les liens vers la maquette passent par /go/<jeton> (clic compté) ; le texte brut garde l'adresse réelle.
  const link = opts.trackUrl || p.siteUrl;
  const hours = p.deliveryHours ?? 48;
  // Objet vrai et curieux : à la première personne, un fait (le site existe) et une raison d'ouvrir (le voir).
  // Pas de « prêt », « gratuit », majuscules ni point d'exclamation, qui sentent le pourriel.
  const subject = p.subject?.trim() || (p.brokenDomain?.trim()
    ? `Votre lien Google mène à une page d'erreur — j'ai construit le site de ${p.business}`
    : `J'ai construit un site pour ${p.business} — voici à quoi il ressemble`);
  const greeting = p.toName?.trim() ? `Bonjour ${p.toName.trim()},` : "Bonjour,";
  const signer = issuer.fullName;
  // Settings may hold "https://mehdijabry.dev" or "mehdijabry.dev": display the bare host, link with one scheme.
  const site = (issuer.website || "mehdijabry.dev").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const phone = formatPhone(p.phone);
  // Signature block shared by both layouts: the logo mark (PNG — e-mail clients don't render SVG) beside the name.
  const ink = "#16161a", muted = "#6b6560", amber = "#b8863b", paper = "#f4f1ea";
  const adminExamples = p.adminExamples?.trim() || "un plat, un prix, vos horaires, une annonce, vos réservations";
  const adminHtml = p.adminUrl?.trim()
    ? `Et pour voir comment vous le mettriez &agrave; jour vous-m&ecirc;me (${esc(adminExamples)})&nbsp;: <a href="${esc(p.adminUrl.trim())}" style="color:${amber};font-weight:700">espace d'administration</a> — mot de passe&nbsp;: <strong>${esc(p.adminPassword?.trim() || "fourni sur demande")}</strong>. C'est une d&eacute;monstration&nbsp;: explorez librement, rien n'y est enregistr&eacute;.`
    : "";
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
  const featuresText = p.featuresText?.trim() || `Il reprend votre menu officiel, vos horaires, vos photos, vos avis Google, l'adresse avec itinéraire et le lien vers votre commande en ligne — pensé pour le téléphone et pour ressortir sur Google quand quelqu'un cherche « ${search} ». Tout est modifiable : textes, photos, promotions, ce que vous voulez.`;
  const featuresHtml = esc(featuresText).replace("Tout est modifiable", "<strong>Tout est modifiable</strong>");

  // L'offre se lit d'un coup : « 300 $ à la mise en ligne, puis 45 $/mois » — ou, sans frais
  // mensuels, « 600 $, montant fixe, sans abonnement ». Les deux formes coexistent.
  const monthly = p.monthlyPrice && p.monthlyPrice > 0 ? p.monthlyPrice : null;
  const offreTitre = monthly ? `${dollars(p.price)} à la mise en ligne, puis ${dollars(monthly)} par mois` : `${dollars(p.price)}, montant fixe, sans abonnement mensuel`;
  const offreSousTitre = monthly ? `Rien à payer avant la mise en ligne. Sans engagement de durée : vous arrêtez quand vous voulez.` : "Montant fixe, sans abonnement mensuel";

  const bullets: string[] = [
    "Le site complet, ajusté selon vos retours avant la mise en ligne",
    own ? `La mise en ligne sur votre domaine actuel, ${own} : rien ne change pour vos clients` : "La mise en ligne sur votre nom de domaine" + (broken ? ` (${broken} ou un autre)` : "") + " si vous y avez accès",
  ];
  if (!own && p.newDomain?.trim() && p.newDomainPrice) {
    bullets.push(`Sinon, j'ai vérifié : ${p.newDomain.trim()} est disponible — je l'enregistre à votre nom pour ${p.newDomainYears ?? 3} ans pour ${dollars(p.newDomainPrice)} de plus`);
  }
  (p.extraBullets || "").split(/\n+/).map((b) => b.trim()).filter(Boolean).slice(0, 6).forEach((b) => bullets.push(b));
  bullets.push(monthly
    ? `Les ${dollars(monthly)} par mois comprennent l'hébergement chez Cloudflare, le nom de domaine, les sauvegardes, les mises à jour de sécurité et vos modifications courantes — sans engagement de durée`
    : "Hébergement gratuit chez Cloudflare, sécurisé et sans abonnement mensuel");
  // Quand le client possède déjà son domaine, annoncer qu'on le « crée à son nom » est faux — et un
  // prospect qui vérifie tout le reste le remarque. On ne promet que ce qu'on ouvre réellement.
  const domaineAOuvrir = !own || Boolean(p.newDomain?.trim() && p.newDomainPrice);
  bullets.push(domaineAOuvrir
    ? "À la livraison, vous recevez tous les accès (hébergement et nom de domaine, créés à votre nom) : le site vous appartient à 100 %"
    : "À la livraison, vous recevez tous les accès de l'hébergement, créés à votre nom : le site vous appartient à 100 %");
  bullets.push(`En ligne en moins de ${hours} heures après votre accord`);

  const forward = p.forwardToFranchisee ? `Si la décision revient au franchisé de ${p.city}, je vous serais reconnaissant de lui transmettre ce message.` : "";

  // ── Bloc anti-hameçonnage ──
  // Un lien reçu d'un inconnu est d'abord suspect : on dit noir sur blanc ce que le lien fait, ce qu'il ne fait pas,
  // et comment s'en passer (taper l'adresse soi-même, appeler avant d'ouvrir).
  const host = p.siteUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const address = [issuer.addressLine1, issuer.addressLine2, `${issuer.city} (${issuer.province})`].filter(Boolean).join(", ");
  const showSafety = p.safetyNote !== false;
  const safety = [
    `Il ouvre une simple page web, à l'adresse ${host}, hébergée chez Cloudflare, l'un des plus grands hébergeurs au monde.`,
    "Rien à télécharger, rien à installer, aucun mot de passe à entrer, aucun paiement, aucune carte.",
    `Vous n'êtes même pas obligés de cliquer : tapez ${host} vous-mêmes dans votre navigateur, c'est exactement la même page.`,
    `Et je suis un vrai humain, à ${issuer.city || p.city} : ${signer}, ${address}. Appelez-moi au ${phone} avant d'ouvrir quoi que ce soit si vous préférez, ou tapez ${site} dans Google.`,
  ];

  // ── plain text ──
  const text = [
    greeting,
    "",
    `Je m'appelle ${signer}, développeur web indépendant ici à ${issuer.city || p.city}.`,
    "",
    problem,
    "",
    "Plutôt que de vous envoyer un devis, j'ai construit votre site — sans engagement : le regarder ne vous coûte rien, et s'il ne vous plaît pas, vous ne payez rien. Vous pouvez le voir ici :",
    p.siteUrl,
    "",
    ...(showSafety ? ["Je me doute qu'un courriel d'un inconnu avec un lien, ça ressemble à de l'hameçonnage. Alors, ce que le lien fait et ne fait pas :", ...safety.map((x) => `- ${x}`), ""] : []),
    featuresText,
    "",
    ...(p.adminUrl?.trim() ? [`Et pour voir comment vous le mettriez à jour vous-même (${adminExamples}) : ${p.adminUrl.trim()} — mot de passe : ${p.adminPassword?.trim() || "(fourni sur demande)"}. C'est une démonstration : explorez librement, rien n'y est enregistré.`, ""] : []),
    `L'offre — ${offreTitre} :`,
    ...(monthly ? [offreSousTitre] : []),
    ...bullets.map((b) => `- ${b}`),
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
          <tr><td style="${pStyle}">Plut&ocirc;t que de vous envoyer un devis, <strong>j'ai construit votre site</strong> — sans engagement&nbsp;: le regarder ne vous co&ucirc;te rien, et s'il ne vous pla&icirc;t pas, vous ne payez rien. Vous pouvez le voir ici&nbsp;:</td></tr>
          ${preview}
          <tr><td align="center" style="padding:0 0 26px">
            <a href="${esc(link)}" style="display:inline-block;background:${amber};color:#16161a;text-decoration:none;font-weight:700;font-size:16px;padding:14px 30px;border-radius:999px">Voir votre site &rarr;</a>
            <div style="padding-top:8px;font-size:12px;color:${muted}">${esc(p.siteUrl.replace(/^https?:\/\//, ""))}</div>
          </td></tr>
          <tr><td style="${pStyle}">${featuresHtml}</td></tr>
          ${adminHtml ? `<tr><td style="${pStyle}">${adminHtml}</td></tr>` : ""}
          <tr><td style="padding:6px 0 22px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${paper};border:1px solid #e6e1d8;border-radius:12px">
              <tr><td style="padding:20px 22px">
                <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${muted};padding-bottom:6px">L'offre</div>
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.1;color:${ink};padding-bottom:4px">${dollars(p.price)}${monthly ? ` <span style="font-size:16px;color:${muted}">à la mise en ligne</span> <span style="font-size:22px">+ ${dollars(monthly)}/mois</span>` : ""}</div>
                <div style="font-size:14px;color:${muted};padding-bottom:12px">${esc(offreSousTitre)}</div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${bulletRows}
                </table>
              </td></tr>
            </table>
          </td></tr>
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

  if (p.variant === "court") {
    // Version courte, d'après le skill emailing-prospects : pas de présentation de soi en tête (la signature
    // s'en charge), le constat en première ligne — c'est l'aperçu que Gmail affiche sous l'objet —, l'offre en
    // une phrase suivie de quatre puces au plus (les siennes ; celles du gabarit sont fondues en deux phrases),
    // un seul appel à l'action, et la note anti-hameçonnage en post-scriptum : l'endroit le plus lu d'un
    // courriel, et celui où elle gêne le moins la lecture.
    const para = (inner: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${ink}">${inner}</p>`;
    const mesPuces = (p.extraBullets || "").split(/\n+/).map((b) => b.trim()).filter(Boolean).slice(0, 4);
    const nd = p.newDomain?.trim();
    const domaine = own
      ? `La mise en ligne se fait sur votre domaine actuel, ${own} : rien ne change pour vos clients.`
      : nd
        ? `${nd} est libre : je l'enregistre à votre nom${monthly ? ", c'est compris dans le mensuel" : p.newDomainPrice ? ` pour ${p.newDomainYears ?? 3} ans (${dollars(p.newDomainPrice)} de plus)` : ""}.`
        : `La mise en ligne se fait sur votre nom de domaine${broken ? ` (${broken} ou un autre)` : ""} si vous y avez accès — sinon j'en ouvre un à votre nom.`;
    const couvre = monthly
      ? `Les ${dollars(monthly)} par mois couvrent l'hébergement, le nom de domaine, les sauvegardes, la sécurité et vos modifications courantes.`
      : "Hébergement chez Cloudflare compris, sans abonnement mensuel.";
    const offrePrefixe = p.launchOffer ? "Offre de lancement, le temps de signer mes tout premiers clients" : "L'offre";
    const offreLigne = monthly
      ? `${offrePrefixe} : ${dollars(p.price)} à la mise en ligne, puis ${dollars(monthly)} par mois — sans engagement de durée.`
      : `${offrePrefixe} : ${dollars(p.price)}, montant fixe, sans abonnement.`;
    const cloture = `Rien à payer avant la mise en ligne. Vous recevez tous les accès — le site vous appartient — et la mise en ligne se fait en moins de ${hours} heures après votre accord.`;
    // « Une première version, accessible par ce lien » — pas « il est en ligne » : le site n'est pas livré, c'est
    // une proposition, et le prospect doit comprendre qu'il aura la main dessus avant la mise en ligne.
    const construit = "Plutôt que de vous envoyer un devis, j'ai construit une première version de votre site. Elle est accessible par ce lien :";
    const premiere = "Ce n'est qu'une première version : si vous l'acceptez, je prends en compte toutes les modifications que vous voudrez — textes, photos, prix — avant la mise en ligne.";
    // Risque mis en évidence tôt et seul sur sa ligne (2026-10-02) : enterré dans la clôture, personne ne le
    // lit avant de décider de cliquer ou non. C'est la phrase qui doit lever le doute, pas la confirmer après coup.
    const risque = "Vous ne risquez rien : si elle ne vous convient pas, vous n'avez rien à faire et rien à payer — vous n'aurez rien perdu.";
    const adminCourt = p.adminUrl?.trim()
      ? `Pour voir comment vous le modifieriez vous-même (${adminExamples}) : ${p.adminUrl.trim()} — mot de passe ${p.adminPassword?.trim() || "fourni sur demande"}. C'est une démonstration, rien n'y est enregistré.`
      : "";
    // Une seule micro-action (2026-10-02) : « répondez oui » coûte moins d'effort que « répondez ou appelez »,
    // qui oblige le lecteur à choisir entre deux options avant même d'avoir décidé s'il est intéressé.
    const cta = `Une seule chose à faire pour avancer : répondez « oui » à ce courriel. (Vous pouvez aussi m'appeler au ${phone} si vous préférez.)`;
    const ps = showSafety
      ? `P.-S. Un courriel d'un inconnu avec un lien, c'est suspect, je le sais. Tapez ${host} vous-mêmes dans votre navigateur : c'est exactement la même page. Et si vous préférez m'appeler avant d'ouvrir quoi que ce soit : ${phone}. Mon adresse est juste en dessous.`
      : "";
    const legal = `${signer}, ${address}. Vous recevez ce courriel parce que votre adresse est publiée sur votre site ou votre fiche d'entreprise. Pour ne plus recevoir de message de ma part, répondez simplement « STOP ».`;

    const textCourt = [
      greeting, "",
      problem, "",
      `${construit} ${p.siteUrl}`, "",
      featuresText, "",
      premiere, "",
      risque, "",
      ...(adminCourt ? [adminCourt, ""] : []),
      offreLigne,
      `${couvre} ${domaine}`,
      ...mesPuces.map((b) => `- ${b}`),
      cloture, "",
      cta, "",
      ...(forward ? [forward, ""] : []),
      "Au plaisir,", signer, `Développeur web indépendant — ${issuer.city || p.city}`, `${site} · ${issuer.emailFrom} · ${phone}`, "",
      ...(ps ? [ps, ""] : []),
      "—", legal,
    ].join("\n");

    const adminCourtHtml = p.adminUrl?.trim()
      ? `Pour voir comment vous le modifieriez vous-m&ecirc;me (${esc(adminExamples)})&nbsp;: <a href="${esc(p.adminUrl.trim())}" style="color:${amber};font-weight:700">espace d'administration</a> — mot de passe <strong>${esc(p.adminPassword?.trim() || "fourni sur demande")}</strong>. C'est une d&eacute;monstration, rien n'y est enregistr&eacute;.`
      : "";
    const htmlCourt = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;-webkit-text-size-adjust:100%">
<div style="max-width:600px;margin:0 auto;font-family:Helvetica Neue,Arial,sans-serif">
${para(esc(greeting))}
<p style="margin:0 0 18px;font-size:19px;line-height:1.4;color:${ink};font-weight:700">${esc(problem)}</p>
${para(`${esc(construit).replace("j'ai construit une première version de votre site", "<strong>j'ai construit une première version de votre site</strong>")} <a href="${esc(link)}" style="color:${amber}">${esc(p.siteUrl.replace(/^https?:\/\//, ""))}</a>`)}
${p.previewImageUrl?.trim() ? `<p style="margin:0 0 14px"><a href="${esc(link)}"><img src="${esc(p.previewImageUrl.trim())}" width="600" alt="Aper&ccedil;u du site ${esc(p.business)}" style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #e6e1d8;border-radius:8px"></a></p>` : ""}
<p style="margin:0 0 22px"><a href="${esc(link)}" style="display:inline-block;border:2px solid ${ink};color:${ink};text-decoration:none;font-weight:700;font-size:15px;padding:10px 22px;border-radius:999px">Voir votre site &rarr;</a></p>
${para(featuresHtml)}
${para(esc(premiere))}
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${ink};font-weight:700">${esc(risque)}</p>
${adminCourtHtml ? para(adminCourtHtml) : ""}
${para(`<strong>${esc(offreLigne)}</strong> ${esc(couvre)} ${esc(domaine)}`)}
${mesPuces.length ? `<ul style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;color:${ink}">${mesPuces.map((b) => `<li style="margin:0 0 6px">${esc(b)}</li>`).join("")}</ul>` : ""}
${para(esc(cloture))}
${para(esc(cta).replace(esc(phone), `<a href="tel:${esc(phone.replace(/[^\d+]/g, ""))}" style="color:${ink};font-weight:700;text-decoration:none">${esc(phone)}</a>`))}
${forward ? para(esc(forward)) : ""}
<div style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${ink}">Au plaisir,${signatureHtml(ink, muted, amber)}</div>
${ps ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:${ink}">${esc(ps)}</p>` : ""}
<p style="margin:0;font-size:12px;line-height:1.5;color:${muted}">${esc(legal)}</p>
</div>
</body></html>`;
    return { subject, html: htmlCourt, text: textCourt };
  }

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
${para(`Plut&ocirc;t que de vous envoyer un devis, <strong>j'ai construit votre site</strong> — sans engagement&nbsp;: le regarder ne vous co&ucirc;te rien, et s'il ne vous pla&icirc;t pas, vous ne payez rien. Vous pouvez le voir ici&nbsp;: <a href="${esc(link)}" style="color:${amber}">${esc(p.siteUrl.replace(/^https?:\/\//, ""))}</a>`)}
${p.previewImageUrl?.trim() ? `<p style="margin:0 0 18px"><a href="${esc(link)}"><img src="${esc(p.previewImageUrl.trim())}" width="600" alt="Aper&ccedil;u du site ${esc(p.business)}" style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #e6e1d8;border-radius:8px"></a></p>` : ""}
<p style="margin:0 0 22px"><a href="${esc(link)}" style="display:inline-block;border:2px solid ${ink};color:${ink};text-decoration:none;font-weight:700;font-size:15px;padding:10px 22px;border-radius:999px">Voir votre site &rarr;</a></p>
${showSafety ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px"><tr><td style="background:${paper};border-radius:10px;padding:18px 20px 10px">
  <p style="margin:0 0 10px;font-size:13px;line-height:1.4;letter-spacing:.12em;text-transform:uppercase;color:${muted}">Ce que le lien fait, et ne fait pas</p>
  <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.55;color:${ink}">${safety.map((x) => `<li style="margin:0 0 8px">${esc(x)}</li>`).join("")}</ul>
</td></tr></table>` : ""}
${para(featuresHtml)}
${adminHtml ? para(adminHtml) : ""}
${para(`<strong>L'offre — ${esc(offreTitre)}&nbsp;:</strong>`)}${monthly ? para(esc(offreSousTitre)) : ""}
<ul style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.6;color:${ink}">${bullets.map((b) => `<li style="margin:0 0 6px">${esc(b)}</li>`).join("")}</ul>
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
