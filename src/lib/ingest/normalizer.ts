import type { NormalizedIngestEvent } from "@/lib/ingest/types";

export type SignalReading = {
  id: string;
  signalId: string;
  companyId: string | null;
  recordedAt: string;
  value: number;
  summary: string;
};

export function normalizeEventsToReadings(events: NormalizedIngestEvent[]): SignalReading[] {
  return events.map((event) => ({
    id: `reading-${event.id}`,
    signalId: event.signalId ?? mapAdapterToSignal(event.adapter),
    companyId: event.companyId ?? null,
    recordedAt: event.occurredAt,
    value: Math.min(100, Math.max(0, event.severity)),
    summary: event.summary,
  }));
}

function mapAdapterToSignal(adapter: string): string {
  const map: Record<string, string> = {
    ais: "ais",
    gdelt: "geo",
    ports: "port",
    financial: "financial",
    weather: "weather",
  };
  return map[adapter] ?? adapter;
}
