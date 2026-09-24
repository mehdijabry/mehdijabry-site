import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { publicInvoiceHandler } from "./routes/admin";
import { trackOpenHandler, trackClickHandler, trackVisitHandler } from "./lib/tracking";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// ───── Middlewares ─────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ───── Public invoice page (2026-09-23) ─────
// The link e-mailed to a client: printable HTML, secured by its random token. Registered before the
// SPA catch-all so it is served by the API even in production.
app.get("/f/:token", publicInvoiceHandler);
// Suivi des courriels et des maquettes (public, sans session) — voir lib/tracking.ts
app.get("/o/:token.gif", trackOpenHandler);
app.get("/go/:token", trackClickHandler);
app.get("/api/track/visit.gif", trackVisitHandler);

// ───── Static SPA serving (production only) ─────
// In production (Render), the build process produces:
//   - artifacts/api-server/dist/index.mjs   (this file's compiled output)
//   - artifacts/portfolio/dist/             (the Vite static build)
// So from the compiled api-server, the portfolio dist is at: ../../portfolio/dist
const portfolioDistPath = path.resolve(
  __dirname,
  "../../portfolio/dist/public",
);
const portfolioIndexHtml = path.join(portfolioDistPath, "index.html");
const hasPortfolioBuild = existsSync(portfolioIndexHtml);

if (hasPortfolioBuild) {
  logger.info({ portfolioDistPath }, "Serving portfolio static build");
  app.use(
    express.static(portfolioDistPath, {
      index: false, // we handle index.html in the catch-all below
      maxAge: "1d",
    }),
  );
} else {
  logger.warn(
    { portfolioDistPath },
    "Portfolio build not found — static serving disabled. " +
      "Run `pnpm --filter @workspace/portfolio build` before starting in production.",
  );
}

// ───── API routes ─────
app.use("/api", router);

// ───── SPA catch-all (production only) ─────
// Any non-/api route that wasn't matched by static files falls back to
// index.html so client-side routing (wouter) works correctly.
if (hasPortfolioBuild) {
  app.get(/.*/, (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(portfolioIndexHtml);
  });
}

// ───── Errors ─────
// Express 5 forwards rejected async handlers here. API callers get JSON with a readable message (the admin
// UI displays it); the underlying driver error — Drizzle wraps it as "Failed query" — is logged so the
// Render logs say what actually broke instead of just "500".
const DB_DOWN = /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|EHOSTUNREACH|Tenant or user not found|cannot_connect_now|Connection terminated|timeout exceeded/i;
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const e = (err instanceof Error ? err : new Error(String(err))) as Error & { status?: number; statusCode?: number; cause?: unknown };
  const cause = e.cause instanceof Error ? e.cause : undefined;
  const code = (cause as { code?: string } | undefined)?.code ?? (e as { code?: string }).code;
  logger.error({ err: e, cause: cause ? { name: cause.name, message: cause.message, code } : undefined, url: req.url }, "unhandled error");
  if (res.headersSent) return;
  const status = e.status ?? e.statusCode ?? 500;
  const detail = cause?.message ?? e.message;
  const dbError = /^Failed query/.test(e.message) || Boolean(cause);
  let message = status < 500 ? e.message : "Erreur interne du serveur";
  if (dbError) {
    message = `Base de données injoignable (${detail}).`;
    if (DB_DOWN.test(`${detail} ${code ?? ""}`)) {
      message += " Le projet Supabase (plan gratuit) est probablement en pause : rétablissez-le depuis le tableau de bord Supabase, puis rechargez cette page.";
    }
  }
  if (req.path.startsWith("/api") || req.accepts(["html", "json"]) === "json") res.status(status).json({ error: message });
  else res.status(status).type("text/plain").send(message);
});

export default app;
