import type {
  Alert,
  Company,
  IntelligenceFeedItem,
  SignalStream,
  SimulationRun,
} from "@/types/domain";
import { downloadCsv } from "./csv";

export function exportCompaniesCsv(companies: Company[]): void {
  const rows: (string | number)[][] = [
    ["id", "name", "tier", "score", "cvar", "delta7d", "contagion_hops"],
    ...companies.map((c) => [
      c.id,
      c.name,
      c.tier,
      c.score,
      c.cvar,
      c.delta7d,
      c.contagionHops,
    ]),
  ];
  downloadCsv(`ripple-companies-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export function exportSignalsCsv(streams: SignalStream[]): void {
  const rows: (string | number)[][] = [
    ["id", "name", "category", "level", "score", "updated", "description"],
    ...streams.map((s) => [
      s.id,
      s.name,
      s.category,
      s.level,
      s.score,
      s.time,
      s.description,
    ]),
  ];
  downloadCsv(`ripple-signals-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export function exportAlertsCsv(alerts: Alert[]): void {
  const rows: (string | number)[][] = [
    ["id", "level", "status", "title", "detail", "meta", "critical"],
    ...alerts.map((a) => [
      a.id,
      a.level,
      a.status,
      a.title,
      a.detail,
      a.meta,
      a.critical ? "yes" : "no",
    ]),
  ];
  downloadCsv(`ripple-alerts-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export function exportIntelligenceCsv(items: IntelligenceFeedItem[]): void {
  const rows: (string | number)[][] = [
    ["company", "source", "published_at", "title", "url", "summary"],
    ...items.map((item) => [
      item.companyName,
      item.story.source,
      item.story.publishedAt,
      item.story.title,
      item.story.url,
      item.story.summary ?? "",
    ]),
  ];
  downloadCsv(`ripple-intelligence-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export function exportSimulationRunCsv(run: SimulationRun): void {
  const rows: (string | number)[][] = [
    ["section", "key", "value"],
    ["meta", "scenario", run.scenarioName],
    ["meta", "ran_at", run.ranAt],
  ];

  if (run.riskMetrics) {
    const m = run.riskMetrics;
    rows.push(
      ["risk", "confidence", m.confidence],
      ["risk", "trials", m.trials],
      ["risk", "expected_loss_usd", Math.round(m.expectedLossUsd)],
      ["risk", "var_usd", Math.round(m.varUsd)],
      ["risk", "cvar_usd", Math.round(m.cvarUsd)],
      ["risk", "p99_usd", Math.round(m.p99Usd)],
      ["risk", "diversification_ratio", Number(m.diversificationRatio.toFixed(4))],
      ["risk", "diversification_benefit_usd", Math.round(m.diversificationBenefitUsd)]
    );
  }

  run.lossDistribution?.forEach((count, i) => rows.push(["histogram", `bin_${i}`, count]));
  run.profile.forEach((magnitude, i) => rows.push(["profile", `bar_${i}`, magnitude]));

  downloadCsv(
    `ripple-simulation-${run.scenarioId}-${new Date().toISOString().slice(0, 10)}.csv`,
    rows
  );
}
