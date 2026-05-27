# DigitalOcean Postgres (replaces Neon)

1. **Create** — DO Control Panel → Databases → PostgreSQL 16+.
2. **Connection** — Use the pooled/public URI with `sslmode=require`.
3. **Vercel** — Set `DATABASE_URL` on Production (+ Preview).
4. **Migrate** — From your machine:

```bash
export DATABASE_URL="postgresql://doadmin:PASSWORD@HOST:25060/ripple?sslmode=require"
npm run db:push
npm run db:seed
npm run db:verify
```

5. **Firewall** — Add Vercel outbound IPs or temporarily allow all for demo ([Vercel regions](https://vercel.com/docs/security/deployment-protection#ip-addresses)).

For VPC-only access, run ingest/scenario workers on DO App Platform in the same VPC as the database.
