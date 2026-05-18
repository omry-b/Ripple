export type CvarConfidence = 95 | 99;

export function getCvarMultiplier(level: CvarConfidence = 95): number {
  return level === 99 ? 1.18 : 1;
}

export function formatCvarLevel(level: CvarConfidence): string {
  return `CVaR${level === 99 ? "₉₉" : "₉₅"}`;
}
