import type { Alert, SignalStream } from "@/types/domain";
import type { PersistedIngestEvent } from "@/lib/ingest/sync-risk";

export function formatSignalsDeltaLabel(
  streams: SignalStream[],
  alerts: Alert[],
  ingestEvents: PersistedIngestEvent[]
): string {
  const elevatedStreams = streams.filter(
    (s) => s.level === "elevated" || s.level === "critical"
  ).length;
  const openAlerts = alerts.filter((a) => a.status === "open").length;
  const liveEvents = ingestEvents.filter((e) => e.level !== "normal").length;
  return `${liveEvents} live events · ${elevatedStreams} hot streams · ${openAlerts} open alerts`;
}

export function countLiveSignals(streams: SignalStream[]): number {
  return streams.reduce((sum, s) => sum + Math.max(0, s.score), 0);
}
