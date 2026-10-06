import { Link } from "wouter";
import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    code: "Erreur 404",
    title: "Cette page n'existe pas.",
    body: "Le lien est peut-être périmé, ou l'adresse comporte une faute de frappe. Voici par où reprendre.",
    home: "Retour à l'accueil",
    work: "Voir les réalisations",
    contact: "Me joindre",
  },
  en: {
    code: "Error 404",
    title: "This page does not exist.",
    body: "The link may be out of date, or the address has a typo. Here is where to pick back up.",
    home: "Back to home",
    work: "See the work",
    contact: "Get in touch",
  },
};

export default function NotFound() {
  const t = useCopy(COPY);
  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-36">
        <FadeIn className="max-w-2xl">
          <div className="chip mb-8">{t.code}</div>
          <h1 className="text-display text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-[-0.04em]">{t.title}</h1>
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed">{t.body}</p>
          <div className="mt-12 flex flex-wrap gap-6 text-sm">
            <Link href="/" className="text-primary hover:underline underline-offset-4" data-testid="link-404-home">→ {t.home}</Link>
            <Link href="/work" className="text-primary hover:underline underline-offset-4" data-testid="link-404-work">→ {t.work}</Link>
            <Link href="/contact" className="text-primary hover:underline underline-offset-4" data-testid="link-404-contact">→ {t.contact}</Link>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
