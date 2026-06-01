import { getCvarBacktestSeries } from "@/lib/risk/cvar-backtest";

type CvarBacktestChartProps = {
  companyId: string;
};

export function CvarBacktestChart({ companyId }: CvarBacktestChartProps) {
  const { labels, predicted, realized } = getCvarBacktestSeries(companyId);
  const max = Math.max(...predicted, ...realized, 0.1);

  return (
    <section className="workbench-card" aria-labelledby="cvar-backtest-title">
      <h3 id="cvar-backtest-title" className="supplier-tier-title">
        CVaR backtest (mock)
      </h3>
      <p className="watchlist-manager-hint">
        Predicted vs realized weekly tail loss (historical P&amp;L pending).
      </p>
      <svg
        viewBox="0 0 320 120"
        className="cvar-backtest-svg"
        role="img"
        aria-label="Bar chart comparing predicted and realized CVaR over eight weeks"
      >
        <title>Predicted vs realized CVaR backtest</title>
        {labels.map((label, i) => {
          const x = 20 + i * 36;
          const predH = (predicted[i] / max) * 70;
          const realH = (realized[i] / max) * 70;
          return (
            <g key={label}>
              <rect
                x={x}
                y={95 - predH}
                width={12}
                height={predH}
                fill="#3b82f6"
                opacity={0.7}
              />
              <rect
                x={x + 14}
                y={95 - realH}
                width={12}
                height={realH}
                fill="#f59e0b"
                opacity={0.85}
              />
              <text x={x + 8} y={110} textAnchor="middle" className="cvar-backtest-label">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="cvar-backtest-legend">
        <span>
          <span className="legend-dot" style={{ background: "#3b82f6" }} /> Predicted
        </span>
        <span>
          <span className="legend-dot" style={{ background: "#f59e0b" }} /> Realized
        </span>
      </div>
    </section>
  );
}
