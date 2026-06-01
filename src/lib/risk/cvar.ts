import type { Company } from "@/types/domain";
import { computePortfolioCvar } from "@/lib/risk/portfolio-metrics";

export function computePortfolioCvar95(companies: Company[]): {
  totalUsd: number;
  display: string;
  deltaLabel: string;
} {
  const { totalUsd, display } = computePortfolioCvar(companies);
  return {
    totalUsd,
    display,
    deltaLabel: "Live portfolio tail from scored positions",
  };
}
