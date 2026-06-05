import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * `breathing` — the heartbeat log.
 *
 * Each row is one external ping made to keep the Supabase free-tier database
 * from auto-pausing (Supabase pauses Free projects after 7 days with no
 * external requests).
 *
 * A scheduled job (GitHub Actions cron, every 3 days) POSTs to
 * /api/breathe → the handler inserts one row here. You can verify the system
 * is alive at any time by checking the Supabase Table Editor → `breathing`
 * → see the timestamps.
 *
 * Safe to truncate manually if rows pile up — the only thing that matters is
 * a recent `pinged_at` to prove the keep-alive worked.
 */
export const breathingTable = pgTable("breathing", {
  id: serial("id").primaryKey(),
  pingedAt: timestamp("pinged_at", { withTimezone: true }).defaultNow().notNull(),
  source: text("source").notNull(),         // e.g. "github-actions-cron", "manual-curl"
  userAgent: text("user_agent"),            // optional, who pinged
  meta: jsonb("meta").default({}),          // free-form, e.g. workflow run id
});

export type BreathingRow = typeof breathingTable.$inferSelect;
