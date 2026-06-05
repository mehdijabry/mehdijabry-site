import { Router, type IRouter } from "express";
import { db, breathingTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

/**
 * POST /api/breathe — heartbeat ping.
 *
 * Inserts a row in `breathing` and returns the row + count of recent pings.
 * Called by the GitHub Actions cron in .github/workflows/breathing.yml every
 * 3 days to keep Supabase Free's auto-pause counter from reaching 7 days.
 *
 * Also reachable manually (curl, browser, /api/breathe) for verification.
 * No auth — this endpoint is harmless and idempotent (writes a single small
 * row of metadata, no PII).
 */
router.post("/breathe", async (req, res) => {
  const source =
    (typeof req.body?.source === "string" && req.body.source) ||
    (typeof req.headers["x-source"] === "string" && req.headers["x-source"]) ||
    "unknown";
  const meta =
    req.body?.meta && typeof req.body.meta === "object" ? req.body.meta : {};
  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : null;

  try {
    const [row] = await db
      .insert(breathingTable)
      .values({ source, userAgent, meta })
      .returning();

    // Return a tiny summary so the caller can confirm without a second query
    const recent = await db
      .select({ pingedAt: breathingTable.pingedAt, source: breathingTable.source })
      .from(breathingTable)
      .orderBy(desc(breathingTable.pingedAt))
      .limit(5);

    res.status(201).json({
      ok: true,
      ping: row,
      lastFive: recent,
    });
  } catch (err) {
    req.log.error({ err }, "Breathing ping failed");
    res.status(500).json({ ok: false, error: "Failed to insert breathing row" });
  }
});

/**
 * GET /api/breathe — read-only health-check view.
 *
 * Returns the 5 most recent pings + the time since the last ping. Useful for
 * eyeballing in a browser to confirm the keep-alive is running on schedule.
 */
router.get("/breathe", async (_req, res) => {
  try {
    const recent = await db
      .select()
      .from(breathingTable)
      .orderBy(desc(breathingTable.pingedAt))
      .limit(5);
    const last = recent[0];
    const minutesSinceLast = last
      ? Math.round(
          (Date.now() - new Date(last.pingedAt).getTime()) / 60000,
        )
      : null;
    res.json({
      ok: true,
      minutesSinceLast,
      recent,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Read failed" });
  }
});

export default router;
