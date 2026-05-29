import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";

export function Nav() {
  const [isDark, setIsDark] = useState(true); // Dark is default

  useEffect(() => {
    // Check localStorage or system preference, default to dark
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="44" height="32" viewBox="0 0 66 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-105 shrink-0">
            <text x="16" y="36" textAnchor="middle" fontFamily="Georgia, serif" fontSize="38" fontWeight="500" fill="currentColor" letterSpacing="-1">M</text>
            <circle cx="33" cy="32" r="3.5" fill="#D4A464"/>
            <text x="50" y="36" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fontWeight="500" fill="#D4A464" letterSpacing="-1">J</text>
          </svg>
          <div className="flex flex-col gap-0">
            <span className="font-display text-lg font-medium tracking-tight leading-tight">
              Mehdi Jabry<span className="text-primary">.</span>
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Independent Web Studio
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/work" className="nav-link">Work</Link>
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <Link href="/about" className="nav-link">About</Link>
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border/50">
            <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/start" className="inline-flex h-9 items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
              Try a quote →
            </Link>
          </div>
        </nav>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={toggleTheme} className="text-muted-foreground">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full h-full max-w-none border-none bg-background rounded-none m-0 pt-16 px-6">
              <DialogTitle className="sr-only">Mobile Navigation</DialogTitle>
              <div className="flex flex-col gap-8 text-2xl font-serif mt-12">
                <DialogClose asChild><Link href="/">Home</Link></DialogClose>
                <DialogClose asChild><Link href="/work">Work</Link></DialogClose>
                <DialogClose asChild><Link href="/pricing">Pricing</Link></DialogClose>
                <DialogClose asChild><Link href="/about">About</Link></DialogClose>
                <DialogClose asChild>
                  <Link href="/start" className="mt-8 text-primary">Try a quote →</Link>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
