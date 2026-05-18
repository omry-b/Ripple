"use client";

import type { SignalStream } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";
import { SignalHistoryChart } from "@/components/charts/SignalHistoryChart";

type SignalComparePanelProps = {
  signals: [SignalStream, SignalStream];
  onClear: () => void;
};

function sparklineToPoints(sparkline: string): string {
  const coords = sparkline.split(" ").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return { x, y };
  });
  const yMax = Math.max(...coords.map((c) => c.y), 1);
  return coords
    .map((c) => {
      const nx = c.x;
      const ny = 20 - (c.y / yMax) * 18;
      return `${nx},${ny}`;
    })
    .join(" ");
}

export function SignalComparePanel({ signals, onClear }: SignalComparePanelProps) {
  const [a, b] = signals;

  return (
    <section className="workbench-card signal-compare-panel">
      <div className="signal-compare-header">
        <span className="section-label" style={{ margin: 0 }}>
          Comparing 2 signals
        </span>
        <button type="button" className="reset-workbench-btn" onClick={onClear}>
          Clear comparison ×
        </button>
      </div>

      <div className="signal-compare-overlay-chart">
        <svg width="100%" height="72" viewBox="0 0 100 22" preserveAspectRatio="none">
          <polyline
            points={sparklineToPoints(a.sparkline)}
            fill="none"
            stroke={LEVEL_COLOR[a.level]}
            strokeWidth="1.5"
            opacity={0.9}
          />
          <polyline
            points={sparklineToPoints(b.sparkline)}
            fill="none"
            stroke={LEVEL_COLOR[b.level]}
            strokeWidth="1.5"
            strokeDasharray="3 2"
            opacity={0.9}
          />
        </svg>
        <div className="signal-compare-legend-row">
          <span style={{ color: LEVEL_COLOR[a.level] }}>{a.name} ({a.score})</span>
          <span style={{ color: LEVEL_COLOR[b.level] }}>{b.name} ({b.score})</span>
        </div>
      </div>

      <div className="signal-compare-columns">
        {signals.map((signal) => (
          <div key={signal.id} className="signal-compare-col">
            <h3 className="signal-compare-name">{signal.name}</h3>
            <p className="signal-compare-meta">
              {signal.category} · {signal.level.toUpperCase()} · {signal.score}/100
            </p>
            {signal.history7d?.length > 0 && (
              <SignalHistoryChart values={signal.history7d} level={signal.level} height={64} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
