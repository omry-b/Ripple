import type { Company } from "@/types/domain";
import { computePortfolioCvarBaseline } from "@/lib/risk/portfolio-metrics";

/** @deprecated Use computePortfolioCvarBaseline from portfolio-metrics */
export function computeCvarBaseline(companies: Company[]) {
  return computePortfolioCvarBaseline(companies);
}
