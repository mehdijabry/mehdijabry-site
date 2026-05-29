import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { Link, useLocation } from "wouter";

export default function Thanks() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const quoteId = searchParams.get("quote") || "UNKNOWN";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32 flex justify-center text-center">
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-5xl md:text-7xl mb-8 tracking-tight">Thanks!</h1>
          
          <div className="space-y-6 text-lg text-muted-foreground mb-12">
            <p>
              Your quote request <strong className="font-mono text-primary px-2 py-1 bg-primary/10 border border-primary/20">{quoteId}</strong> has been received.
            </p>
            <p>
              I'll get back to you within 4 hours during weekdays (8am-8pm Eastern Time, Montréal).
            </p>
            <p>
              In the meantime, you can book a 15-min discovery call directly:
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a 
              href="https://calendly.com/mehdijabry/discovery" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              Book discovery call ↗
            </a>
            <Link 
              href="/" 
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-none px-8 text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
            >
              → Or go back to home
            </Link>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
}
