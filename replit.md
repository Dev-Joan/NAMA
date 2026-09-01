# NAMA Polyclinic

A warm, French-first landing page for NAMA Polyclinic in Jal El Dib, helping families discover multidisciplinary care and request an appointment.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nama-polyclinic/src/App.tsx` — one-page experience, navigation, specialties, FAQ, contact form, and clinic details
- `artifacts/nama-polyclinic/src/index.css` — NAMA visual system, responsive layout, animation, and accessibility states
- `.conversation/attached_assets/WhatsApp_Image_2026-09-01_at_12.16.19_1788299977736.jpeg` — supplied NAMA logo asset
- `artifacts/api-server` — shared API scaffold; the landing page is currently frontend-only

## Architecture decisions

- The site is a single scrolling page with hash anchors so patients can move from discovery to booking without route changes.
- The contact form validates locally and provides a clear confirmation state; direct phone and WhatsApp actions remain available for urgent or immediate booking.
- Practitioner portraits are intentional line-art placeholders until NAMA supplies approved team photography.

## Product

Visitors can learn about NAMA's four specialties, meet the care team, understand the first-visit process, read common answers, locate the clinic, and start an appointment request by form, phone, or WhatsApp.

## User preferences

The user requested a warm, trustworthy healthcare feel in French using the exact NAMA cream, olive, bronze, terracotta, dark neutral, and white palette.

## Gotchas

- Keep the supplied logo image path intact when moving assets; it is intentionally used as-is in the header and footer.
- The page uses the artifact workflow's injected `PORT` and `BASE_PATH`; do not run the Vite command without those workflow values.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
