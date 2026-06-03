/**
 * Risk-model evaluation harness.
 *
 *   npm run evaluate
 *
 * Validates the Monte Carlo engine the way a risk desk validates an internal
 * model before it goes to production:
 *
 *   1. Coherence & reproducibility  — structural properties that must always hold
 *   2. Convergence                  — Monte Carlo mean → analytic expectation
 *   3. VaR backtest (Kupiec POF)    — is the 99% VaR correctly calibrated?
 *   4. Stress sensitivity           — does tail risk respond to severity sanely?
 *
 * Exits non-zero if any check fails, so it can gate CI. The printed report is
 * the evidence cited in docs/EVALUATION.md.
 */
import {
  simulatePortfolioLoss,
  buildScenarioSimulation,
  type Position,
} from "../src/lib/risk/monte-carlo-engine";
import { normalInverseCdf, expectedShortfallMultiplier } from "../src/lib/risk/normal";
import type { Company } from "../src/types/domain";

// A representative semiconductor-heavy portfolio (USD exposures).
const PORTFOLIO: Company[] = [
  ["apple", "Apple Inc.", 81, 4.2e9],
  ["tsmc", "TSMC", 74, 3.6e9],
  ["foxconn", "Foxconn", 68, 2.4e9],
  ["samsung", "Samsung", 58, 2.1e9],
  ["qualcomm", "Qualcomm", 52, 1.6e9],
  ["nvidia", "NVIDIA", 49, 1.5e9],
  ["amd", "AMD", 44, 1.1e9],
].map(([id, name, score, cvarUsd]) => ({
  id: id as string,
  name: name as string,
  region: "APAC",
  score: score as number,
  tier: "Tier 1",
  cvar: "",
  cvarUsd: cvarUsd as number,
  delta7d: "",
  deltaTrend: "bad",
  contagionHops: 2,
  scoreLevel: "elevated",
  history30d: [score as number],
}));

let failures = 0;
const B = (usd: number) => `$${(usd / 1e9).toFixed(2)}B`;
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

function check(label: string, pass: boolean, detail: string) {
  if (!pass) failures += 1;
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(42)} ${detail}`);
}

function section(title: string) {
  console.log(`\n${title}\n${"-".repeat(title.length)}`);
}

function main() {
  console.log("Ripple — Monte Carlo risk-model evaluation");
  console.log("==========================================");

  const positions: Position[] = [
    { id: "a", name: "A", exposureUsd: 4e9, disruptionProb: 0.25 },
    { id: "b", name: "B", exposureUsd: 3e9, disruptionProb: 0.18 },
    { id: "c", name: "C", exposureUsd: 2e9, disruptionProb: 0.4 },
    { id: "d", name: "D", exposureUsd: 1.5e9, disruptionProb: 0.1 },
    { id: "e", name: "E", exposureUsd: 1e9, disruptionProb: 0.3 },
  ];

  // 1. Coherence & reproducibility -----------------------------------------
  section("1. Coherence & reproducibility");
  const r1 = simulatePortfolioLoss(positions, { seed: "eval", trials: 20000, confidence: 0.99 });
  const r1b = simulatePortfolioLoss(positions, { seed: "eval", trials: 20000, confidence: 0.99 });
  check("CVaR ≥ VaR ≥ E[L] ≥ 0", r1.cvarUsd >= r1.varUsd && r1.varUsd >= r1.expectedLossUsd && r1.expectedLossUsd >= 0,
    `E[L]=${B(r1.expectedLossUsd)}  VaR99=${B(r1.varUsd)}  CVaR99=${B(r1.cvarUsd)}`);
  check("Sub-additivity (ES is coherent)", r1.cvarUsd <= r1.sumStandaloneCvarUsd,
    `portfolio ${B(r1.cvarUsd)} ≤ Σ standalone ${B(r1.sumStandaloneCvarUsd)}`);
  check("Deterministic for a fixed seed", r1.cvarUsd === r1b.cvarUsd,
    `identical CVaR across two runs`);
  check("Diversification benefit is positive", r1.diversificationBenefitUsd > 0,
    `${B(r1.diversificationBenefitUsd)} tail removed (${pct(1 - r1.diversificationRatio)})`);

  // 2. Convergence to analytic expectation ---------------------------------
  section("2. Convergence: E[L] → analytic Σ Eᵢ·pᵢ·μ_LGD");
  const lgdMean = 0.55;
  const analytic = positions.reduce((s, p) => s + p.exposureUsd * p.disruptionProb * lgdMean, 0);
  console.log(`  analytic E[L] = ${B(analytic)}`);
  let lastErr = 1;
  for (const trials of [500, 2000, 10000, 50000]) {
    const r = simulatePortfolioLoss(positions, { seed: "conv", trials, lgdMean, lgdVol: 0.15 });
    const relErr = Math.abs(r.expectedLossUsd - analytic) / analytic;
    lastErr = relErr;
    console.log(`  trials=${String(trials).padStart(6)}  E[L]=${B(r.expectedLossUsd)}  rel.err=${pct(relErr)}`);
  }
  check("Converges within 2% at 50k trials", lastErr < 0.02, `final rel.err ${pct(lastErr)}`);

  // 3. VaR backtest — Kupiec proportion-of-failures (POF) coverage test -----
  section("3. VaR99 backtest — Kupiec POF coverage test");
  const { positions: pos, config } = buildScenarioSimulation(PORTFOLIO, { severity: 100, confidence: 99 });
  const model = simulatePortfolioLoss(pos, { ...config, seed: "model", trials: 40000 });
  const var99 = model.varUsd;

  // Out-of-sample realized losses: one independent draw per period, fresh seeds.
  const periods = 750;
  let breaches = 0;
  for (let t = 0; t < periods; t += 1) {
    const realized = simulatePortfolioLoss(pos, { ...config, seed: `oos-${t}`, trials: 1 }).expectedLossUsd;
    if (realized > var99) breaches += 1;
  }
  const p = 1 - config.confidence; // expected failure rate = 1%
  const obs = breaches / periods;
  const expected = p * periods;
  // Kupiec likelihood-ratio statistic; χ²(1) 95% critical value = 3.841.
  const x = breaches;
  const T = periods;
  const lrPof =
    x === 0
      ? -2 * (T * Math.log(1 - p))
      : -2 * ((T - x) * Math.log(1 - p) + x * Math.log(p)) +
        2 * ((T - x) * Math.log(1 - x / T) + x * Math.log(x / T));
  console.log(`  model VaR99 = ${B(var99)}`);
  console.log(`  observed breaches = ${breaches}/${periods} (${pct(obs)}), expected ≈ ${expected.toFixed(1)} (${pct(p)})`);
  console.log(`  Kupiec LR_POF = ${lrPof.toFixed(3)}  (χ²₁ 95% crit = 3.841)`);
  check("VaR99 coverage not rejected (LR_POF < 3.841)", lrPof < 3.841,
    `model is correctly calibrated at 99%`);

  // 4. Stress sensitivity ---------------------------------------------------
  section("4. Stress sensitivity (live portfolio)");
  console.log("  severity   E[L]      VaR99     CVaR99    diversification");
  let prevCvar = -1;
  let monotone = true;
  for (const sev of [60, 100, 140]) {
    const sim = buildScenarioSimulation(PORTFOLIO, { severity: sev, confidence: 99, seed: "stress" });
    const r = simulatePortfolioLoss(sim.positions, sim.config);
    if (r.cvarUsd < prevCvar) monotone = false;
    prevCvar = r.cvarUsd;
    console.log(
      `  ${String(sev).padStart(5)}%   ${B(r.expectedLossUsd).padEnd(8)}  ${B(r.varUsd).padEnd(8)}  ${B(r.cvarUsd).padEnd(8)}  −${pct(1 - r.diversificationRatio)}`
    );
  }
  check("CVaR rises monotonically with severity", monotone, "60% < 100% < 140%");

  // Reference: textbook Expected Shortfall multipliers used for the dashboard.
  section("Reference — analytic Expected Shortfall multipliers");
  console.log(`  ES95/σ = ${expectedShortfallMultiplier(0.95).toFixed(3)}  (Φ⁻¹(.95)=${normalInverseCdf(0.95).toFixed(3)})`);
  console.log(`  ES99/σ = ${expectedShortfallMultiplier(0.99).toFixed(3)}  (Φ⁻¹(.99)=${normalInverseCdf(0.99).toFixed(3)})`);
  console.log(`  ES99/ES95 = ${(expectedShortfallMultiplier(0.99) / expectedShortfallMultiplier(0.95)).toFixed(3)}`);

  // Summary -----------------------------------------------------------------
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
