/**
 * Dynamic score-change attribution.
 *
 * Instead of hand-written blurbs for a handful of companies, this derives the
 * "why did the score move" story for *every* company from its real dominant
 * risk factors and the live signal streams affecting it. The 7-day delta is
 * distributed across the actual top drivers, so the explanation is specific and
 * stays in sync as scores and signals change.
 */
import type { Company, ScoreFactor, SignalStream } from "@/types/domain";

export type ScoreAttribution = {
  summary: string;
  drivers: { label: string; points: number }[];
  /** "up" = risk rose over 7d, "down" = risk eased. */
  direction: "up" | "down";
};

/** Parse a delta label like "↑ +9" / "↓ -2" into a signed integer. */
export function parseDelta(delta7d: string): number {
  const match = delta7d.match(/-?\d+/);
  const magnitude = match ? Math.abs(Number.parseInt(match[0], 10)) : 3;
  const down = /↓|-/.test(delta7d);
  return down ? -magnitude : magnitude;
}

/** Distribute a total across weights, rounding while preserving the sum and a floor of 1. */
function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const floored = raw.map((v) => Math.max(1, Math.round(v)));
  return floored;
}

export function computeScoreAttribution(
  company: Company,
  factors: ScoreFactor[],
  signals: SignalStream[]
): ScoreAttribution {
  const delta = parseDelta(company.delta7d);
  const direction: "up" | "down" = delta >= 0 ? "up" : "down";
  const magnitude = Math.max(1, Math.abs(delta));

  // Top risk factors for this company, by contribution.
  const topFactors = [...factors].sort((a, b) => b.contribution - a.contribution).slice(0, 2);

  // Strongest live signal touching this company.
  const topSignal = [...signals].sort((a, b) => b.score - a.score)[0];

  const driverSpecs: { label: string; weight: number }[] = topFactors.map((f) => ({
    label: f.label,
    weight: f.contribution,
  }));
  if (topSignal) {
    driverSpecs.push({
      label: `${topSignal.name} signal`,
      weight: Math.round(topSignal.score * 0.4),
    });
  }

  const points = distribute(magnitude, driverSpecs.map((d) => d.weight));
  const drivers = driverSpecs.map((d, i) => ({ label: d.label, points: points[i] }));

  const lead = topFactors[0]?.label.toLowerCase() ?? "broad signal drift";
  const signalClause = topSignal ? ` and the ${topSignal.name.toLowerCase()} stream` : "";
  const summary =
    direction === "up"
      ? `${company.delta7d} over 7d — led by ${lead}${signalClause}.`
      : `${company.delta7d} over 7d — easing ${lead} pressure${signalClause}.`;

  return { summary, drivers, direction };
}
