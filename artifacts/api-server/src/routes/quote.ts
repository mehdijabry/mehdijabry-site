import { Router, type IRouter } from "express";
import { SubmitQuoteBody } from "@workspace/api-zod";
import { db, quoteRequestsTable } from "@workspace/db";
import { like, desc } from "drizzle-orm";
import { Resend } from "resend";

const router: IRouter = Router();

const PROJECT_TYPES = {
  landing:  { label: "Landing page (1 page)",          baseUSD: 990  },
  showcase: { label: "Showcase site (3-5 pages)",       baseUSD: 1890 },
  booking:  { label: "Site with booking/forms (5+)",    baseUSD: 2790 },
  app:      { label: "Mini-app or custom (login/dash)", baseUSD: 3790 },
} as const;

const TIMELINES = {
  standard: { label: "Standard (72h to 14 days)", multiplier: 1.0 },
  express:  { label: "Express (-2 days)",         multiplier: 1.3 },
  rush:     { label: "Rush (50% faster)",         multiplier: 1.5 },
} as const;

const ADDONS: Record<string, { label: string; usd: number; recurring?: boolean }> = {
  copywriting: { label: "Copywriting included (FR or EN)", usd: 400  },
  language:    { label: "Additional language",             usd: 320  },
  stripe_int:  { label: "Stripe payment integration",      usd: 320  },
  migration:   { label: "Migration from existing platform",usd: 250  },
  logo:        { label: "Logo (typographic, simple)",       usd: 250  },
  photos:      { label: "Curated stock photos (10-20)",     usd: 120  },
  resend_int:  { label: "Resend transactional emails",      usd: 250  },
  training:    { label: "1h training for content updates",  usd: 120  },
  maintenance: { label: "Monthly maintenance retainer",     usd: 129, recurring: true },
};

function calculateQuote(
  projectType: string,
  timeline: string,
  addonKeys: string[],
): { baseUSD: number; addonsUSD: number; totalUSD: number } {
  const base = PROJECT_TYPES[projectType as keyof typeof PROJECT_TYPES]?.baseUSD ?? 990;
  const multiplier = TIMELINES[timeline as keyof typeof TIMELINES]?.multiplier ?? 1.0;
  const oneOffAddons = addonKeys
    .filter((k) => ADDONS[k] && !ADDONS[k].recurring)
    .reduce((sum, k) => sum + (ADDONS[k]?.usd ?? 0), 0);
  const subtotal = base + oneOffAddons;
  const total = Math.round(subtotal * multiplier * 100) / 100;
  return { baseUSD: base, addonsUSD: oneOffAddons, totalUSD: total };
}

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `M${year}-`;
  const rows = await db
    .select({ quoteNumber: quoteRequestsTable.quoteNumber })
    .from(quoteRequestsTable)
    .where(like(quoteRequestsTable.quoteNumber, `${prefix}%`))
    .orderBy(desc(quoteRequestsTable.id))
    .limit(1);

  const last = rows[0]?.quoteNumber;
  let nextNum = 1;
  if (last) {
    const parts = last.split("-");
    nextNum = (parseInt(parts[1] ?? "0", 10) || 0) + 1;
  }
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

router.post("/quote", async (req, res) => {
  const parsed = SubmitQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const body = parsed.data;
  const { baseUSD, totalUSD } = calculateQuote(body.projectType, body.timeline, body.addons);

  try {
    const quoteNumber = await generateQuoteNumber();

    await db.insert(quoteRequestsTable).values({
      quoteNumber,
      projectType: body.projectType,
      timeline: body.timeline,
      addons: body.addons,
      basePriceUsd: String(baseUSD),
      totalUsd: String(totalUSD),
      preferredCurrency: body.preferredCurrency,
      name: body.name,
      email: body.email,
      company: body.company ?? null,
      existingUrl: body.existingUrl ?? null,
      projectBrief: body.projectBrief,
      deadline: body.deadline ?? null,
      source: body.source ?? null,
    });

    const resendApiKey = process.env["RESEND_API_KEY"];
    const fromEmail = process.env["RESEND_FROM_EMAIL"] ?? "hi@mehdijabry.dev";
    const toEmail = process.env["RESEND_TO_EMAIL"] ?? "hi@mehdijabry.dev";

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const addonLabels = body.addons.map((k) => ADDONS[k]?.label ?? k).join(", ") || "None";

      await Promise.allSettled([
        resend.emails.send({
          from: `Mehdi Jabry Studio <${fromEmail}>`,
          to: body.email,
          subject: `Your quote request ${quoteNumber} has been received`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #0A0A0A; color: #F5F5F0;">
              <h1 style="font-size: 28px; font-weight: 500;">Thanks, ${body.name}.</h1>
              <p style="color: #8A8A85; font-size: 14px;">Quote: <strong style="color: #D4A464;">${quoteNumber}</strong></p>
              <p>I'll get back to you within <strong>4 hours</strong> during weekdays (8am–8pm Eastern, Montréal).</p>
              <hr style="border: 1px solid #2A2A28; margin: 32px 0;" />
              <p><strong>Project:</strong> ${PROJECT_TYPES[body.projectType as keyof typeof PROJECT_TYPES]?.label}</p>
              <p><strong>Timeline:</strong> ${TIMELINES[body.timeline as keyof typeof TIMELINES]?.label}</p>
              <p><strong>Add-ons:</strong> ${addonLabels}</p>
              <p><strong>Total:</strong> <span style="color:#D4A464;">$${totalUSD.toFixed(2)} USD</span></p>
              <hr style="border: 1px solid #2A2A28; margin: 32px 0;" />
              <p>Book a call: <a href="https://calendly.com/mehdijabry/discovery" style="color: #D4A464;">calendly.com/mehdijabry/discovery</a></p>
              <p style="color: #8A8A85; font-size: 12px; margin-top: 32px;">— Mohamed Mehdi Jabry<br>Independent Web Studio · Montréal, QC</p>
            </div>
          `,
        }),
        resend.emails.send({
          from: `Portfolio Site <${fromEmail}>`,
          to: toEmail,
          subject: `New quote ${quoteNumber} — ${body.name} (${body.email})`,
          html: `
            <div style="font-family: monospace; max-width: 600px; padding: 24px; background: #141414; color: #F5F5F0;">
              <h1 style="color: #D4A464;">New Quote Request: ${quoteNumber}</h1>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Company:</strong> ${body.company ?? "—"}</p>
              <p><strong>Project type:</strong> ${body.projectType}</p>
              <p><strong>Timeline:</strong> ${body.timeline}</p>
              <p><strong>Add-ons:</strong> ${addonLabels}</p>
              <p><strong>Total (USD):</strong> $${totalUSD.toFixed(2)}</p>
              <p><strong>Currency pref:</strong> ${body.preferredCurrency}</p>
              <p><strong>Brief:</strong> ${body.projectBrief}</p>
              <p><strong>Deadline:</strong> ${body.deadline ?? "—"}</p>
              <p><strong>Source:</strong> ${body.source ?? "—"}</p>
              <p><strong>Existing URL:</strong> ${body.existingUrl ?? "—"}</p>
            </div>
          `,
        }),
      ]);
    } else {
      req.log.warn("RESEND_API_KEY not set — emails skipped");
    }

    res.status(201).json({ quoteNumber, totalUSD });
  } catch (err) {
    req.log.error({ err }, "Failed to process quote");
    res.status(500).json({ error: "Failed to process quote request" });
  }
});

export default router;
