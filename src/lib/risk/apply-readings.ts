import type { SignalStream } from "@/types/domain";
import type { SignalReading } from "@/lib/ingest/normalizer";
import { getCategoryWeight } from "@/lib/risk/weights";
import { riskLevelFromScore } from "@/lib/risk/levels";

const BLEND = 0.35;

/**
 * Recompute stream scores from normalized ingest readings (weighted blend vs current).
 */
export function applyReadingsToStreams(
  streams: SignalStream[],
  readings: SignalReading[]
): SignalStream[] {
  if (readings.length === 0) return streams;

  const bySignal = new Map<string, number[]>();
  for (const reading of readings) {
    const list = bySignal.get(reading.signalId) ?? [];
    list.push(reading.value);
    bySignal.set(reading.signalId, list);
  }

  return streams.map((stream) => {
    const values = bySignal.get(stream.id);
    if (!values?.length) return stream;

    const readingAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const weight = getCategoryWeight(stream.category);
    const weightedReading = Math.min(
      100,
      Math.round(readingAvg * (0.85 + weight * 0.05))
    );
    const nextScore = Math.min(
      100,
      Math.max(0, Math.round(stream.score * (1 - BLEND) + weightedReading * BLEND))
    );
    const level = riskLevelFromScore(nextScore);
    const history7d = [...stream.history7d.slice(-6), nextScore];

    return {
      ...stream,
      score: nextScore,
      level,
      history7d,
      time: "just now",
    };
  });
}

export function streamScoresMap(streams: SignalStream[]): Map<string, number> {
  return new Map(streams.map((s) => [s.id, s.score]));
}
