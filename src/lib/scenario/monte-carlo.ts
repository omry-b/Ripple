/** 12-bin loss distribution for scenario preview (placeholder Monte Carlo). */
export function monteCarloLossBins(severity: number, seed = 1): number[] {
  const bins = 12;
  const result: number[] = [];
  for (let i = 0; i < bins; i += 1) {
    const noise = ((seed * (i + 3) * 17) % 23) / 23;
    const base = Math.exp(-i / (3 + severity * 2)) * severity * 100;
    result.push(Math.round(base * (0.7 + noise * 0.6)));
  }
  return result;
}

export function topContagionEntities(scenarioName: string): string[] {
  const defaults = ["TSMC", "Foxconn", "Samsung", "Qualcomm", "NVIDIA"];
  if (scenarioName.toLowerCase().includes("taiwan")) {
    return ["TSMC", "Apple Inc.", "Foxconn", "ASE Group", "MediaTek"];
  }
  return defaults.slice(0, 4);
}
