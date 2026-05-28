import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">Site</h4>
            <div className="flex flex-col gap-3">
              <Link href="/work" className="text-sm hover:text-primary transition-colors">Work</Link>
              <Link href="/pricing" className="text-sm hover:text-primary transition-colors">Pricing</Link>
              <Link href="/about" className="text-sm hover:text-primary transition-colors">About</Link>
              <Link href="/legal" className="text-sm hover:text-primary transition-colors">Legal & Privacy</Link>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connect</h4>
            <div className="flex flex-col gap-3">
              <a href="https://www.linkedin.com/in/mehdijabry/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">LinkedIn</a>
              <a href="https://github.com/mehdijabry/mehdijabry" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">GitHub</a>
              <a href="https://x.com/mehdijabry" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Twitter / X</a>
              <a href="https://ds-ai-manager.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">ds-ai-manager.com</a>
              <a href="https://salwaeljaouhari.art" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">salwaeljaouhari.art</a>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:hi@mehdijabry.dev" className="text-sm hover:text-primary transition-colors">hi@mehdijabry.dev</a>
              <a href="https://calendly.com/mehdijabry/discovery" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Book a 15-min call</a>
              <span className="text-sm text-muted-foreground mt-2">Montréal, QC<br/>Canada</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Mohamed Mehdi Jabry</p>
          <p>Built with Next.js + Supabase + Resend</p>
          <a href="https://github.com/mehdijabry/mehdijabry" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Source on GitHub</a>
        </div>
      </div>
    </footer>
  );
}
