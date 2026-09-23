import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

export type Database = NodePgDatabase<typeof schema>;

let _db: Database;
export let pool: pg.Pool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzlePg(pool, { schema });
} else if (process.env.NODE_ENV !== "production") {
  // Local development without a Postgres server (2026-09-23): PGlite is Postgres compiled to WASM, running
  // in-process. Data lives in ./.pglite (git-ignored) so it survives restarts. Never used in production —
  // there DATABASE_URL must be set, as before.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  const dir = process.env.PGLITE_DIR ?? ".pglite";
  const client = new PGlite(dir);
  _db = drizzlePglite(client, { schema }) as unknown as Database;
  console.warn(`[db] DATABASE_URL is not set — using the in-process PGlite database at ${dir} (development only)`);
} else {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const db: Database = _db;

/**
 * Creates the admin-area tables when they do not exist yet (invoicing + outbound e-mails).
 * Idempotent; called at server boot. Mirrors lib/db/src/schema/admin.ts — keep both in sync.
 */
export async function ensureAdminSchema(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id serial PRIMARY KEY,
      key text UNIQUE NOT NULL,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS clients (
      id serial PRIMARY KEY,
      name text NOT NULL,
      contact_name text,
      email text,
      phone text,
      address_line1 text,
      address_line2 text,
      city text,
      province text,
      postal_code text,
      country text,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id serial PRIMARY KEY,
      number text UNIQUE NOT NULL,
      client_id integer,
      client_snapshot jsonb NOT NULL,
      issue_date date NOT NULL,
      due_date date NOT NULL,
      status text NOT NULL DEFAULT 'brouillon',
      currency text NOT NULL DEFAULT 'CAD',
      items jsonb NOT NULL,
      subtotal numeric(12,2) NOT NULL,
      gst numeric(12,2) NOT NULL DEFAULT 0,
      qst numeric(12,2) NOT NULL DEFAULT 0,
      total numeric(12,2) NOT NULL,
      tax_mode text NOT NULL DEFAULT 'none',
      payment_terms text,
      notes text,
      public_token text UNIQUE NOT NULL,
      sent_at timestamptz,
      paid_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sent_emails (
      id serial PRIMARY KEY,
      to_email text NOT NULL,
      to_name text,
      from_email text NOT NULL,
      subject text NOT NULL,
      body_text text NOT NULL,
      invoice_id integer,
      resend_id text,
      status text NOT NULL DEFAULT 'envoyé',
      error text,
      is_test boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
}

export * from "./schema";
