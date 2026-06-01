#!/usr/bin/env node
/**
 * Finish Firebase setup: service account key, authorized domains, Vercel env push.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { execSync, spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const PROJECT_ID = "ripple-risk-omry";
const VERCEL_HOST = "ripple-omry-2596s-projects.vercel.app";
const ENV_PATH = "/tmp/ripple-firebase-env.txt";
const SA_PATH = join(ROOT, "ripple-firebase-adminsdk.json");

function firebaseAccessToken() {
  const cfg = JSON.parse(
    readFileSync(join(homedir(), ".config/configstore/firebase-tools.json"), "utf8")
  );
  const token = cfg.tokens?.access_token;
  if (!token) throw new Error("Run firebase login first.");
  return token;
}

async function api(path, { method = "GET", body, headers = {} } = {}) {
  const token = firebaseAccessToken();
  const res = await fetch(`https://${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return json;
}

async function ensureServiceAccountKey() {
  if (existsSync(SA_PATH)) {
    console.log("→ Service account key already exists locally.");
    return SA_PATH;
  }

  console.log("→ Listing Firebase Admin service accounts…");
  const listed = await api(
    `iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts`
  );
  const adminSa = listed.accounts?.find((a) =>
    a.email?.includes("firebase-adminsdk")
  );
  if (!adminSa?.email) {
    throw new Error("No firebase-adminsdk service account found. Wait a minute and retry.");
  }

  console.log(`→ Creating key for ${adminSa.email}…`);
  const key = await api(
    `iam.googleapis.com/v1/${adminSa.name}/keys`,
    {
      method: "POST",
      body: { keyAlgorithm: "KEY_ALG_RSA_2048", privateKeyType: "TYPE_GOOGLE_CREDENTIALS_FILE" },
    }
  );

  const decoded = Buffer.from(key.privateKeyData, "base64").toString("utf8");
  writeFileSync(SA_PATH, decoded, { mode: 0o600 });
  console.log(`✓ Saved ${SA_PATH}`);
  return SA_PATH;
}

async function ensureAuthorizedDomains() {
  console.log("→ Updating authorized domains…");
  const config = await api(
    `identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config`
  );
  const current = config.authorizedDomains ?? [];
  const needed = [
    "localhost",
    VERCEL_HOST,
    `${PROJECT_ID}.firebaseapp.com`,
    `${PROJECT_ID}.web.app`,
  ];
  const merged = [...new Set([...current, ...needed])];
  if (merged.length === current.length && needed.every((d) => current.includes(d))) {
    console.log("✓ Authorized domains already set.");
    return;
  }
  await api(
    `identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=authorizedDomains`,
    { method: "PATCH", body: { authorizedDomains: merged } }
  );
  console.log(`✓ Authorized domains: ${merged.join(", ")}`);
}

function vercelEnvAdd(name, value, sensitive = false) {
  const args = ["env", "add", name, "production", "--force"];
  if (sensitive) args.push("--sensitive");
  const r = spawnSync("vercel", args, {
    cwd: ROOT,
    input: value,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(`vercel env add ${name} failed: ${r.stderr || r.stdout}`);
  }
  console.log(`✓ Vercel env: ${name}`);
}

function pushToVercel(saPath) {
  if (!existsSync(ENV_PATH)) {
    throw new Error(`Missing ${ENV_PATH}. Run npm run firebase:setup first.`);
  }
  const client = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) client[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }

  const keys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  console.log("→ Pushing client env vars to Vercel Production…");
  for (const key of keys) {
    vercelEnvAdd(key, client[key], key.includes("API_KEY"));
  }

  const json = JSON.parse(readFileSync(saPath, "utf8"));
  console.log("→ Pushing Firebase Admin env vars…");
  vercelEnvAdd("FIREBASE_ADMIN_PROJECT_ID", json.project_id, true);
  vercelEnvAdd("FIREBASE_ADMIN_CLIENT_EMAIL", json.client_email, true);
  vercelEnvAdd("FIREBASE_ADMIN_PRIVATE_KEY", json.private_key, true);
}

async function main() {
  const saPath = await ensureServiceAccountKey();
  await ensureAuthorizedDomains();
  pushToVercel(saPath);

  console.log("\n→ Redeploying production…");
  execSync("vercel deploy --prod --yes", { cwd: ROOT, stdio: "inherit" });

  console.log("\n→ Checking /api/health auth mode…");
  const health = await fetch("https://ripple-omry-2596s-projects.vercel.app/api/health");
  const body = await health.json();
  console.log(JSON.stringify(body, null, 2));
  console.log("\nDone. Sign in at https://ripple-omry-2596s-projects.vercel.app/sign-in");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
