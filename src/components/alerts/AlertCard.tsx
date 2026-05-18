import Link from "next/link";
import type { Alert } from "@/types/domain";

type AlertCardProps = {
  alert: Alert;
};

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <>
      <div>
        <span
          className={`alert-status ${alert.level === "critical" ? "critical-text" : "elevated-text"}`}
        >
          {alert.statusLabel}
        </span>
        <div className="alert-event">{alert.title}</div>
        <p className="alert-detail">{alert.detail}</p>
      </div>
      <div>
        <div className="alert-meta">{alert.meta}</div>
        <Link
          href={`/companies?alert=${alert.id}`}
          className={`alert-action-btn${alert.level === "elevated" ? " elevated-btn" : ""}`}
          style={{ display: "inline-block", textDecoration: "none" }}
          aria-label={`View asset exposure for ${alert.title}`}
        >
          View Exposure →
        </Link>
      </div>
    </>
  );
}
