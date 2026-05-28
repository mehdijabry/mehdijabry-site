import { Router, type IRouter } from "express";
import { SubmitContactBody } from "@workspace/api-zod";
import { db, contactFormTable } from "@workspace/db";
import { Resend } from "resend";

const router: IRouter = Router();

router.post("/contact", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const body = parsed.data;

  try {
    await db.insert(contactFormTable).values({
      name: body.name,
      email: body.email,
      message: body.message,
      source: body.source ?? null,
    });

    const resendApiKey = process.env["RESEND_API_KEY"];
    const fromEmail = process.env["RESEND_FROM_EMAIL"] ?? "hi@mehdijabry.dev";
    const toEmail = process.env["RESEND_TO_EMAIL"] ?? "hi@mehdijabry.dev";

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: `Portfolio Site <${fromEmail}>`,
        to: toEmail,
        subject: `New contact message from ${body.name}`,
        html: `
          <div style="font-family: monospace; max-width: 600px; padding: 24px; background: #141414; color: #F5F5F0;">
            <h1 style="color: #D4A464;">New Contact Message</h1>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Source:</strong> ${body.source || "—"}</p>
            <p><strong>Message:</strong></p>
            <p style="padding: 16px; background: #0A0A0A; border-left: 2px solid #D4A464;">${body.message}</p>
          </div>
        `,
      });
    }

    res.status(201).json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to process contact submission");
    res.status(500).json({ error: "Failed to process contact request" });
  }
});

export default router;
