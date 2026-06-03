/**
 * Decision-support engine — the "so what" layer.
 *
 * A risk score tells a user *what* is happening; this turns it into *what to do*.
 * For each held position we identify the dominant risk driver, attach a concrete
 * mitigation (with effort / cost / expected impact), estimate the dollars at risk
 * on that specific position, and rank everything into a single prioritized action
 * queue so a user knows where to spend the next hour.
 */
import type { Alert, Company, ScoreFactor } from "@/types/domain";
import { getScoreFactorsForCompany } from "@/lib/mock/score-factors";
import { positionExpectedLossUsd } from "@/lib/risk/monte-carlo-engine";
import type { PortfolioPosition } from "@/lib/portfolio/metrics";

export type Recommendation = {
  factorKey: string;
  factorLabel: string;
  title: string;
  rationale: string;
  effort: "Low" | "Medium" | "High";
  cost: "$" | "$$" | "$$$";
  impact: string;
};

export type PriorityAction = {
  company: Company;
  exposureUsd: number;
  score: number;
  level: "critical" | "elevated" | "normal";
  /** Expected loss on this position at current risk (USD). */
  dollarsAtRisk: number;
  /** Ranking weight = exposure × risk, boosted by an open alert. */
  priority: number;
  hasOpenAlert: boolean;
  reason: string;
  recommendation: Recommendation;
};

/** Mitigation playbook keyed by dominant risk factor. */
const PLAYBOOK: Record<string, Omit<Recommendation, "factorKey" | "factorLabel">> = {
  geo: {
    title: "Qualify a supplier outside the exposed region",
    rationale:
      "Geopolitical stress is the largest driver. A second source in a different jurisdiction caps single-region exposure.",
    effort: "High",
    cost: "$$$",
    impact: "Removes single-region dependency on this supplier",
  },
  logistics: {
    title: "Pre-position inventory and add a backup lane",
    rationale:
      "Shipping and port congestion dominate the risk. Buffer stock plus an alternate route absorb transit shocks.",
    effort: "Medium",
    cost: "$$",
    impact: "Cuts delivery-delay risk on in-transit orders",
  },
  financial: {
    title: "Tighten payment terms and monitor supplier liquidity",
    rationale:
      "Financial distress is the top factor. Shorter terms and a credit watch reduce counterparty exposure.",
    effort: "Low",
    cost: "$",
    impact: "Limits loss if the supplier defaults",
  },
  concentration: {
    title: "Dual-source the most concentrated component",
    rationale:
      "Supplier concentration is the leading driver. Splitting volume to a second source breaks the single point of failure.",
    effort: "High",
    cost: "$$$",
    impact: "Reduces contagion depth on this position",
  },
  weather: {
    title: "Build a seasonal buffer and review BCP coverage",
    rationale:
      "Weather and climate exposure leads. Seasonal safety stock and a tested continuity plan blunt disruption.",
    effort: "Medium",
    cost: "$$",
    impact: "Softens climate-driven supply gaps",
  },
};

const FALLBACK: Omit<Recommendation, "factorKey" | "factorLabel"> = {
  title: "Review exposure and set a monitoring threshold",
  rationale: "Risk is broadly elevated with no single dominant driver. Keep this position under active watch.",
  effort: "Low",
  cost: "$",
  impact: "Earlier warning if risk escalates",
};

export function dominantFactor(company: Company): ScoreFactor | null {
  const factors = getScoreFactorsForCompany(company.id, company.score);
  if (factors.length === 0) return null;
  return factors.reduce((top, f) => (f.contribution > top.contribution ? f : top));
}

export function recommendForCompany(company: Company): Recommendation {
  const factor = dominantFactor(company);
  const key = factor?.key ?? "";
  const template = PLAYBOOK[key] ?? FALLBACK;
  return {
    factorKey: key || "general",
    factorLabel: factor?.label ?? "General risk",
    ...template,
  };
}

function levelForScore(score: number): PriorityAction["level"] {
  if (score >= 70) return "critical";
  if (score >= 50) return "elevated";
  return "normal";
}

/**
 * Rank held positions into a prioritized action queue. Priority weights dollar
 * exposure by risk so a large stake in a moderately risky supplier can outrank a
 * tiny stake in a critical one — which is how a portfolio owner should triage.
 * An open alert on the company applies a 1.4× boost.
 */
export function buildActionQueue(
  positions: PortfolioPosition[],
  alerts: Alert[] = [],
  limit = 5
): PriorityAction[] {
  const alertedCompanyIds = new Set(
    alerts.filter((a) => a.status === "open").flatMap((a) => a.affectedCompanyIds)
  );

  return positions
    .map((p): PriorityAction => {
      const { company, exposureUsd } = p;
      const score = company.score;
      const hasOpenAlert = alertedCompanyIds.has(company.id);
      const dollarsAtRisk = positionExpectedLossUsd(score, exposureUsd);
      const priority = dollarsAtRisk * (hasOpenAlert ? 1.4 : 1);
      const level = levelForScore(score);
      const reason = hasOpenAlert
        ? `Open alert on a ${level} position`
        : `${level === "normal" ? "Monitored" : level[0].toUpperCase() + level.slice(1)} risk on a sized position`;
      return {
        company,
        exposureUsd,
        score,
        level,
        dollarsAtRisk,
        priority,
        hasOpenAlert,
        reason,
        recommendation: recommendForCompany(company),
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
