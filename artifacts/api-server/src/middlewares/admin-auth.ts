import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Admin session (2026-09-23) — single operator, password from the environment.
 *
 * ADMIN_PASSWORD  the password typed on /admin (required for the admin area to exist at all)
 * ADMIN_SECRET    optional HMAC key for the session cookie; derived from the password when absent
 *
 * The cookie carries `<expiry>.<hmac(expiry)>`: nothing to store server-side, and a password change
 * invalidates every session because the derived key changes.
 */
const COOKIE = "mj_admin";
const SESSION_DAYS = 7;

export function isAdminConfigured(): boolean {
  return Boolean(process.env["ADMIN_PASSWORD"]);
}

function key(): Buffer {
  const secret = process.env["ADMIN_SECRET"] ?? `mj-admin:${process.env["ADMIN_PASSWORD"] ?? ""}`;
  return createHmac("sha256", "mehdijabry.dev").update(secret).digest();
}

function sign(payload: string): string {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected || typeof candidate !== "string") return false;
  return safeEqual(candidate, expected);
}

export function issueAdminCookie(res: Response): void {
  const exp = String(Date.now() + SESSION_DAYS * 86_400_000);
  res.cookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_DAYS * 86_400_000,
    path: "/",
  });
}

export function clearAdminCookie(res: Response): void {
  res.clearCookie(COOKIE, { path: "/" });
}

export function hasValidSession(req: Request): boolean {
  const raw = (req.cookies as Record<string, string> | undefined)?.[COOKIE];
  if (!raw || !isAdminConfigured()) return false;
  const [exp, mac] = raw.split(".");
  if (!exp || !mac) return false;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(mac, sign(exp));
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminConfigured()) { res.status(503).json({ error: "Espace admin désactivé : ADMIN_PASSWORD n'est pas défini." }); return; }
  if (!hasValidSession(req)) { res.status(401).json({ error: "Non connecté." }); return; }
  next();
}
