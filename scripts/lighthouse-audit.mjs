#!/usr/bin/env node
/**
 * Lighthouse audit against a running Ripple instance.
 * Usage: npm run start & sleep 3 && npm run lighthouse
 */
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const BASE = process.env.LH_BASE_URL ?? "http://127.0.0.1:3000";
const PATHS = ["/", "/signals", "/companies", "/scenario"];
const THRESHOLDS = {
  performance: 0.75,
  accessibility: 0.9,
  "best-practices": 0.85,
};

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
let failed = false;

for (const path of PATHS) {
  const url = `${BASE}${path}`;
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices"],
  });

  const scores = result?.lhr?.categories ?? {};
  console.log(`\n${path}`);
  for (const [cat, min] of Object.entries(THRESHOLDS)) {
    const score = scores[cat]?.score ?? 0;
    const ok = score >= min;
    if (!ok) failed = true;
    console.log(`  ${cat}: ${(score * 100).toFixed(0)} (min ${min * 100}) ${ok ? "✓" : "✗"}`);
  }
}

await chrome.kill();
if (failed) {
  console.error("\nLighthouse thresholds not met.");
  process.exit(1);
}
console.log("\nAll Lighthouse thresholds passed.");
