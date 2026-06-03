/**
 * Monte Carlo portfolio-loss engine.
 *
 * Model: a one-factor Gaussian threshold model — the same structure used in
 * Basel IRB / CreditMetrics and Vasicek's single-factor framework. Each entity
 * i has a disruption probability pᵢ and a dollar exposure Eᵢ. A single systemic
 * factor M (shared across the whole portfolio) drives correlation, so tail
 * events cluster the way real supply-chain shocks do:
 *
 *     Xᵢ = √ρ · M + √(1−ρ) · Zᵢ ,   M, Zᵢ ~ N(0,1) i.i.d.
 *     entity i is disrupted  ⟺  Xᵢ < Φ⁻¹(pᵢ)
 *     loss if disrupted       =  Eᵢ · LGDᵢ ,  LGDᵢ ~ truncated Normal(μ, σ)
 *     portfolio loss L        =  Σ lossᵢ
 *
 * Over N trials we obtain the loss distribution and read off:
 *   - Expected Loss  = mean(L)
 *   - VaRα           = α-quantile of L
 *   - CVaRα (ES)     = mean(L | L ≥ VaRα)   ← coherent, sub-additive tail risk
 *
 * Because of the shared factor M, CVaR > VaR > E[L], and the portfolio CVaR is
 * strictly below the sum of standalone CVaRs (diversification) — both genuine,
 * checkable properties (see the engine test-suite).
 */

import { makeRng } from "@/lib/risk/random";
import { normalInverseCdf, normalPdf } from "@/lib/risk/normal";
import type { Company } from "@/types/domain";

export type Position = {
  id: string;
  name: string;
  /** Dollar exposure at risk if this entity is disrupted. */
  exposureUsd: number;
  /** Probability of disruption over the scenario horizon, in (0, 1). */
  disruptionProb: number;
};

export type SimConfig = {
  /** Number of Monte Carlo trials. 10k gives a stable tail at this portfolio size. */
  trials: number;
  /** Systemic correlation ρ ∈ [0, 1). Higher → more clustered (contagious) losses. */
  correlation: number;
  /** Loss-given-disruption mean (fraction of exposure lost). */
  lgdMean: number;
  /** Loss-given-disruption volatility. */
  lgdVol: number;
  /** Tail confidence level for VaR / CVaR, e.g. 0.95 or 0.99. */
  confidence: number;
  /** Seed for reproducibility. */
  seed: string | number;
};

export type PortfolioLossResult = {
  trials: number;
  confidence: number;
  /** Mean simulated portfolio loss (USD). */
  expectedLossUsd: number;
  /** Value at Risk at the configured confidence (USD). */
  varUsd: number;
  /** Conditional VaR / Expected Shortfall — mean loss in the worst (1−α) tail (USD). */
  cvarUsd: number;
  /** Standard deviation of simulated loss (USD). */
  stdevUsd: number;
  p50Usd: number;
  p95Usd: number;
  p99Usd: number;
  maxUsd: number;
  /** Σ of each entity's standalone CVaR — the no-diversification reference (USD). */
  sumStandaloneCvarUsd: number;
  /** portfolioCVaR / Σ standaloneCVaR ∈ (0, 1]. Lower ⇒ more diversification. */
  diversificationRatio: number;
  /** Dollars of tail risk removed by diversification (USD). */
  diversificationBenefitUsd: number;
  /** 12-bin loss histogram (counts), ready for the distribution chart. */
  histogram: number[];
  /** Upper edge of the histogram range (USD). */
  histogramMaxUsd: number;
};

export const DEFAULT_SIM_CONFIG: SimConfig = {
  trials: 10_000,
  correlation: 0.25,
  lgdMean: 0.55,
  lgdVol: 0.15,
  confidence: 0.95,
  seed: "ripple",
};

const HIST_BINS = 12;

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/**
 * Closed-form standalone CVaR (Expected Shortfall) for a single position whose
 * loss is Eᵢ·LGD with probability pᵢ (else 0), LGD ~ N(μ, σ).
 *
 *   - If pᵢ ≤ (1−α): the (1−α) tail also includes the no-loss mass, so
 *     CVaRα = (Eᵢ·μ·pᵢ)/(1−α).
 *   - If pᵢ >  (1−α): the whole tail sits inside the "disrupted" outcome and is
 *     governed by the *upper tail of LGD* at conditional level β = (1−α)/pᵢ, so
 *     CVaRα = Eᵢ · E[LGD | LGD ≥ qβ] = Eᵢ · (μ + σ·φ(z)/β),  z = Φ⁻¹(1−β).
 *
 * Using the LGD tail mean (not just μ) is what keeps the measure coherent — the
 * earlier μ-only form understated standalone risk and broke sub-additivity at
 * the 99% level (caught by `npm run evaluate`).
 */
function standaloneCvar(
  pos: Position,
  lgdMean: number,
  lgdVol: number,
  confidence: number
): number {
  const tail = 1 - confidence;
  const p = pos.disruptionProb;
  if (p <= tail) {
    return (pos.exposureUsd * lgdMean * p) / tail;
  }
  const beta = tail / p;
  const z = normalInverseCdf(1 - beta);
  const condTailMeanLgd = lgdMean + lgdVol * (normalPdf(z) / beta);
  return pos.exposureUsd * Math.min(1, condTailMeanLgd);
}

/**
 * Run the portfolio loss simulation. Pure and deterministic given `config.seed`.
 */
export function simulatePortfolioLoss(
  positions: Position[],
  config: Partial<SimConfig> = {}
): PortfolioLossResult {
  const cfg: SimConfig = { ...DEFAULT_SIM_CONFIG, ...config };
  const { trials, correlation, lgdMean, lgdVol, confidence } = cfg;
  const rng = makeRng(cfg.seed);

  const rho = clamp(correlation, 0, 0.999);
  const sqrtRho = Math.sqrt(rho);
  const sqrtOneMinusRho = Math.sqrt(1 - rho);

  // Precompute each entity's disruption threshold Φ⁻¹(pᵢ).
  const thresholds = positions.map((p) =>
    normalInverseCdf(clamp(p.disruptionProb, 1e-6, 1 - 1e-6))
  );

  const losses = new Float64Array(trials);
  let sum = 0;
  let sumSq = 0;

  for (let t = 0; t < trials; t += 1) {
    const m = rng.nextNormal(); // shared systemic factor
    let loss = 0;
    for (let i = 0; i < positions.length; i += 1) {
      const z = rng.nextNormal();
      const x = sqrtRho * m + sqrtOneMinusRho * z;
      if (x < thresholds[i]) {
        // Disruption occurred — draw a (truncated) loss-given-disruption.
        const lgd = clamp(lgdMean + lgdVol * rng.nextNormal(), 0.05, 1);
        loss += positions[i].exposureUsd * lgd;
      }
    }
    losses[t] = loss;
    sum += loss;
    sumSq += loss * loss;
  }

  const sorted = Float64Array.from(losses).sort();
  const expectedLossUsd = sum / trials;
  const variance = Math.max(0, sumSq / trials - expectedLossUsd * expectedLossUsd);
  const stdevUsd = Math.sqrt(variance);

  const quantile = (q: number): number => {
    const idx = clamp(Math.floor(q * trials), 0, trials - 1);
    return sorted[idx];
  };

  const varUsd = quantile(confidence);
  const varIndex = clamp(Math.floor(confidence * trials), 0, trials - 1);
  let tailSum = 0;
  for (let i = varIndex; i < trials; i += 1) tailSum += sorted[i];
  const cvarUsd = tailSum / (trials - varIndex);

  const sumStandaloneCvarUsd = positions.reduce(
    (acc, p) => acc + standaloneCvar(p, lgdMean, lgdVol, confidence),
    0
  );
  const diversificationRatio =
    sumStandaloneCvarUsd > 0 ? cvarUsd / sumStandaloneCvarUsd : 1;

  // Histogram: bin [0, p99·1.15] so the tail is visible without a lone outlier
  // flattening every other bar.
  const histogramMaxUsd = Math.max(quantile(0.99) * 1.15, 1);
  const histogram = new Array(HIST_BINS).fill(0);
  const binWidth = histogramMaxUsd / HIST_BINS;
  for (let t = 0; t < trials; t += 1) {
    const bin = clamp(Math.floor(losses[t] / binWidth), 0, HIST_BINS - 1);
    histogram[bin] += 1;
  }

  return {
    trials,
    confidence,
    expectedLossUsd,
    varUsd,
    cvarUsd,
    stdevUsd,
    p50Usd: quantile(0.5),
    p95Usd: quantile(0.95),
    p99Usd: quantile(0.99),
    maxUsd: sorted[trials - 1],
    sumStandaloneCvarUsd,
    diversificationRatio,
    diversificationBenefitUsd: Math.max(0, sumStandaloneCvarUsd - cvarUsd),
    histogram,
    histogramMaxUsd,
  };
}

/**
 * Derive simulation positions and a stress-scaled config from live company data.
 * Disruption probability is convex in the company's live risk score (high-risk
 * names fail disproportionately under stress); correlation and loss severity
 * both rise with the scenario severity, capturing contagion clustering.
 */
export function buildScenarioSimulation(
  companies: Company[],
  options: { severity?: number; confidence?: number; seed?: string | number } = {}
): { positions: Position[]; config: SimConfig } {
  const severity = (options.severity ?? 100) / 100; // 0.5 – 1.5 typical
  const confidence = (options.confidence ?? 95) / 100;

  const positions: Position[] = companies.map((c) => {
    const scoreFrac = clamp(c.score / 100, 0, 1);
    const disruptionProb = clamp(
      0.02 + 0.55 * scoreFrac * scoreFrac * severity,
      0.005,
      0.92
    );
    return {
      id: c.id,
      name: c.name,
      exposureUsd: c.cvarUsd,
      disruptionProb,
    };
  });

  const config: SimConfig = {
    trials: 10_000,
    correlation: clamp(0.15 + 0.35 * severity, 0.1, 0.85),
    lgdMean: clamp(0.45 + 0.12 * severity, 0.3, 0.85),
    lgdVol: 0.15,
    confidence,
    seed: options.seed ?? "ripple",
  };

  return { positions, config };
}
