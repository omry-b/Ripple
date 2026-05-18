import type { SignalStream } from "@/types/domain";
import { riskLevelFromScore } from "@/lib/risk/levels";

const streamScores = new Map<string, number>();

export function setStreamScoresFromIngest(scores: Map<string, number>): void {
  streamScores.clear();
  for (const [id, score] of scores) {
    streamScores.set(id, score);
  }
}

export function applyIngestScoreOverrides(streams: SignalStream[]): SignalStream[] {
  return streams.map((stream) => {
    const score = streamScores.get(stream.id);
    if (score === undefined) return stream;
    const level = riskLevelFromScore(score);
    const history7d = [...stream.history7d.slice(-6), score];
    return { ...stream, score, level, history7d };
  });
}

export function clearIngestScoreOverrides(): void {
  streamScores.clear();
}
