import type { Company, GeoRegion, ScoreFactor } from "@/types/domain";

const FACTOR_TEMPLATES = [
  { key: "geo", label: "Geopolitical exposure", base: 28 },
  { key: "logistics", label: "Logistics & shipping", base: 24 },
  { key: "financial", label: "Financial distress", base: 18 },
  { key: "concentration", label: "Supplier concentration", base: 20 },
  { key: "weather", label: "Weather & climate", base: 10 },
] as const;

/** Freight / EMS names whose risk skews toward logistics. */
const LOGISTICS_IDS = new Set([
  "maersk",
  "dhl-supply",
  "kuehne-nagel",
  "db-schenker",
  "flex",
  "jabil",
  "foxconn",
  "pegatron",
  "wistron",
]);

const GEO_BIAS: Record<GeoRegion, number> = { APAC: 1.25, EMEA: 1.0, AMER: 0.8 };
const WEATHER_BIAS: Record<GeoRegion, number> = { APAC: 1.15, AMER: 1.1, EMEA: 0.85 };

/** Stable 0–1 pseudo-jitter per (id, key) so same-profile peers still differ. */
function jitter(id: string, key: string): number {
  let h = 0;
  const s = `${id}:${key}`;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
}

/**
 * Derives a company's score-driver breakdown from its real attributes (region,
 * tier, live score, contagion depth) rather than a hand-written table that only
 * covered seven names. Every company now gets a distinct, plausible mix:
 * APAC names skew geopolitical, logistics/EMS names skew shipping, Tier-1 OEMs
 * skew supplier-concentration, lower-scoring names carry more financial weight.
 * Deterministic, so a company's breakdown is stable across renders.
 */
export function getScoreFactorsForCompany(company: Company): ScoreFactor[] {
  const { id, region, tier, score, contagionHops } = company;
  const scoreFrac = Math.min(1, Math.max(0, score / 100));
  const isTier1 = tier === "Tier 1";

  const mult: Record<string, number> = {
    geo: GEO_BIAS[region] * (0.85 + scoreFrac * 0.5) * (0.9 + jitter(id, "geo") * 0.2),
    logistics:
      (LOGISTICS_IDS.has(id) ? 1.6 : region === "APAC" ? 1.1 : 0.95) *
      (0.9 + jitter(id, "log") * 0.2),
    financial: (isTier1 ? 0.9 : 1.1) * (0.85 + (1 - scoreFrac) * 0.4) * (0.9 + jitter(id, "fin") * 0.2),
    concentration:
      (isTier1 ? 1.25 : 0.9) *
      (1 + Math.min(contagionHops, 4) * 0.06) *
      (0.9 + jitter(id, "con") * 0.2),
    weather: WEATHER_BIAS[region] * (0.9 + jitter(id, "wea") * 0.3),
  };

  const weighted = FACTOR_TEMPLATES.map((f) => ({ ...f, effective: f.base * mult[f.key] }));
  const sum = weighted.reduce((a, w) => a + w.effective, 0) || 1;

  return weighted.map((w) => ({
    key: w.key,
    label: w.label,
    weight: Math.round((w.effective / sum) * 100),
    contribution: Math.round((w.effective / sum) * score),
  }));
}
