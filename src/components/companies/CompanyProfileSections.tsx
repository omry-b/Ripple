import Link from "next/link";
import type { Alert, Company, SignalStream } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";

type CompanyProfileSectionsProps = {
  company: Company;
  alerts: Alert[];
  signals: SignalStream[];
};

export function CompanyProfileSections({
  company,
  alerts,
  signals,
}: CompanyProfileSectionsProps) {
  return (
    <>
      <span className="section-label">Active alerts affecting {company.name}</span>
      {alerts.length === 0 ? (
        <p className="empty-state">No open alerts directly tied to this company.</p>
      ) : (
        <ul className="profile-link-list">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <Link href={`/companies?alert=${alert.id}`} className="profile-link-row">
                <span
                  className={`alert-status ${alert.level === "critical" ? "critical-text" : "elevated-text"}`}
                  style={{ marginBottom: 0 }}
                >
                  {alert.statusLabel}
                </span>
                <span className="profile-link-title">{alert.title}</span>
                <span className="profile-link-meta">{alert.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <span className="section-label">Signal streams</span>
      {signals.length === 0 ? (
        <p className="empty-state">No active signal streams for this company.</p>
      ) : (
        <ul className="profile-link-list">
          {signals.map((signal) => (
            <li key={signal.id}>
              <Link href="/signals" className="profile-link-row">
                <span className="profile-link-title">{signal.name}</span>
                <span
                  className="profile-link-meta"
                  style={{ color: LEVEL_COLOR[signal.level] }}
                >
                  {signal.score}/100 · {signal.level.toUpperCase()} · {signal.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
