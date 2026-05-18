import type { ScoreAttribution } from "@/lib/mock/score-attribution";

type ScoreAttributionCardProps = {
  attribution: ScoreAttribution;
};

export function ScoreAttributionCard({ attribution }: ScoreAttributionCardProps) {
  return (
    <section className="workbench-card score-attribution-card">
      <h3 className="supplier-tier-title">Score change attribution</h3>
      <p className="score-attribution-summary">{attribution.summary}</p>
      <ul className="score-attribution-list">
        {attribution.drivers.map((d) => (
          <li key={d.label}>
            <span>{d.label}</span>
            <span className="score-attribution-pts">+{d.points} pts</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
