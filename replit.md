# Mehdi Jabry — Independent Web Studio

A production-ready freelance web developer portfolio for Mehdi Jabry, based in Montréal, Québec. Features a multi-step interactive quote configurator with real-time pricing, full case studies, a 3-tier pricing page with currency switching, and a backend that stores quotes in Postgres and sends emails via Resend.

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
