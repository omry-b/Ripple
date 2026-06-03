/**
 * Export a portfolio risk report a user can take into their own workflow — a
 * meeting, a stakeholder update, a procurement review. Includes the portfolio
 * summary plus every position with its dollar exposure, expected loss, dominant
 * risk driver, and recommended mitigation.
 */
import type { PortfolioMetrics, PortfolioPosition } from "@/lib/portfolio/metrics";
import { recommendForCompany } from "@/lib/portfolio/recommendations";
import { positionExpectedLossUsd } from "@/lib/risk/monte-carlo-engine";
import { downloadCsv } from "@/lib/export/csv";

export function exportPortfolioReportCsv(
  positions: PortfolioPosition[],
  metrics: PortfolioMetrics
): void {
  const usd = (n: number) => Math.round(n);
  const rows: (string | number)[][] = [
    ["Ripple — Portfolio Risk Report"],
    ["generated", new Date().toISOString()],
    [],
    ["Portfolio summary"],
    ["risk_index", metrics.riskIndex],
    ["positions", metrics.positionCount],
    ["total_exposure_usd", usd(metrics.totalExposureUsd)],
    ["cvar95_usd", usd(metrics.cvarUsd)],
    ["var95_usd", usd(metrics.varUsd)],
    ["expected_loss_usd", usd(metrics.expectedLossUsd)],
    ["diversification_benefit_usd", usd(metrics.diversificationBenefitUsd)],
    ["at_risk_positions", metrics.atRiskCount],
    ["critical_positions", metrics.criticalCount],
    [],
    ["Positions (ranked by dollars at risk)"],
    [
      "company",
      "region",
      "tier",
      "risk_score",
      "exposure_usd",
      "expected_loss_usd",
      "dominant_risk",
      "recommended_action",
      "effort",
      "cost",
    ],
  ];

  const ranked = [...positions].sort(
    (a, b) =>
      positionExpectedLossUsd(b.company.score, b.exposureUsd) -
      positionExpectedLossUsd(a.company.score, a.exposureUsd)
  );
  for (const p of ranked) {
    const rec = recommendForCompany(p.company);
    rows.push([
      p.company.name,
      p.company.region,
      p.company.tier,
      p.company.score,
      usd(p.exposureUsd),
      usd(positionExpectedLossUsd(p.company.score, p.exposureUsd)),
      rec.factorLabel,
      rec.title,
      rec.effort,
      rec.cost,
    ]);
  }

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`ripple-portfolio-report-${date}.csv`, rows);
}
