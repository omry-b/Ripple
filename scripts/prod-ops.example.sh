#!/usr/bin/env bash
# Copy to prod-ops.local.sh (gitignored) and fill in values. Never commit prod-ops.local.sh.
set -euo pipefail

export APP_URL="https://ripple-ruby.vercel.app"
export CRON_SECRET="your-cron-secret"
export DATABASE_URL="postgresql://user:pass@host:25060/defaultdb?sslmode=require"

echo "=== Health ==="
curl -sS "$APP_URL/api/health" | jq .

echo ""
echo "=== Snapshot refresh ==="
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "$APP_URL/api/cron/snapshot-refresh" | jq .

echo ""
echo "=== Ingest ==="
curl -sS -X POST -H "Authorization: Bearer $CRON_SECRET" \
  "$APP_URL/api/ingest/internal" | jq .

echo ""
echo "=== Ops status ==="
curl -sS "$APP_URL/api/ops/status" | jq '.snapshot.asOf, .database, .recentIngest[0:3]'

echo ""
echo "=== Dashboard ==="
curl -sS -o /dev/null -w "HTTP %{http_code}\n" "$APP_URL/api/dashboard"
