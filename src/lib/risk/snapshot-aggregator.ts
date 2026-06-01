import type {
  Alert,
  Company,
  DashboardSnapshot,
  SignalStream,
} from "@/types/domain";
import type { PersistedIngestEvent } from "@/lib/ingest/sync-risk";
import { mergeHotspots } from "@/lib/geo/hotspots";
import {
  countLiveSignals,
  formatCvarDeltaLabel,
  formatSignalsDeltaLabel,
} from "@/lib/risk/snapshot-labels";

type AggregateInput = {
  companies: Company[];
  alerts: Alert[];
  streams: SignalStream[];
  ingestEvents?: PersistedIngestEvent[];
};

export function aggregateSnapshot(input: AggregateInput): DashboardSnapshot {
  const openAlerts = input.alerts.filter((a) => a.status === "open");
  const elevatedAlerts = openAlerts.filter((a) => a.level === "elevated");
  const ingestEvents = input.ingestEvents ?? [];

  const exposed = input.companies.filter((c) => c.score >= 50).length;
  const cvarTotal = input.companies.reduce((sum, c) => sum + c.cvarUsd, 0);
  const cvarB = cvarTotal / 1e9;

  const hotspots = mergeHotspots(openAlerts, input.streams, ingestEvents);

  const avgScore =
    input.companies.length > 0
      ? input.companies.reduce((s, c) => s + c.score, 0) / input.companies.length
      : 0;

  return {
    asOf: new Date().toISOString(),
    riskIndex: Math.round(avgScore * 10) / 10,
    exposedCompanies: exposed,
    trackedCompanies: input.companies.length,
    cvar95BaselineB: Math.round(cvarB * 10) / 10,
    cvar95Display: `$${cvarB.toFixed(1)}B`,
    cvarDeltaLabel: formatCvarDeltaLabel(input.companies),
    cvarProgressPercent: Math.min(100, Math.round((cvarB / 5) * 100)),
    liveSignalsCount: countLiveSignals(input.streams),
    signalsDeltaLabel: formatSignalsDeltaLabel(input.streams, openAlerts, ingestEvents),
    elevatedSignals24h: elevatedAlerts.length,
    openAlertsCount: openAlerts.length,
    activeStreamsCount: input.streams.length,
    hotspots,
  };
}
