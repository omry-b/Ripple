# Neon Postgres on Vercel

1. Create a project at [neon.tech](https://neon.tech) and copy the pooled connection string.
2. In Vercel → **Ripple** → **Settings** → **Environment Variables**, add:
   - `DATABASE_URL` = `postgresql://...` (pooled)
3. Redeploy production.
4. Locally: `cp .env.example .env.local`, set `DATABASE_URL`, then:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Confirm **Data mode** banner shows Postgres instead of mock.

Ripple uses `getDataSource()` — when `DATABASE_URL` is set, Drizzle/Postgres is used automatically.
