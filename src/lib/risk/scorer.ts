import type { SignalStream } from "@/types/domain";

export { applyReadingsToStreams } from "@/lib/risk/apply-readings";

/**
 * Legacy single-stream nudge  -  prefer applyReadingsToStreams via ingest pipeline.
 */
export function scoreSignalStream(
  stream: SignalStream,
  /** Placeholder jitter simulating new readings */
  delta = 0
): number {
  const base = stream.score;
  const next = Math.min(100, Math.max(0, base + delta));
  return Math.round(next);
}

export function scoreCompanyFromSignals(
  companyId: string,
  streams: SignalStream[]
): number {
  const related = streams.filter((s) => s.relatedCompanyIds.includes(companyId));
  if (related.length === 0) return 40;
  const avg = related.reduce((sum, s) => sum + s.score, 0) / related.length;
  return Math.round(avg);
}
