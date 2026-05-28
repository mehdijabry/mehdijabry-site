import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
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

// ───── Static SPA serving (production only) ─────
// In production (Render), the build process produces:
//   - artifacts/api-server/dist/index.mjs   (this file's compiled output)
//   - artifacts/portfolio/dist/             (the Vite static build)
// So from the compiled api-server, the portfolio dist is at: ../../portfolio/dist
const portfolioDistPath = path.resolve(__dirname, "../../portfolio/dist");
const portfolioIndexHtml = path.join(portfolioDistPath, "index.html");
const hasPortfolioBuild = existsSync(portfolioIndexHtml);

if (hasPortfolioBuild) {
  logger.info({ portfolioDistPath }, "Serving portfolio static build");
  app.use(express.static(portfolioDistPath, {
    index: false, // we handle index.html in the catch-all below
    maxAge: "1d",
  }));
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
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(portfolioIndexHtml);
  });
}

export default app;
