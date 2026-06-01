#!/usr/bin/env bash
# Firebase setup for Ripple (Google sign-in).
# Run from repo root after: firebase login  (use omry.bejerano@gmail.com)
set -euo pipefail

PROJECT_ID="${FIREBASE_PROJECT_ID:-ripple-risk-omry}"
DISPLAY_NAME="${FIREBASE_DISPLAY_NAME:-Ripple}"
APP_NAME="${FIREBASE_APP_NAME:-Ripple Web}"
VERCEL_HOST="${VERCEL_HOST:-ripple-omry-2596s-projects.vercel.app}"
SUPPORT_EMAIL="${FIREBASE_SUPPORT_EMAIL:-omry.bejerano@gmail.com}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v firebase >/dev/null 2>&1; then
  FIREBASE="npx --yes firebase-tools@latest"
else
  FIREBASE="firebase"
fi

echo "→ Checking Firebase login…"
if ! $FIREBASE login:list 2>&1 | grep -q "@"; then
  echo "Not logged in. Run: $FIREBASE login"
  echo "Sign in with omry.bejerano@gmail.com when the browser opens."
  exit 1
fi

echo "→ Active account:"
$FIREBASE login:list

echo "→ Creating project ${PROJECT_ID} (skip if it already exists)…"
if ! $FIREBASE projects:list --json 2>/dev/null | grep -q "\"projectId\": \"${PROJECT_ID}\""; then
  $FIREBASE projects:create "$PROJECT_ID" --display-name "$DISPLAY_NAME"
else
  echo "  Project ${PROJECT_ID} already exists."
fi

$FIREBASE use "$PROJECT_ID"

echo "→ Creating web app (skip if one already exists)…"
APPS_JSON=$($FIREBASE apps:list WEB --json 2>/dev/null || echo '{"result":[]}')
APP_ID=$(echo "$APPS_JSON" | node -e "
  const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
  const apps=d.result||[];
  const hit=apps.find(a=>a.displayName==='${APP_NAME}')||apps[0];
  process.stdout.write(hit?.appId||'');
")

if [ -z "$APP_ID" ]; then
  CREATE_OUT=$($FIREBASE apps:create WEB "$APP_NAME" --json)
  APP_ID=$(echo "$CREATE_OUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(d.result?.appId||'');")
fi

echo "  App ID: ${APP_ID}"

echo "→ Fetching web SDK config…"
$FIREBASE apps:sdkconfig WEB "$APP_ID" --json > /tmp/ripple-firebase-sdk.json
node -e "
const c=JSON.parse(require('fs').readFileSync('/tmp/ripple-firebase-sdk.json','utf8')).result.sdkConfig;
console.log('NEXT_PUBLIC_FIREBASE_API_KEY='+c.apiKey);
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN='+c.authDomain);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID='+c.projectId);
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET='+(c.storageBucket||''));
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID='+(c.messagingSenderId||''));
console.log('NEXT_PUBLIC_FIREBASE_APP_ID='+c.appId);
" | tee /tmp/ripple-firebase-env.txt

echo "→ Enabling Google sign-in (firebase deploy --only auth)…"
cat > firebase.json <<EOF
{
  "auth": {
    "providers": {
      "googleSignIn": {
        "oAuthBrandDisplayName": "Ripple",
        "supportEmail": "${SUPPORT_EMAIL}"
      }
    }
  }
}
EOF
$FIREBASE deploy --only auth --project "$PROJECT_ID"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "Manual step (one time): service account key"
echo "  1. Open: https://console.firebase.google.com/project/${PROJECT_ID}/settings/serviceaccounts/adminsdk"
echo "  2. Generate new private key → save as ripple-firebase-adminsdk.json"
echo "  3. Run: npm run firebase:push-env -- ripple-firebase-adminsdk.json"
echo ""
echo "Also add authorized domain in Firebase console → Authentication → Settings:"
echo "  • ${VERCEL_HOST}"
echo "  • localhost"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Client env vars saved to /tmp/ripple-firebase-env.txt"
