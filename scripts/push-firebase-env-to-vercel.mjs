#!/usr/bin/env node
/**
 * Push Firebase env vars to Vercel Production.
 * Usage:
 *   node scripts/push-firebase-env-to-vercel.mjs /path/to/serviceAccount.json
 *   node scripts/push-firebase-env-to-vercel.mjs  # client vars only
 */
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

function parseEnvFile(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

function vercelEnvAdd(name, value, sensitive = false) {
  if (!value) {
    console.warn(`skip ${name} (empty)`);
    return;
  }
  const tmp = join(tmpdir(), `vercel-env-${name}.txt`);
  writeFileSync(tmp, value, "utf8");
  const args = ["env", "add", name, "production", "--force"];
  if (sensitive) args.push("--sensitive");
  const r = spawnSync("vercel", args, {
    cwd: ROOT,
    input: value,
    encoding: "utf8",
  });
  unlinkSync(tmp);
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`vercel env add ${name} failed`);
  }
  console.log(`✓ ${name}`);
}

const saPath = process.argv[2];
const envPath = "/tmp/ripple-firebase-env.txt";

if (!existsSync(envPath)) {
  console.error(`Missing ${envPath}. Run: npm run firebase:setup`);
  process.exit(1);
}

const client = parseEnvFile(envPath);

const clientKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

console.log("→ Pushing Firebase client vars to Vercel Production…");
for (const key of clientKeys) {
  vercelEnvAdd(key, client[key], key.includes("API_KEY"));
}

if (saPath) {
  const json = JSON.parse(readFileSync(resolve(saPath), "utf8"));
  console.log("→ Pushing Firebase Admin vars…");
  vercelEnvAdd("FIREBASE_ADMIN_PROJECT_ID", json.project_id, true);
  vercelEnvAdd("FIREBASE_ADMIN_CLIENT_EMAIL", json.client_email, true);
  vercelEnvAdd("FIREBASE_ADMIN_PRIVATE_KEY", json.private_key, true);
} else {
  console.log(
    "\nPass service account JSON to also push admin credentials:\n" +
      "  npm run firebase:push-env -- ./ripple-firebase-adminsdk.json\n"
  );
}

console.log("\n→ Redeploying production…");
execSync("vercel deploy --prod --yes", { cwd: ROOT, stdio: "inherit" });
console.log("\nDone. Test sign-in at /sign-in on production.");
