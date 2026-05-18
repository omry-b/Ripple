export type PeerComparison = {
  sectorLabel: string;
  medianScore: number;
  medianCvarUsd: number;
  peerCount: number;
  scoreDelta: number;
  scorePercentile: number;
};

export function getPeerComparison(
  tier: string,
  score: number,
  cvarUsd: number
): PeerComparison {
  const isTier1 = tier === "Tier 1";
  const medianScore = isTier1 ? 52 : 44;
  const medianCvarUsd = isTier1 ? 0.35e9 : 0.18e9;
  const peerCount = isTier1 ? 124 : 312;
  const scoreDelta = score - medianScore;
  const scorePercentile = Math.min(
    99,
    Math.max(1, Math.round(50 + (score - medianScore) * 1.8))
  );

  return {
    sectorLabel: isTier1 ? "Tier 1 electronics supply chain" : "Tier 2 semiconductor & components",
    medianScore,
    medianCvarUsd,
    peerCount,
    scoreDelta,
    scorePercentile,
  };
}
