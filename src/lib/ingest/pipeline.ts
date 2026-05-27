import { getDataSource } from "@/lib/data";
import { invalidateSnapshotCache } from "@/lib/cache/snapshot-cache";
import { listDeadLetters, pushDeadLetter } from "@/lib/ingest/dead-letter";
import { normalizeEventsToReadings } from "@/lib/ingest/normalizer";
import { refreshScoresFromReadings } from "@/lib/ingest/score-refresh";
import { INGEST_ADAPTERS, getAdapter } from "./registry";
import type { IngestAdapterResult, NormalizedIngestEvent } from "./types";

export type IngestPipelineResult = {
  runs: Array<{
    adapter: string;
    status: "completed" | "failed";
    eventsIngested: number;
    message: string;
  }>;
  totalEvents: number;
  readingsNormalized: number;
  streamsRescored: number;
  snapshotRefreshed: boolean;
  deadLetterCount: number;
};

export async function runIngestPipeline(
  adapterNames?: string[]
): Promise<IngestPipelineResult> {
  const data = await getDataSource();
  const adapters = adapterNames?.length
    ? (adapterNames.map((n) => getAdapter(n)).filter(Boolean) as typeof INGEST_ADAPTERS)
    : INGEST_ADAPTERS;

  const runs: IngestPipelineResult["runs"] = [];
  let totalEvents = 0;
  const allEvents: NormalizedIngestEvent[] = [];

  for (const adapter of adapters) {
    if (!adapter) continue;
    const runId = `ingest-${adapter.name}-${Date.now()}`;
    const startedAt = new Date().toISOString();

    await data.recordIngestRun({
      id: runId,
      adapter: adapter.name,
      status: "running",
      startedAt,
      eventsIngested: 0,
      message: "Started",
    });

    try {
      const result: IngestAdapterResult = await adapter.fetch();
      allEvents.push(...result.events);
      totalEvents += result.events.length;

      await data.recordIngestRun({
        id: runId,
        adapter: adapter.name,
        status: "completed",
        startedAt,
        finishedAt: new Date().toISOString(),
        eventsIngested: result.events.length,
        message: result.message,
      });

      runs.push({
        adapter: adapter.name,
        status: "completed",
        eventsIngested: result.events.length,
        message: result.message,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ingest failed";
      pushDeadLetter(adapter.name, message);
      await data.recordIngestRun({
        id: runId,
        adapter: adapter.name,
        status: "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        eventsIngested: 0,
        message,
      });
      runs.push({
        adapter: adapter.name,
        status: "failed",
        eventsIngested: 0,
        message,
      });
    }
  }

  const readings = normalizeEventsToReadings(allEvents);
  const streamsRescored = await refreshScoresFromReadings(readings);

  let snapshotRefreshed = false;
  try {
    await data.refreshSnapshot();
    invalidateSnapshotCache();
    snapshotRefreshed = true;
  } catch {
    /* mock mode always succeeds */
  }

  return {
    runs,
    totalEvents,
    readingsNormalized: readings.length,
    streamsRescored,
    snapshotRefreshed,
    deadLetterCount: listDeadLetters().length,
  };
}

/** Apply pre-normalized edge events (e.g. from Cloudflare Queue consumer). */
export async function runIngestFromEvents(
  events: NormalizedIngestEvent[],
  meta?: { source?: string }
): Promise<{
  totalEvents: number;
  readingsNormalized: number;
  streamsRescored: number;
  snapshotRefreshed: boolean;
}> {
  const data = await getDataSource();
  const source = meta?.source ?? "edge-batch";

  if (events.length > 0) {
    await data.recordIngestRun({
      id: `ingest-${source}-${Date.now()}`,
      adapter: source,
      status: "completed",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      eventsIngested: events.length,
      message: `Batch from ${source}`,
    });
  }

  const readings = normalizeEventsToReadings(events);
  const streamsRescored = await refreshScoresFromReadings(readings);

  let snapshotRefreshed = false;
  try {
    await data.refreshSnapshot();
    invalidateSnapshotCache();
    snapshotRefreshed = true;
  } catch {
    /* mock */
  }

  return {
    totalEvents: events.length,
    readingsNormalized: readings.length,
    streamsRescored,
    snapshotRefreshed,
  };
}
