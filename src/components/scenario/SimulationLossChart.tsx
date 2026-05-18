type SimulationLossChartProps = {
  bins: number[];
};

export function SimulationLossChart({ bins }: SimulationLossChartProps) {
  const max = Math.max(...bins, 1);
  return (
    <section className="workbench-card" aria-label="Monte Carlo loss distribution">
      <h3 className="supplier-tier-title">Loss distribution (12 bins)</h3>
      <svg viewBox="0 0 360 100" className="cvar-backtest-svg" role="img">
        <title>Simulated loss histogram</title>
        {bins.map((v, i) => {
          const h = (v / max) * 80;
          const x = 12 + i * 28;
          return (
            <rect key={i} x={x} y={90 - h} width={20} height={h} fill="#3b82f6" opacity={0.75} />
          );
        })}
      </svg>
    </section>
  );
}
