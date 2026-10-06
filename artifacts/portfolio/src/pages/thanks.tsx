import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    title: "Merci !",
    received: (id: string) => <>Votre demande de devis <strong className="font-mono text-primary px-2 py-1 bg-primary/10 border border-primary/20">{id}</strong> est bien reçue.</>,
    reply: "Je vous réponds en moins de 4 heures, du lundi au vendredi, entre 8 h et 20 h (heure de l'Est, Québec).",
    meanwhile: "D'ici là, vous pouvez réserver directement un appel de 15 minutes :",
    book: "Réserver un appel ↗",
    home: "→ Ou revenir à l'accueil",
  },
  en: {
    title: "Thanks!",
    received: (id: string) => <>Your quote request <strong className="font-mono text-primary px-2 py-1 bg-primary/10 border border-primary/20">{id}</strong> has been received.</>,
    reply: "I'll get back to you within 4 hours on weekdays (8am–8pm Eastern Time, Québec).",
    meanwhile: "In the meantime, you can book a 15-min discovery call directly:",
    book: "Book a call ↗",
    home: "→ Or go back to home",
  },
};

export default function Thanks() {
  const t = useCopy(COPY);
  const searchParams = new URLSearchParams(window.location.search);
  const quoteId = searchParams.get("quote") || "—";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32 flex justify-center text-center">
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-5xl md:text-7xl mb-8 tracking-tight">{t.title}</h1>

          <div className="space-y-6 text-lg text-muted-foreground mb-12">
            <p>{t.received(quoteId)}</p>
            <p>{t.reply}</p>
            <p>{t.meanwhile}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a
              href="https://calendly.com/mehdijabry/discovery"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              {t.book}
            </a>
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
            >
              {t.home}
            </Link>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
