import type { ScoreFactor } from "@/types/domain";

type ScoreBreakdownChartProps = {
  factors: ScoreFactor[];
  totalScore: number;
};

export function ScoreBreakdownChart({ factors, totalScore }: ScoreBreakdownChartProps) {
  const maxContribution = Math.max(...factors.map((f) => f.contribution), 1);

  return (
    <section className="workbench-card" style={{ marginBottom: 24 }}>
      <div className="card-title">Risk score breakdown</div>
      <p style={{ fontSize: 11, color: "#737373", marginBottom: 16 }}>
        Composite score {totalScore} — weighted factor contributions
      </p>
      <div className="score-breakdown-list">
        {factors.map((factor) => (
          <div key={factor.key} className="score-breakdown-row">
            <div className="score-breakdown-labels">
              <span className="score-breakdown-name">{factor.label}</span>
              <span className="score-breakdown-meta">
                {factor.weight}% weight · +{factor.contribution} pts
              </span>
            </div>
            <div className="score-breakdown-bar-bg">
              <div
                className="score-breakdown-bar-fill"
                style={{ width: `${(factor.contribution / maxContribution) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
