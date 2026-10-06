import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Reveal } from "@/components/effects/reveal";
import { CtaButton } from "@/components/effects/cta-button";
import { cn } from "@/lib/utils";

/**
 * /contact (2026-10-06) — la page d'atterrissage du bouton « Site Web » de la fiche Google.
 *
 * Google n'affiche aucune adresse courriel sur une fiche d'entreprise : le seul chemin entre un
 * commerçant qui vient de voir la fiche et un courriel, c'est cette page. Le courriel est donc la
 * PREMIÈRE chose à l'écran — pas un formulaire, pas un pied de page — et le téléphone juste dessous.
 *
 * Deux publics s'y croisent : les commerces d'ici, qui arrivent de la fiche Google en français, et les
 * clients anglophones du reste du site. La page choisit sa langue d'après celle du navigateur, et un
 * sélecteur permet d'en changer — plutôt que d'imposer l'anglais à un commerçant de Trois-Rivières.
 *
 * Les coordonnées sont celles des réglages de production (GET /api/admin/settings, relevées le
 * 06/10/2026) : contact@mehdijabry.dev et 438 525-7119. Aucune adresse postale : l'entreprise n'a pas
 * de vitrine, et l'adresse personnelle n'a rien à faire sur une page publique.
 */
const EMAIL = "contact@mehdijabry.dev";
const PHONE_DISPLAY = "438 525-7119";
const PHONE_HREF = "+14385257119";

type Lang = "fr" | "en";

const COPY = {
  fr: {
    eyebrow: "Contact · Trois-Rivières",
    title: "Dites-moi ce qu'il vous faut.",
    lede:
      "Vous m'écrivez ce que votre commerce fait et ce que le site doit permettre. Je vous réponds avec une proposition claire — et si on s'entend, votre site est en ligne en 48 heures.",
    emailLabel: "Écrivez-moi",
    phoneLabel: "Ou appelez-moi",
    reply: "Je réponds le jour même, souvent dans l'heure.",
    helpTitle: "Ce qui m'aide à vous répondre vite",
    help: [
      "Le nom de votre commerce et ce que vous y faites.",
      "Ce que le site doit permettre : montrer un menu, prendre des réservations, vendre en ligne, afficher vos horaires…",
      "Si vous avez déjà un nom de domaine, des photos ou un logo.",
      "Pour quand vous le voulez.",
    ],
    areaTitle: "Où je me déplace",
    area:
      "Partout à Trois-Rivières — centre-ville, Cap-de-la-Madeleine, Trois-Rivières-Ouest, Pointe-du-Lac, Saint-Louis-de-France, Sainte-Marthe-du-Cap — et jusqu'à Shawinigan, Louiseville, Drummondville et Sorel-Tracy. Je passe vous montrer le travail à votre comptoir.",
    seeWork: "Voir les réalisations",
    seeWorkHover: "37 sites",
    quote: "Configurer un devis",
    quoteHover: "En 2 minutes",
    switch: "English",
  },
  en: {
    eyebrow: "Contact · Trois-Rivières, QC",
    title: "Tell me what you need.",
    lede:
      "Write me what your business does and what the site has to do. You get a clear proposal back — and if we agree, your site is live within 48 hours.",
    emailLabel: "Email me",
    phoneLabel: "Or call me",
    reply: "I reply the same day, often within the hour.",
    helpTitle: "What helps me answer fast",
    help: [
      "Your business name and what you do.",
      "What the site has to do: show a menu, take bookings, sell online, display your hours…",
      "Whether you already have a domain name, photos or a logo.",
      "When you need it.",
    ],
    areaTitle: "Where I travel",
    area:
      "Anywhere in Trois-Rivières — downtown, Cap-de-la-Madeleine, Trois-Rivières-Ouest, Pointe-du-Lac, Saint-Louis-de-France, Sainte-Marthe-du-Cap — and out to Shawinigan, Louiseville, Drummondville and Sorel-Tracy. I come to your counter to show you the work.",
    seeWork: "See the work",
    seeWorkHover: "37 sites",
    quote: "Configure a quote",
    quoteHover: "2 minutes",
    switch: "Français",
  },
} as const;

/** Français par défaut pour un navigateur francophone — celui d'un commerçant venu de la fiche Google. */
function initialLang(): Lang {
  if (typeof navigator === "undefined") return "fr";
  return /^fr\b/i.test(navigator.language ?? "") ? "fr" : "en";
}

export default function Contact() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = COPY[lang];

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-12 md:pt-20 lg:pt-28 pb-4">
        <div className="max-w-5xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <span className="chip">{t.eyebrow}</span>
              <button
                type="button"
                onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                className="chip hover:text-foreground hover:border-border transition-colors"
                data-testid="button-contact-lang"
              >
                {t.switch}
              </button>
            </div>
            <h1 className="text-display text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-[-0.04em]">
              {t.title}
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {t.lede}
            </p>
          </Reveal>

          {/* Le courriel d'abord : c'est la raison d'être de la page. */}
          <Reveal delay={0.12}>
            <div className="mt-14 md:mt-20 border border-border/60 divide-y divide-border/60">
              {[
                { label: t.emailLabel, value: EMAIL, href: `mailto:${EMAIL}`, testid: "link-contact-email", big: true },
                { label: t.phoneLabel, value: PHONE_DISPLAY, href: `tel:${PHONE_HREF}`, testid: "link-contact-phone", big: false },
              ].map((row) => (
                <a
                  key={row.testid}
                  href={row.href}
                  data-testid={row.testid}
                  data-magnetic
                  className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 px-5 md:px-9 py-7 md:py-9 hover:bg-muted/40 transition-colors duration-500"
                >
                  <span className="text-mark text-muted-foreground w-full md:w-48 shrink-0">{row.label}</span>
                  <span
                    className={cn(
                      "font-display tracking-[-0.03em] break-all transition-transform duration-500 group-hover:translate-x-1",
                      row.big ? "text-[clamp(26px,4.4vw,52px)]" : "text-[clamp(22px,3vw,38px)] text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {row.value}
                  </span>
                  <span className="text-primary text-xl md:text-2xl ml-auto transition-transform duration-500 group-hover:rotate-45">↗</span>
                </a>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-3 text-mark text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
              {t.reply}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mt-20 md:mt-28">
            <Reveal className="md:col-span-7" delay={0.08}>
              <h2 className="font-display text-2xl md:text-3xl tracking-[-0.02em] mb-7">{t.helpTitle}</h2>
              <ul className="space-y-4">
                {t.help.map((line) => (
                  <li key={line} className="flex gap-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                    <span className="text-primary shrink-0">→</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="md:col-span-4 md:col-start-9" delay={0.16}>
              <h2 className="font-display text-2xl md:text-3xl tracking-[-0.02em] mb-7">{t.areaTitle}</h2>
              <p className="text-base text-muted-foreground leading-relaxed">{t.area}</p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="mt-16 md:mt-24 pt-10 border-t border-border/40 flex flex-col sm:flex-row gap-4">
              <CtaButton to="/work" variant="ghost" hoverLabel={t.seeWorkHover} data-testid="link-contact-work">
                {t.seeWork}
              </CtaButton>
              <CtaButton to="/start" variant="primary" hoverLabel={t.quoteHover} data-testid="link-contact-quote">
                {t.quote}
              </CtaButton>
            </div>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
}
