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
import AdminDashboard from "@/pages/admin/index";
import AdminInvoices from "@/pages/admin/factures";
import AdminInvoiceEditor from "@/pages/admin/facture";
import AdminClients from "@/pages/admin/clients";
import AdminEmails from "@/pages/admin/courriels";
import AdminSettings from "@/pages/admin/parametres";

import { SmoothScrollProvider } from "@/components/effects/smooth-scroll-provider";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { Aurora } from "@/components/effects/aurora";

// No automatic retry and networkMode "always": a failed request must surface as an error right away. With
// retries, react-query parks the query in a "paused" state while the tab is hidden or believed offline, and a
// paused query renders like an empty result instead of an error (the admin pages rely on isError).
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0, networkMode: "always" }, mutations: { networkMode: "always" } },
});

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
      {/* Espace admin (2026-09-23) : facturation + courriels, protégé par ADMIN_PASSWORD côté serveur */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/factures" component={AdminInvoices} />
      <Route path="/admin/factures/:id" component={AdminInvoiceEditor} />
      <Route path="/admin/clients" component={AdminClients} />
      <Route path="/admin/courriels" component={AdminEmails} />
      <Route path="/admin/parametres" component={AdminSettings} />
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
