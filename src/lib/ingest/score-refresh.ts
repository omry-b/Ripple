import { getDataSource } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db/client";
import type { SignalReading } from "@/lib/ingest/normalizer";
import { persistReadingsAndRescoreStreams } from "@/lib/ingest/postgres-readings";
import { applyReadingsToStreams, streamScoresMap } from "@/lib/risk/apply-readings";
import { setStreamScoresFromIngest } from "@/lib/mock/ingest-score-state";

export async function refreshScoresFromReadings(
  readings: SignalReading[]
): Promise<number> {
  if (readings.length === 0) return 0;

  if (isDatabaseConfigured()) {
    return persistReadingsAndRescoreStreams(readings);
  }

  const data = await getDataSource();
  const streams = await data.getSignals();
  const updated = applyReadingsToStreams(streams, readings);
  setStreamScoresFromIngest(streamScoresMap(updated));
  return updated.filter((s, i) => s.score !== streams[i]?.score).length;
}
