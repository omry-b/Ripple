/** Mock CVaR backtest series for demo charts (not validated against realized losses). */
export function getCvarBacktestSeries(companyId: string): {
  labels: string[];
  predicted: number[];
  realized: number[];
} {
  const seed = companyId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const predicted = labels.map((_, i) => 1.2 + ((seed + i * 7) % 10) * 0.08);
  const realized = predicted.map((p, i) => p + (((seed + i) % 5) - 2) * 0.06);
  return { labels, predicted, realized };
}
