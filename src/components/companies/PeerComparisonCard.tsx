import type { Company } from "@/types/domain";
import { getPeerComparison } from "@/lib/mock/peer-stats";

type PeerComparisonCardProps = {
  company: Company;
};

function formatUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n}`;
}

export function PeerComparisonCard({ company }: PeerComparisonCardProps) {
  const peer = getPeerComparison(company.tier, company.score, company.cvarUsd);
  const deltaLabel =
    peer.scoreDelta >= 0 ? `+${peer.scoreDelta} vs median` : `${peer.scoreDelta} vs median`;

  return (
    <section className="workbench-card" style={{ marginBottom: 24 }}>
      <div className="card-title">Peer comparison</div>
      <p style={{ fontSize: 11, color: "#737373", marginBottom: 16 }}>
        {peer.sectorLabel} · {peer.peerCount} peers tracked
      </p>
      <div className="peer-compare-grid">
        <div className="peer-compare-stat">
          <span className="hero-stat-label">Your score</span>
          <span className="metric-display-medium" style={{ marginTop: 6 }}>
            {company.score}
          </span>
          <span
            className={`trend-indicator ${peer.scoreDelta >= 0 ? "bad" : "good"}`}
            style={{ fontSize: 10, marginTop: 4 }}
          >
            {deltaLabel}
          </span>
        </div>
        <div className="peer-compare-stat">
          <span className="hero-stat-label">Sector median</span>
          <span className="metric-display-medium" style={{ marginTop: 6, color: "#737373" }}>
            {peer.medianScore}
          </span>
        </div>
        <div className="peer-compare-stat">
          <span className="hero-stat-label">Percentile</span>
          <span className="metric-display-medium elevated-accent" style={{ marginTop: 6 }}>
            P{peer.scorePercentile}
          </span>
        </div>
        <div className="peer-compare-stat">
          <span className="hero-stat-label">Median CVaR</span>
          <span className="metric-display-medium" style={{ marginTop: 6, fontSize: 20 }}>
            {formatUsd(peer.medianCvarUsd)}
          </span>
        </div>
      </div>
    </section>
  );
}
