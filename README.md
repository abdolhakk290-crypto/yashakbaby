# YASHAK BABY — Next.js + Supabase (Phase 3: storefront + admin dashboard)

Local development only. Nothing is deployed, no accounts are created, no money is spent.

```
supabase/migrations/   PostgreSQL schema, functions, RLS, storage rules, validation, storefront API (0007), admin API (0008)
supabase/seed.sql      settings + 3 empty categories (no products, no invented data)
supabase/make-owner.sql  create the first owner (no default login exists)
app/[lang]/            public website (6 languages, RTL, dark mode)
app/admin/             admin dashboard (login, products, photos, categories, homepage, settings/WhatsApp, orders)
app/api/               /api/cart, /api/orders (public, rate limited) and /api/admin/upload (admins only)
lib/                   i18n, database access, admin helpers and admin texts (lib/admin-i18n.ts), Supabase clients
components/            shared UI pieces (AdminBits, AdminFlash, ProductForm …)
proxy.ts               language redirect, per-request script nonce (CSP), admin session gate
tests/                 db (98), web/http (32), browser (16), admin browser (41), traceability of the 146 legacy tests
docs/                  ADMIN-GUIDE, SUPABASE-SETUP, PHASE3-REPORT, SECURITY-MODEL, GO-LIVE-CHECKLIST, TEST-TRACEABILITY, older reports
db/support/            test-only stand-in for Supabase's auth/storage schemas (never run on a real project)
```

## Run the site locally against a real Supabase project (your own, free plan)
1. Follow `docs/SUPABASE-SETUP.md` (about 20 minutes, no purchase needed).
2. `cp .env.example .env.local` and fill the three Supabase values.
3. `npm install && npm run build && npm start` → http://localhost:3000 and http://localhost:3000/admin

## Run the tests (needs PostgreSQL 16 and the PostgREST binary locally)
The tests start a throw-away PostgreSQL, the **real PostgREST** server, a small Supabase-style gateway and the production build of the site. The gateway **emulates** Supabase sign-in (`/auth/v1`) and file storage (`/storage/v1`) — see "What is not tested" in `docs/PHASE3-REPORT.md`.
```
sh tests/start-pg.sh                 # throw-away local PostgreSQL (port 54329)
# PostgREST 12.2.3 binary expected at ../tools/postgrest/postgrest (https://github.com/PostgREST/postgrest/releases)
sh tests/build-for-tests.sh          # production build with the local test address baked in
npm test                             # db 98 + web 32 + browser 16 + admin 39 + 146-test traceability
```
Browser tests need Playwright with Chromium (`PW_PATH=/path/to/node_modules/playwright`).
