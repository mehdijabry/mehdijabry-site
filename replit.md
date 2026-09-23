# Mehdi Jabry — Independent Web Studio

A production-ready freelance web developer portfolio for Mehdi Jabry, based in Montréal, Québec. Features a multi-step interactive quote configurator with real-time pricing, full case studies, a 3-tier pricing page with currency switching, and a backend that stores quotes in Postgres and sends emails via Resend.

## Admin area — facturation & courriels (2026-09-23)

`/admin` (login by password) → tableau de bord, factures, clients, courriels, paramètres. Built for a Québec
*travailleur autonome* without a registered company:

- **Factures** : numéros `F2026-001`, dates, lignes, sous-total, TPS 5 % / TVQ 9,975 % (calculées sur le sous-total)
  **ou** mode « petit fournisseur » (aucune taxe + mention légale), statuts brouillon → envoyée → payée / annulée,
  adresse du client figée sur la facture, page imprimable `/f/<token>` (PDF via « Enregistrer en PDF »), envoi par
  courriel avec le lien, export CSV annuel (`/api/admin/invoices/export.csv?year=`). Mentions imprimées = la liste
  complète de Revenu Québec (« Préparation des factures »), quel que soit le montant. Une facture payée devient
  immuable ; seules brouillons/annulées se suppriment (conservation 6 ans).
- **Courriels** : envoi depuis `contact@mehdijabry.dev` via Resend (gabarits « proposition de maquette », relance),
  variables `{entreprise}` `{lien}`, historique en base.
- **Paramètres** : identité de l'émetteur (adresse 3051 rue du Père-Bressani app. 7, Trois-Rivières), NEQ/TPS/TVQ,
  mode taxes, modalités de paiement, préfixe, expéditeur.
- Code : `artifacts/api-server/src/routes/admin.ts` (API, `/api/admin/*`), `middlewares/admin-auth.ts` (cookie HMAC),
  `lib/invoice-html.ts` (règles fiscales + gabarit), `lib/db/src/schema/admin.ts` (tables créées au boot par
  `ensureAdminSchema()`), `artifacts/portfolio/src/pages/admin/*` + `lib/admin-api.ts` (front, hors OpenAPI : privé).
- Env : `ADMIN_PASSWORD` (obligatoire — sans lui l'espace admin est désactivé), `ADMIN_SECRET` (facultatif),
  `PUBLIC_BASE_URL` (défaut `https://mehdijabry.dev`, base des liens `/f/…`), `RESEND_API_KEY`.
- Dev local sans Postgres : sans `DATABASE_URL` et hors production, `lib/db` bascule sur PGlite (Postgres en
  processus, dossier `.pglite/`, git-ignoré). Jamais en production.
- Mac : `pnpm-workspace.yaml` autorise désormais les binaires `darwin-x64` d'esbuild, rollup, lightningcss et
  @tailwindcss/oxide (le reste des plateformes reste exclu) — sinon `vite build` échoue localement.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Optional env: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` — email sending via Resend

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, Wouter (routing), Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Email: Resend (`resend` package on api-server)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Fonts: EB Garamond (serif headings), Inter (sans body), JetBrains Mono (code/tech)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/quotes.ts` — DB schema for quote_requests and contact_form tables
- `artifacts/api-server/src/routes/quote.ts` — POST /api/quote (store + Resend emails)
- `artifacts/api-server/src/routes/contact.ts` — POST /api/contact
- `artifacts/portfolio/src/` — React Vite frontend
- `artifacts/portfolio/src/lib/pricing.ts` — pricing logic (PROJECT_TYPES, TIMELINES, ADDONS, CURRENCIES)
- `artifacts/portfolio/src/pages/` — all 7 pages (Home, Work, Pricing, Start, About, Thanks, Legal)

## Architecture decisions

- Dark mode is default (`.dark` class on `<html>`), toggled via localStorage
- Pricing is calculated both client-side (real-time display) and server-side (never trust client price)
- Quote numbers follow the format `M2026-001`, generated from the DB
- Resend emails gracefully degrade (logs a warning if `RESEND_API_KEY` is not set)
- The `@radix-ui/react-visually-hidden` package is NOT needed — `DialogTitle` uses `className="sr-only"` instead

## Product

- Home: Hero, trust bar, process steps, featured work, pricing teaser with currency switcher, about teaser, FAQ (8 items), final CTA
- /work: Case studies (DS AI Manager real content + 2 placeholders)
- /pricing: Full pricing cards, add-ons table, why fixed price, comparison matrix
- /start: 5-step interactive quote configurator with sticky price panel (real-time calculation)
- /about: Founder bio
- /thanks: Post-submission confirmation (reads ?quote= from URL)
- /legal: Legal mentions + privacy policy

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after changing `lib/db/src/schema/` before typechecking `@workspace/api-server`
- After any `openapi.yaml` change, run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Google Fonts `@import url(...)` must be the FIRST line in `index.css` (before `@import "tailwindcss"`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
