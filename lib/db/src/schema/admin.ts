import { pgTable, serial, text, numeric, jsonb, date, timestamp, integer, boolean } from "drizzle-orm/pg-core";

/**
 * Admin area (2026-09-23): invoicing for a Québec self-employed developer (travailleur autonome) and
 * outbound e-mails sent from the studio address.
 *
 * Tables are created at boot by `ensureAdminSchema()` (lib/db/src/index.ts) with CREATE TABLE IF NOT EXISTS,
 * so a fresh deploy needs no manual migration. Keep the DDL there in sync with these definitions.
 */

/** Key/value store for admin settings — one row per key, JSON value (key "issuer" = who issues the invoices). */
export const adminSettingsTable = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type AdminSettingRow = typeof adminSettingsTable.$inferSelect;

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
export type ClientRow = typeof clientsTable.$inferSelect;

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").unique().notNull(),            // F2026-001
  clientId: integer("client_id"),
  clientSnapshot: jsonb("client_snapshot").notNull(),  // name + address as printed — frozen at issue time
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").notNull().default("brouillon"), // brouillon · envoyée · payée · annulée
  currency: text("currency").notNull().default("CAD"),
  items: jsonb("items").notNull(),                     // [{ description, quantity, unitPrice }]
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  gst: numeric("gst", { precision: 12, scale: 2 }).notNull().default("0"),
  qst: numeric("qst", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  taxMode: text("tax_mode").notNull().default("none"), // none (petit fournisseur) · registrant (TPS + TVQ)
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  publicToken: text("public_token").unique().notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type InvoiceRow = typeof invoicesTable.$inferSelect;

export const sentEmailsTable = pgTable("sent_emails", {
  id: serial("id").primaryKey(),
  toEmail: text("to_email").notNull(),
  toName: text("to_name"),
  fromEmail: text("from_email").notNull(),
  subject: text("subject").notNull(),
  bodyText: text("body_text").notNull(),
  invoiceId: integer("invoice_id"),
  resendId: text("resend_id"),
  status: text("status").notNull().default("envoyé"),   // envoyé · échec
  error: text("error"),
  isTest: boolean("is_test").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
export type SentEmailRow = typeof sentEmailsTable.$inferSelect;
