import type { ScoreAttribution } from "@/lib/risk/attribution";

type ScoreAttributionCardProps = {
  attribution: ScoreAttribution;
};

export function ScoreAttributionCard({ attribution }: ScoreAttributionCardProps) {
  const sign = attribution.direction === "up" ? "+" : "−";
  return (
    <section className="workbench-card score-attribution-card">
      <h3 className="supplier-tier-title">Score change attribution</h3>
      <p className="score-attribution-summary">{attribution.summary}</p>
      <ul className="score-attribution-list">
        {attribution.drivers.map((d) => (
          <li key={d.label}>
            <span>{d.label}</span>
            <span
              className={`score-attribution-pts${
                attribution.direction === "down" ? " score-attribution-pts--down" : ""
              }`}
            >
              {sign}
              {d.points} pts
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
