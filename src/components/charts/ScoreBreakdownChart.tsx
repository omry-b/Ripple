import type { ScoreFactor } from "@/types/domain";

type ScoreBreakdownChartProps = {
  factors: ScoreFactor[];
  totalScore: number;
};

export function ScoreBreakdownChart({ factors, totalScore }: ScoreBreakdownChartProps) {
  const maxContribution = Math.max(...factors.map((f) => f.contribution), 1);

  return (
    <section className="workbench-card workbench-card--spaced">
      <div className="card-title">Risk score breakdown</div>
      <p className="prose-muted-sm">
        Composite score {totalScore}  -  weighted factor contributions
      </p>
      <div className="score-breakdown-list">
        {factors.map((factor) => {
          const pct = (factor.contribution / maxContribution) * 100;
          return (
            <div key={factor.key} className="score-factor-row">
              <div className="score-factor-label">
                <span>{factor.label}</span>
                <span>
                  {factor.weight}% · +{factor.contribution}
                </span>
              </div>
              <div className="score-factor-bar-track">
                <div
                  className="score-factor-bar-fill"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={factor.contribution}
                  aria-valuemin={0}
                  aria-valuemax={maxContribution}
                  aria-label={factor.label}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
