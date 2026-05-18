import { getDataSource } from "@/lib/data";
import type { SignalReading } from "@/lib/ingest/normalizer";
import { applyReadingsToStreams, streamScoresMap } from "@/lib/risk/apply-readings";
import { setStreamScoresFromIngest } from "@/lib/mock/ingest-score-state";

export async function refreshScoresFromReadings(
  readings: SignalReading[]
): Promise<number> {
  if (readings.length === 0) return 0;

  const data = await getDataSource();
  const streams = await data.getSignals();
  const updated = applyReadingsToStreams(streams, readings);

  if (data.mode === "mock") {
    setStreamScoresFromIngest(streamScoresMap(updated));
  }

  return updated.filter((s, i) => s.score !== streams[i]?.score).length;
}
