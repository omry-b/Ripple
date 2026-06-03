/**
 * Scenario-facing wrapper over the real Monte Carlo engine.
 *
 * Historically this returned a deterministic closed-form curve labelled "Monte
 * Carlo". It now runs an actual seeded simulation (`simulatePortfolioLoss`) over
 * the live portfolio and returns the resulting loss histogram plus coherent
 * VaR / CVaR tail metrics.
 */
import type { Company } from "@/types/domain";
import {
  buildScenarioSimulation,
  simulatePortfolioLoss,
  type PortfolioLossResult,
} from "@/lib/risk/monte-carlo-engine";

export type LossSimulation = {
  histogram: number[];
  result: PortfolioLossResult;
};

/**
 * Simulate the portfolio loss distribution for a scenario over the supplied
 * companies. Deterministic given (companies, severity, confidence, seed).
 */
export function simulateScenarioLoss(
  companies: Company[],
  options: { severity?: number; confidence?: number; seed?: string | number } = {}
): LossSimulation {
  const { positions, config } = buildScenarioSimulation(companies, options);
  const result = simulatePortfolioLoss(positions, config);
  return { histogram: result.histogram, result };
}
