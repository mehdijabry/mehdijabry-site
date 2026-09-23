import app from "./app";
import { logger } from "./lib/logger";
import { ensureAdminSchema } from "@workspace/db";

// Admin tables (invoicing, e-mails) are created on first boot — no manual migration step on Render.
try {
  await ensureAdminSchema();
  logger.info("Admin schema ready");
} catch (err) {
  logger.error({ err }, "Admin schema could not be created — the admin area will fail until the database is reachable");
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
