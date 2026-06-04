import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Work from "@/pages/work";
import Pricing from "@/pages/pricing";
import Start from "@/pages/start";
import About from "@/pages/about";
import Thanks from "@/pages/thanks";
import Legal from "@/pages/legal";

import { SmoothScrollProvider } from "@/components/effects/smooth-scroll-provider";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { Aurora } from "@/components/effects/aurora";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/work" component={Work} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/start" component={Start} />
      <Route path="/about" component={About} />
      <Route path="/thanks" component={Thanks} />
      <Route path="/legal" component={Legal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScrollProvider>
          <Aurora fixed intensity={0.45} />
          <ScrollProgress />
          <CustomCursor />
          <div className="relative z-10">
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </div>
          <Toaster />
        </SmoothScrollProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
