/** Deterministic 30-day risk score series ending at `currentScore`. */
export function buildScoreHistory30d(companyId: string, currentScore: number): number[] {
  let seed = 0;
  for (let i = 0; i < companyId.length; i++) {
    seed += companyId.charCodeAt(i);
  }
  const start = Math.max(18, currentScore - 12 - (seed % 8));
  return Array.from({ length: 30 }, (_, i) => {
    const t = i / 29;
    const wave = Math.sin((seed + i) * 0.4) * 2.5;
    const value = start + (currentScore - start) * t + wave * (1 - t * 0.5);
    return Math.round(Math.min(99, Math.max(10, value)));
  });
}
