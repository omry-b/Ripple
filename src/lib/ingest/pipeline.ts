import { getDataSource } from "@/lib/data";
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
  snapshotRefreshed: boolean;
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

  // Placeholder: persist readings when postgres + real normalizer exist
  void allEvents;

  let snapshotRefreshed = false;
  try {
    await data.refreshSnapshot();
    snapshotRefreshed = true;
  } catch {
    /* mock mode always succeeds */
  }

  return { runs, totalEvents, snapshotRefreshed };
}
