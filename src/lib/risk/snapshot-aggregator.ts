import type {
  Alert,
  Company,
  DashboardSnapshot,
  SignalStream,
} from "@/types/domain";
import type { PersistedIngestEvent } from "@/lib/ingest/sync-risk";
import { mergeHotspots } from "@/lib/geo/hotspots";
import {
  computePortfolioCvar,
  computePortfolioCvarBaseline,
  computeRiskIndex,
  scorePortfolioCompanies,
} from "@/lib/risk/portfolio-metrics";
import { countLiveSignals, formatSignalsDeltaLabel } from "@/lib/risk/snapshot-labels";

type AggregateInput = {
  companies: Company[];
  alerts: Alert[];
  streams: SignalStream[];
  ingestEvents?: PersistedIngestEvent[];
};

export function aggregateSnapshot(input: AggregateInput): DashboardSnapshot {
  const ingestEvents = input.ingestEvents ?? [];
  const scoredCompanies = scorePortfolioCompanies(input.companies, input.streams);
  const openAlerts = input.alerts.filter((a) => a.status === "open");
  const elevatedAlerts = openAlerts.filter((a) => a.level === "elevated");

  const exposed = scoredCompanies.filter((c) => c.score >= 50).length;
  const hotspots = mergeHotspots(openAlerts, input.streams, ingestEvents);

  const portfolioCvar = computePortfolioCvar(scoredCompanies);
  const cvarBaseline = computePortfolioCvarBaseline(scoredCompanies);
  const riskIndex = computeRiskIndex(
    input.streams,
    input.alerts,
    ingestEvents,
    scoredCompanies
  );

  return {
    asOf: new Date().toISOString(),
    riskIndex,
    exposedCompanies: exposed,
    trackedCompanies: scoredCompanies.length,
    portfolioCvarB: portfolioCvar.billions,
    cvar95BaselineB: cvarBaseline.baselineB,
    cvar95Display: portfolioCvar.display,
    cvarDeltaLabel: cvarBaseline.deltaLabel,
    cvarProgressPercent: cvarBaseline.progressPercent,
    liveSignalsCount: countLiveSignals(input.streams),
    signalsDeltaLabel: formatSignalsDeltaLabel(input.streams, openAlerts, ingestEvents),
    elevatedSignals24h: elevatedAlerts.length,
    openAlertsCount: openAlerts.length,
    activeStreamsCount: input.streams.length,
    hotspots,
  };
}

/** Score companies for API payloads so tables match the live snapshot. */
export function scoreCompaniesForPayload(
  companies: Company[],
  streams: SignalStream[]
): Company[] {
  return scorePortfolioCompanies(companies, streams);
}
