import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { useMemo, useState } from "react";
import {
  PROJECT_TYPES, TIMELINES, ADDONS, CURRENCIES,
  ProjectType, Timeline, AddonKey, Currency,
  calculateQuote, calculateQuoteDisplay, getBasePrice, getAddonPrice
} from "@/lib/pricing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useCopy, useLang } from "@/lib/i18n";
import { ADDON_COPY, PROJECT_COPY, TIMELINE_COPY } from "@/lib/pricing-copy";

const COPY = {
  fr: {
    title: "Configurez votre devis", lede: "Choisissez vos options ci-dessous. Le prix se met à jour en direct.",
    step1: "Étape 1 — Type de projet", step2: "Étape 2 — Délai", step3: "Étape 3 — Options", step4: "Étape 4 — Vos coordonnées",
    recommended: "Recommandé", from: "À partir de", included: "Inclus",
    descriptions: {
      spark: "Pour les créateurs indépendants, les lancements, les produits minimum viables.",
      vitrine: "Pour les TPE, coachs, consultants et travailleurs autonomes.",
      vitrineplus: "Infolettre, prise de rendez-vous et site bilingue inclus.",
    } as Record<ProjectType, string>,
    disabled: {
      extraPage: "Spark tient sur une page — passez à Vitrine",
      bilingual: "Déjà inclus dans Vitrine+",
    } as Record<string, string>,
    name: "Nom *", email: "Courriel *", company: "Entreprise (facultatif)", url: "Site actuel (facultatif)",
    brief: "Votre projet *", briefPlaceholder: "Dites-moi vos objectifs, les sites qui vous plaisent, vos contraintes de délai…",
    deadline: "Échéance (facultatif)", source: "Comment m'avez-vous connu ?", selectPlaceholder: "Choisir…",
    sources: { linkedin: "LinkedIn", twitter: "Twitter / X", referral: "Recommandation", google: "Google", "cold-email": "Courriel de prospection", other: "Autre" } as Record<string, string>,
    review: "Récapitulatif :", option: "option", options: "options", total: "Total :",
    submitting: "Envoi en cours…", submit: "Envoyer la demande de devis →",
    errorTitle: "Envoi impossible", errorBody: "Réessayez, ou écrivez-moi directement à contact@mehdijabry.dev.",
    panel: "Estimation", tier: "Formule", base: "Prix de base", addonsLabel: "Options", express: "Express (+30 %)",
    totalLabel: "Total", recurring: "/mois en abonnement", delivery: "Livraison",
    noPayment: "Aucun paiement n'est demandé pour obtenir un devis.",
    errors: { name: "Le nom est requis", email: "Un courriel valide est requis", briefMin: "Décrivez votre projet (10 caractères minimum)", briefMax: "500 caractères maximum" },
  },
  en: {
    title: "Configure your quote", lede: "Select your options below. The price updates in real time.",
    step1: "Step 1 — Project type", step2: "Step 2 — Timeline", step3: "Step 3 — Add-ons", step4: "Step 4 — Contact info",
    recommended: "Recommended", from: "From", included: "Included",
    descriptions: {
      spark: "For indie hackers, Product Hunt launches, MVPs.",
      vitrine: "For small businesses, coaches, consultants, freelancers.",
      vitrineplus: "Includes newsletter signup, booking, bilingual.",
    } as Record<ProjectType, string>,
    disabled: {
      extraPage: "Spark is single-page — upgrade to Vitrine",
      bilingual: "Already included in Vitrine+",
    } as Record<string, string>,
    name: "Name *", email: "Email *", company: "Company (optional)", url: "Existing URL (optional)",
    brief: "Project brief *", briefPlaceholder: "Tell me about your goals, reference sites, timeline constraints…",
    deadline: "Deadline (optional)", source: "How did you hear about me?", selectPlaceholder: "Select…",
    sources: { linkedin: "LinkedIn", twitter: "Twitter / X", referral: "Referral", google: "Google", "cold-email": "Cold email", other: "Other" } as Record<string, string>,
    review: "Review:", option: "add-on", options: "add-ons", total: "Total:",
    submitting: "Submitting…", submit: "Submit quote request →",
    errorTitle: "Error submitting quote", errorBody: "Please try again or email contact@mehdijabry.dev directly.",
    panel: "Quote estimate", tier: "Tier", base: "Base price", addonsLabel: "Add-ons", express: "Express (+30%)",
    totalLabel: "Total", recurring: "/mo recurring", delivery: "Delivery",
    noPayment: "No payment required to request a quote.",
    errors: { name: "Name is required", email: "Valid email is required", briefMin: "Please describe your project (min 10 characters)", briefMax: "Maximum 500 characters" },
  },
};

type FormValues = { name: string; email: string; company?: string; existingUrl?: string; projectBrief: string; deadline?: string; source?: string };

function isAddonDisabled(key: AddonKey, projectType: ProjectType): boolean {
  if (key === "extraPage" && projectType === "spark") return true;
  if (key === "bilingual" && projectType === "vitrineplus") return true;
  return false;
}

export default function Start() {
  const { lang } = useLang();
  const t = useCopy(COPY);
  const projectCopy = PROJECT_COPY[lang], timelineCopy = TIMELINE_COPY[lang], addonCopy = ADDON_COPY[lang];
  const nf = (n: number) => n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");

  // Le schéma porte les messages d'erreur : il se reconstruit quand la langue change.
  const formSchema = useMemo(() => z.object({
    name: z.string().min(1, t.errors.name),
    email: z.string().email(t.errors.email),
    company: z.string().optional(),
    existingUrl: z.string().optional(),
    projectBrief: z.string().min(10, t.errors.briefMin).max(500, t.errors.briefMax),
    deadline: z.string().optional(),
    source: z.string().optional(),
  }), [t]);

  const [projectType, setProjectType] = useState<ProjectType>("vitrine");
  const [timeline, setTimeline] = useState<Timeline>("standard");
  const [addons, setAddons] = useState<AddonKey[]>([]);
  const [currency, setCurrency] = useState<Currency>("CAD");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const submitQuoteMutation = useSubmitQuote();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      existingUrl: "",
      projectBrief: "",
      deadline: "",
      source: "",
    },
  });

  const quote = calculateQuote(projectType, timeline, addons);
  const display = calculateQuoteDisplay(projectType, timeline, addons, currency);
  const total = display.total;
  const recurring = display.recurring;

  function onSubmit(values: FormValues) {
    submitQuoteMutation.mutate(
      {
        data: {
          projectType: projectType as any,
          timeline: timeline as any,
          addons,
          preferredCurrency: currency as any,
          ...values,
        },
      },
      {
        onSuccess: (res) => {
          setLocation(`/thanks?quote=${res.quoteNumber}`);
        },
        onError: () => {
          toast({
            title: t.errorTitle,
            description: t.errorBody,
            variant: "destructive",
          });
        },
      }
    );
  }

  function toggleAddon(key: AddonKey) {
    if (isAddonDisabled(key, projectType)) return;
    setAddons(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function handleProjectTypeChange(type: ProjectType) {
    setProjectType(type);
    setAddons(prev => prev.filter(k => !isAddonDisabled(k, type)));
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col lg:flex-row gap-12 relative">

        {/* Form Area */}
        <div className="lg:w-[70%]">
          <FadeIn>
            <h1 className="font-display text-4xl mb-2">{t.title}</h1>
            <p className="text-muted-foreground mb-12">{t.lede}</p>

            <div className="space-y-16">

              {/* Step 1 — Project Type */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">{t.step1}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(Object.entries(PROJECT_TYPES) as [ProjectType, typeof PROJECT_TYPES[ProjectType]][]).map(([k, v]) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => handleProjectTypeChange(k)}
                      data-testid={`button-project-${k}`}
                      className={`relative text-left p-6 border transition-all ${projectType === k ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground"}`}
                    >
                      {k === "vitrine" && (
                        <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-mono px-2 py-0.5 uppercase">{t.recommended}</span>
                      )}
                      <div className="font-medium text-sm mb-1">{projectCopy[k].label}</div>
                      <div className="text-xs text-muted-foreground mb-3">{t.descriptions[k]}</div>
                      <div className="font-mono text-sm text-primary">
                        {t.from} ${nf(getBasePrice(k, currency))} {currency}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{projectCopy[k].deliveryStandard}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 — Timeline */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">{t.step2}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(TIMELINES) as [Timeline, typeof TIMELINES[Timeline]][]).map(([k, v]) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setTimeline(k)}
                      data-testid={`button-timeline-${k}`}
                      className={`text-left p-6 border transition-all ${timeline === k ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground"}`}
                    >
                      <div className="font-medium">{timelineCopy[k]}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {v.multiplier === 1.0 ? t.included : `+${Math.round((v.multiplier - 1) * 100)} %`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 — Add-ons */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">{t.step3}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(ADDONS) as [AddonKey, typeof ADDONS[AddonKey]][]).map(([k, v]) => {
                    const disabled = isAddonDisabled(k, projectType);
                    const reason = disabled ? (t.disabled[k] ?? "") : "";
                    const selected = addons.includes(k);
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => toggleAddon(k)}
                        disabled={disabled}
                        data-testid={`button-addon-${k}`}
                        className={`text-left p-4 border transition-all flex flex-col gap-1 ${
                          disabled
                            ? "border-border/30 bg-card/30 opacity-50 cursor-not-allowed"
                            : selected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">{addonCopy[k]}</span>
                          <span className="text-sm font-mono shrink-0">
                            +${getAddonPrice(k, currency)}{"recurring" in v ? (lang === "fr" ? "/mois" : "/mo") : ""}
                          </span>
                        </div>
                        {disabled && reason && (
                          <span className="text-xs text-muted-foreground italic">{reason}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4 — Contact Info */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">{t.step4}</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.name}</FormLabel>
                          <FormControl><Input data-testid="input-name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.email}</FormLabel>
                          <FormControl><Input data-testid="input-email" type="email" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.company}</FormLabel>
                          <FormControl><Input data-testid="input-company" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="existingUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.url}</FormLabel>
                          <FormControl><Input data-testid="input-url" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="projectBrief" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.brief}</FormLabel>
                        <FormControl>
                          <Textarea
                            data-testid="input-brief"
                            className="h-32"
                            placeholder={t.briefPlaceholder}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="deadline" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.deadline}</FormLabel>
                          <FormControl><Input data-testid="input-deadline" type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="source" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.source}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-source">
                                <SelectValue placeholder={t.selectPlaceholder} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(t.sources).map(([v, label]) => (
                                <SelectItem key={v} value={v}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="pt-6 border-t border-border mt-8">
                      <div className="mb-6 p-4 bg-muted/30 border border-border text-sm text-muted-foreground">
                        <strong className="text-foreground">{t.review}</strong> {projectCopy[projectType].label} · {timelineCopy[timeline]}
                        {addons.length > 0 && ` · ${addons.length} ${addons.length > 1 ? t.options : t.option}`}
                        <span className="ml-4 font-mono text-primary font-medium">
                          {t.total} ${nf(total)} {currency}
                          {recurring > 0 && ` + $${recurring}${lang === "fr" ? "/mois" : "/mo"}`}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={submitQuoteMutation.isPending}
                        data-testid="button-submit"
                        className="inline-flex h-14 w-full sm:w-auto items-center justify-center whitespace-nowrap px-10 text-lg font-serif transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {submitQuoteMutation.isPending ? t.submitting : t.submit}
                      </button>
                    </div>
                  </form>
                </Form>
              </div>

            </div>
          </FadeIn>
        </div>

        {/* Sticky Right Panel */}
        <div className="lg:w-[30%] relative">
          <div className="sticky top-24 border border-primary/20 bg-card p-6 shadow-xl" data-testid="panel-price">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground">{t.panel}</h3>
              <div className="flex bg-background border border-border p-1">
                {(["CAD", "USD", "EUR", "GBP"] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    data-testid={`button-panel-currency-${c.toLowerCase()}`}
                    className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${currency === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.tier}</span>
                <span className="font-medium text-xs text-right">{projectCopy[projectType].label.split(" — ")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.base}</span>
                <span>${nf(display.base)}</span>
              </div>
              {addons.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.addonsLabel} ({addons.length})</span>
                  <span>+${nf(display.addons)}</span>
                </div>
              )}
              {timeline !== "standard" && (
                <div className="flex justify-between text-primary">
                  <span>{t.express}</span>
                  <span>+${nf(display.total - display.base - display.addons)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-end">
                <span className="font-medium">{t.totalLabel}</span>
                <span className="font-serif text-3xl" data-testid="text-total">
                  ${nf(total)} <span className="text-sm font-sans text-muted-foreground">{currency}</span>
                </span>
              </div>
              {recurring > 0 && (
                <p className="text-right text-xs text-muted-foreground mt-1">+ ${recurring}{t.recurring}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>{t.delivery}</span>
                <span>{timeline === "standard" ? projectCopy[projectType].deliveryStandard : projectCopy[projectType].deliveryExpress}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground text-center">
              {t.noPayment}
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
