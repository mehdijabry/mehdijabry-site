import { pgTable, serial, text, numeric, jsonb, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  projectType: text("project_type").notNull(),
  timeline: text("timeline").notNull(),
  addons: jsonb("addons").default([]),
  basePriceUsd: numeric("base_price_usd", { precision: 10, scale: 2 }).notNull(),
  totalUsd: numeric("total_usd", { precision: 10, scale: 2 }).notNull(),
  preferredCurrency: text("preferred_currency").default("CAD"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  existingUrl: text("existing_url"),
  projectBrief: text("project_brief"),
  deadline: date("deadline"),
  source: text("source"),
  status: text("status").default("new"),
  notes: text("notes"),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, createdAt: true });
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;

export const contactFormTable = pgTable("contact_form", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  source: text("source"),
});

export const insertContactFormSchema = createInsertSchema(contactFormTable).omit({ id: true, createdAt: true });
export type InsertContactForm = z.infer<typeof insertContactFormSchema>;
export type ContactForm = typeof contactFormTable.$inferSelect;
