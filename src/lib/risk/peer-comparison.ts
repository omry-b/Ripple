/**
 * Peer comparison computed from the *actual* same-tier companies in the book,
 * not fixed constants — so the median, percentile, and peer count update as the
 * portfolio and scores move.
 */
import type { Company } from "@/types/domain";

export type PeerComparison = {
  sectorLabel: string;
  medianScore: number;
  medianCvarUsd: number;
  peerCount: number;
  scoreDelta: number;
  scorePercentile: number;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function computePeerComparison(company: Company, peers: Company[]): PeerComparison {
  const isTier1 = company.tier === "Tier 1";
  const sectorLabel = isTier1
    ? "Tier 1 supply-chain peers"
    : "Tier 2 component & logistics peers";

  if (peers.length === 0) {
    return {
      sectorLabel,
      medianScore: company.score,
      medianCvarUsd: company.cvarUsd,
      peerCount: 0,
      scoreDelta: 0,
      scorePercentile: 50,
    };
  }

  const medianScore = Math.round(median(peers.map((p) => p.score)));
  const medianCvarUsd = median(peers.map((p) => p.cvarUsd));
  // Percentile by risk: share of peers this company is riskier than (higher score).
  const riskierThan = peers.filter((p) => company.score >= p.score).length;
  const scorePercentile = Math.min(99, Math.max(1, Math.round((riskierThan / peers.length) * 100)));

  return {
    sectorLabel,
    medianScore,
    medianCvarUsd,
    peerCount: peers.length,
    scoreDelta: company.score - medianScore,
    scorePercentile,
  };
}
