import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { useState } from "react";
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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  existingUrl: z.string().optional(),
  projectBrief: z.string().min(10, "Please describe your project (min 10 characters)").max(500, "Maximum 500 characters"),
  deadline: z.string().optional(),
  source: z.string().optional(),
});

const PROJECT_DESCRIPTIONS: Record<ProjectType, string> = {
  spark: "For indie hackers, Product Hunt launches, MVPs.",
  vitrine: "For TPE, coaches, consultants, freelancers.",
  vitrineplus: "Includes newsletter signup, booking, bilingual.",
};

function isAddonDisabled(key: AddonKey, projectType: ProjectType): boolean {
  if (key === "extraPage" && projectType === "spark") return true;
  if (key === "bilingual" && projectType === "vitrineplus") return true;
  return false;
}

function addonDisabledReason(key: AddonKey, projectType: ProjectType): string {
  if (key === "extraPage" && projectType === "spark") return "Spark is single-page — upgrade to Vitrine";
  if (key === "bilingual" && projectType === "vitrineplus") return "Already included in Vitrine+";
  return "";
}

export default function Start() {
  const [projectType, setProjectType] = useState<ProjectType>("vitrine");
  const [timeline, setTimeline] = useState<Timeline>("standard");
  const [addons, setAddons] = useState<AddonKey[]>([]);
  const [currency, setCurrency] = useState<Currency>("CAD");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const submitQuoteMutation = useSubmitQuote();

  const form = useForm<z.infer<typeof formSchema>>({
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

  function onSubmit(values: z.infer<typeof formSchema>) {
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
            title: "Error submitting quote",
            description: "Please try again or email hi@mehdijabry.dev directly.",
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
            <h1 className="font-display text-4xl mb-2">Configure your quote</h1>
            <p className="text-muted-foreground mb-12">Select your options below. The price updates in real-time.</p>

            <div className="space-y-16">

              {/* Step 1 — Project Type */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 1 — PROJECT TYPE</h2>
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
                        <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-mono px-2 py-0.5 uppercase">Recommended</span>
                      )}
                      <div className="font-medium text-sm mb-1">{v.label}</div>
                      <div className="text-xs text-muted-foreground mb-3">{PROJECT_DESCRIPTIONS[k]}</div>
                      <div className="font-mono text-sm text-primary">
                        From ${getBasePrice(k, currency).toLocaleString()} {currency}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{v.deliveryStandard}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 — Timeline */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 2 — TIMELINE</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(TIMELINES) as [Timeline, typeof TIMELINES[Timeline]][]).map(([k, v]) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setTimeline(k)}
                      data-testid={`button-timeline-${k}`}
                      className={`text-left p-6 border transition-all ${timeline === k ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground"}`}
                    >
                      <div className="font-medium">{v.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {v.multiplier === 1.0 ? "Included" : `+${Math.round((v.multiplier - 1) * 100)}%`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 — Add-ons */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 3 — ADD-ONS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(ADDONS) as [AddonKey, typeof ADDONS[AddonKey]][]).map(([k, v]) => {
                    const disabled = isAddonDisabled(k, projectType);
                    const reason = addonDisabledReason(k, projectType);
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
                          <span className="text-sm">{v.label}</span>
                          <span className="text-sm font-mono shrink-0">
                            +${getAddonPrice(k, currency)}{"recurring" in v ? "/mo" : ""}
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
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 4 — CONTACT INFO</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl><Input data-testid="input-name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl><Input data-testid="input-email" type="email" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company (optional)</FormLabel>
                          <FormControl><Input data-testid="input-company" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="existingUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Existing URL (optional)</FormLabel>
                          <FormControl><Input data-testid="input-url" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="projectBrief" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Brief *</FormLabel>
                        <FormControl>
                          <Textarea
                            data-testid="input-brief"
                            className="h-32"
                            placeholder="Tell me about your goals, reference sites, timeline constraints..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="deadline" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline (optional)</FormLabel>
                          <FormControl><Input data-testid="input-deadline" type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="source" render={({ field }) => (
                        <FormItem>
                          <FormLabel>How did you hear about me?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-source">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="twitter">Twitter / X</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="google">Google</SelectItem>
                              <SelectItem value="cold-email">Cold email</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="pt-6 border-t border-border mt-8">
                      <div className="mb-6 p-4 bg-muted/30 border border-border text-sm text-muted-foreground">
                        <strong className="text-foreground">Review:</strong> {PROJECT_TYPES[projectType].label} · {TIMELINES[timeline].label}
                        {addons.length > 0 && ` · ${addons.length} add-on${addons.length > 1 ? "s" : ""}`}
                        <span className="ml-4 font-mono text-primary font-medium">
                          Total: ${total.toLocaleString()} {currency}
                          {recurring > 0 && ` + $${recurring}/mo`}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={submitQuoteMutation.isPending}
                        data-testid="button-submit"
                        className="inline-flex h-14 w-full sm:w-auto items-center justify-center whitespace-nowrap px-10 text-lg font-serif transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {submitQuoteMutation.isPending ? "Submitting..." : "Submit Quote Request →"}
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
              <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground">QUOTE ESTIMATE</h3>
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
                <span className="text-muted-foreground">Tier</span>
                <span className="font-medium text-xs text-right">{PROJECT_TYPES[projectType].label.split(" — ")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price</span>
                <span>${display.base.toLocaleString()}</span>
              </div>
              {addons.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons ({addons.length})</span>
                  <span>+${display.addons.toLocaleString()}</span>
                </div>
              )}
              {timeline !== "standard" && (
                <div className="flex justify-between text-primary">
                  <span>Express (+30%)</span>
                  <span>+${(display.total - display.base - display.addons).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-end">
                <span className="font-medium">Total</span>
                <span className="font-serif text-3xl" data-testid="text-total">
                  ${total.toLocaleString()} <span className="text-sm font-sans text-muted-foreground">{currency}</span>
                </span>
              </div>
              {recurring > 0 && (
                <p className="text-right text-xs text-muted-foreground mt-1">+ ${recurring}/mo recurring</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{timeline === "standard" ? PROJECT_TYPES[projectType].deliveryStandard : PROJECT_TYPES[projectType].deliveryExpress}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground text-center">
              No payment required to request a quote.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
