import type { Company } from "@/types/domain";

/**
 * Placeholder CVaR₉₅  -  sums company CVaR USD for portfolio exposure.
 * Replace with Monte Carlo / copula model when risk engine is production-ready.
 */
export function computePortfolioCvar95(companies: Company[]): {
  totalUsd: number;
  display: string;
  deltaLabel: string;
} {
  const totalUsd = companies.reduce((sum, c) => sum + c.cvarUsd, 0);
  const billions = totalUsd / 1e9;
  return {
    totalUsd,
    display: `$${billions.toFixed(1)}B`,
    deltaLabel: "Placeholder · not a regulatory CVaR calculation",
  };
}
