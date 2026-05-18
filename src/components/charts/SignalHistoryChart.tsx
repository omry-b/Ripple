"use client";

import type { RiskLevel } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";

type SignalHistoryChartProps = {
  values: number[];
  level: RiskLevel;
  height?: number;
};

const DAY_LABELS = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Now"];

export function SignalHistoryChart({ values, level, height = 80 }: SignalHistoryChartProps) {
  const max = Math.max(...values, 1);
  const color = LEVEL_COLOR[level];

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 20 - (v / max) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="signal-history-chart">
      <span className="section-label" style={{ marginTop: 0, marginBottom: 8 }}>
        7-day trend
      </span>
      <svg width="100%" height={height} viewBox="0 0 100 22" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {values.map((v, i) => {
          const x = (i / (values.length - 1)) * 100;
          const y = 20 - (v / max) * 18;
          return <circle key={i} cx={x} cy={y} r="1.2" fill={color} />;
        })}
      </svg>
      <div className="signal-history-labels">
        {DAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
