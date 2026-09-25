import { pgTable, serial, text, numeric, jsonb, date, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";

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
  trackToken: text("track_token"),          // jeton du pixel d'ouverture et du lien suivi /go/<jeton>
  trackUrl: text("track_url"),              // destination réelle du lien suivi (la maquette)
  bodyHtml: text("body_html"),              // le courriel tel qu'envoyé (HTML), pour l'aperçu dans l'admin
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
export type SentEmailRow = typeof sentEmailsTable.$inferSelect;

/** Suivi des courriels de prospection et des visites des maquettes : ouverture (pixel), clic (lien /go), visite (balise
 *  sur chaque site démo). Aucune donnée nominative : l'adresse IP est hachée avec le secret du serveur. */
export const trackingEventsTable = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id"),
  site: text("site"),                       // hôte du site démo (ex. seaudecrabe-demo.pages.dev)
  kind: text("kind").notNull(),             // open · click · visit
  path: text("path"),
  referrer: text("referrer"),
  source: text("source"),                   // src=courriel, etc.
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  isBot: boolean("is_bot").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("tracking_events_email").on(t.emailId), index("tracking_events_site").on(t.site, t.createdAt)]);
export type TrackingEventRow = typeof trackingEventsTable.$inferSelect;

/** Prospects : commerces démarchés, ce qui a été construit pour eux (maquette, admin démo, réservations) et où en est la
 *  vente. Un prospect « gagné » devient un client (client_id). Les courriels se rattachent par adresse, les visites par
 *  l'hôte de la maquette. */
export const prospectsTable = pgTable("prospects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city"),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  googleMapsUrl: text("google_maps_url"),
  websiteUrl: text("website_url"),          // leur site actuel, s'il existe
  brokenDomain: text("broken_domain"),      // domaine mort sur la fiche Google
  ownDomain: text("own_domain"),            // domaine qu'ils possèdent déjà
  googleRating: text("google_rating"),
  googleReviews: integer("google_reviews"),
  mockUrl: text("mock_url"),                // la maquette
  adminUrl: text("admin_url"),              // l'espace admin de démonstration
  adminDemoPassword: text("admin_demo_password"),
  hasReservations: boolean("has_reservations").notNull().default(false),
  status: text("status").notNull().default("nouveau"),   // nouveau · maquette · contacté · relance · négociation · gagné · perdu
  price: numeric("price", { precision: 12, scale: 2 }),
  notes: text("notes"),
  nextAction: text("next_action"),
  nextActionAt: date("next_action_at"),
  clientId: integer("client_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type ProspectRow = typeof prospectsTable.$inferSelect;
