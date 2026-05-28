import { Layout } from "@/components/layout/layout";
import { FadeIn } from "@/components/ui/fade-in";
import { useState } from "react";
import { PROJECT_TYPES, TIMELINES, ADDONS, CURRENCIES, ProjectType, Timeline, AddonKey, Currency, calculateQuote } from "@/lib/pricing";
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
  projectBrief: z.string().min(10, "Please provide a brief description").max(500, "Maximum 500 characters"),
  deadline: z.string().optional(),
  source: z.string().optional()
});

export default function Start() {
  const [projectType, setProjectType] = useState<ProjectType>("landing");
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
      source: ""
    }
  });

  const quote = calculateQuote(projectType, timeline, addons);
  const total = Math.round(quote.totalUSD * CURRENCIES[currency].rate);
  const recurring = Math.round(quote.recurringUSD * CURRENCIES[currency].rate);

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitQuoteMutation.mutate({
      data: {
        projectType: projectType as any,
        timeline: timeline as any,
        addons,
        preferredCurrency: currency as any,
        ...values
      }
    }, {
      onSuccess: (res) => {
        setLocation(`/thanks?quote=${res.quoteNumber}`);
      },
      onError: () => {
        toast({
          title: "Error submitting quote",
          description: "Please try again later or email directly.",
          variant: "destructive"
        });
      }
    });
  }

  const toggleAddon = (key: AddonKey) => {
    setAddons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col lg:flex-row gap-12 relative">
        {/* Form Area */}
        <div className="lg:w-[70%]">
          <FadeIn>
            <h1 className="font-serif text-4xl mb-2">Configure your quote</h1>
            <p className="text-muted-foreground mb-12">Select your options below. The price updates in real-time.</p>

            <div className="space-y-16">
              {/* Step 1 */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 1 — PROJECT TYPE</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(PROJECT_TYPES) as [ProjectType, typeof PROJECT_TYPES[ProjectType]][]).map(([k, v]) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setProjectType(k)}
                      className={`text-left p-6 border transition-all ${projectType === k ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'}`}
                    >
                      <div className="font-medium">{v.label}</div>
                      <div className="text-sm text-muted-foreground mt-2">Base: ${Math.round(v.baseUSD * CURRENCIES[currency].rate)} {currency}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 2 — TIMELINE</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(Object.entries(TIMELINES) as [Timeline, typeof TIMELINES[Timeline]][]).map(([k, v]) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setTimeline(k)}
                      className={`text-left p-6 border transition-all ${timeline === k ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'}`}
                    >
                      <div className="font-medium">{v.label}</div>
                      <div className="text-sm text-muted-foreground mt-2">{v.multiplier === 1.0 ? 'Included' : `+${Math.round((v.multiplier - 1)*100)}%`}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 3 — ADD-ONS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.entries(ADDONS) as [AddonKey, typeof ADDONS[AddonKey]][]).map(([k, v]) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => toggleAddon(k)}
                      className={`text-left p-4 border transition-all flex items-center justify-between ${addons.includes(k) ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'}`}
                    >
                      <span className="text-sm">{v.label}</span>
                      <span className="text-sm font-mono">+${Math.round(v.usd * CURRENCIES[currency].rate)}{'recurring' in v ? '/mo' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4 & 5 */}
              <div>
                <h2 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-6">STEP 4 — CONTACT INFO</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem><FormLabel>Company (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="existingUrl" render={({ field }) => (
                        <FormItem><FormLabel>Existing URL (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="projectBrief" render={({ field }) => (
                      <FormItem><FormLabel>Project Brief *</FormLabel><FormControl><Textarea className="h-32" placeholder="Tell me about your goals, reference sites, etc." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="deadline" render={({ field }) => (
                        <FormItem><FormLabel>Deadline (optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="source" render={({ field }) => (
                        <FormItem>
                          <FormLabel>How did you hear about me?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="twitter">Twitter / X</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="google">Google</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="pt-6 border-t border-border mt-8 flex justify-end">
                      <button type="submit" disabled={submitQuoteMutation.isPending} className="inline-flex h-14 items-center justify-center whitespace-nowrap px-10 text-lg font-serif transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto">
                        {submitQuoteMutation.isPending ? "Submitting..." : "Submit Quote Request"}
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
          <div className="sticky top-24 border border-primary/20 bg-card p-6 shadow-xl">
            <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-4 flex justify-between items-center">
              QUOTE ESTIMATE
              <div className="flex bg-background border border-border p-1">
                {(["CAD", "USD", "EUR", "GBP"] as const).map(c => (
                  <button key={c} onClick={() => setCurrency(c)} className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </h3>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base ({PROJECT_TYPES[projectType].label})</span>
                <span>${Math.round(quote.baseUSD * CURRENCIES[currency].rate)}</span>
              </div>
              {addons.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons ({addons.length})</span>
                  <span>+${Math.round(quote.addonsUSD * CURRENCIES[currency].rate)}</span>
                </div>
              )}
              {timeline !== 'standard' && (
                <div className="flex justify-between text-primary">
                  <span>{TIMELINES[timeline].label}</span>
                  <span>+${Math.round((quote.totalUSD - quote.subtotalUSD) * CURRENCIES[currency].rate)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border mb-2">
              <div className="flex justify-between items-end">
                <span className="font-medium">Total</span>
                <span className="font-serif text-3xl">${total.toLocaleString()} <span className="text-sm font-sans text-muted-foreground">{currency}</span></span>
              </div>
            </div>

            {recurring > 0 && (
              <div className="text-right text-xs text-muted-foreground mt-2">
                + ${recurring}/mo recurring
              </div>
            )}
            
            <div className="mt-8 text-xs text-muted-foreground text-center">
              No payment required to request a quote.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
