# Contributing

1. `npm install`
2. `npm run dev` — http://localhost:3000
3. `npm run test` — Vitest unit tests
4. `npm run build` — production check
5. `npm run test:e2e` — Playwright (includes axe a11y checks)
6. `npm run db:verify` — Postgres ping + seed (requires `DATABASE_URL`)
7. `npm run lighthouse` — performance/a11y scores (app must be running)
8. `npm run worker:scenario` — poll scenario cron locally

Optional: `cp .env.example .env.local`, `npm run db:push`, `npm run db:seed`.

Open a PR against `main`; Vercel creates a preview deploy automatically.
