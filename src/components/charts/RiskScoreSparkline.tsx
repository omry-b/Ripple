"use client";

type RiskScoreSparklineProps = {
  values: number[];
  height?: number;
  accent?: string;
};

export function RiskScoreSparkline({
  values,
  height = 64,
  accent = "#3B82F6",
}: RiskScoreSparklineProps) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 22 - ((v - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="risk-sparkline-wrap">
      <svg width="100%" height={height} viewBox="0 0 100 24" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="risk-sparkline-labels">
        <span>30d ago</span>
        <span>Today · {values[values.length - 1]}</span>
      </div>
    </div>
  );
}
