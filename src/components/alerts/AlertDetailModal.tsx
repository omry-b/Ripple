"use client";

import Link from "next/link";
import type { Alert } from "@/types/domain";

type AlertDetailModalProps = {
  alert: Alert;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  acknowledging?: boolean;
};

function formatTimelineAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AlertDetailModal({
  alert,
  onClose,
  onAcknowledge,
  acknowledging,
}: AlertDetailModalProps) {
  const isAck = alert.status === "acknowledged";

  return (
    <>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close alert detail"
        onClick={onClose}
      />
      <div className="modal-panel" role="dialog" aria-labelledby="alert-modal-title">
        <div className="modal-header">
          <div>
            <span
              className={`alert-status ${alert.level === "critical" ? "critical-text" : "elevated-text"}`}
            >
              {alert.statusLabel}
            </span>
            <h2 id="alert-modal-title" className="modal-title">
              {alert.title}
            </h2>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="drawer-description">{alert.detail}</p>
        <p className="alert-meta" style={{ marginBottom: 16 }}>
          {alert.meta}
        </p>

        <span className="section-label">Timeline</span>
        <ul className="alert-timeline">
          {alert.timeline.map((entry, i) => (
            <li key={`${entry.at}-${i}`}>
              <time dateTime={entry.at}>{formatTimelineAt(entry.at)}</time>
              <span>{entry.event}</span>
            </li>
          ))}
        </ul>

        <div className="modal-actions">
          {!isAck && (
            <button
              type="button"
              className="alert-action-btn"
              disabled={acknowledging}
              onClick={() => onAcknowledge(alert.id)}
            >
              {acknowledging ? "Acknowledging…" : "Acknowledge alert"}
            </button>
          )}
          <Link
            href={`/companies?alert=${alert.id}`}
            className={`alert-action-btn${alert.level === "elevated" ? " elevated-btn" : ""}`}
            style={{ textDecoration: "none" }}
          >
            View exposure →
          </Link>
        </div>
      </div>
    </>
  );
}
