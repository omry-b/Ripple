"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Alert, RiskLevel } from "@/types/domain";
import { exportAlertsCsv } from "@/lib/export/entities";
import { acknowledgeAlertApi, fetchAlerts, resolveAlertApi } from "@/lib/client/api";
import { dedupeAlerts, isOpenAlert, sortAlertsByPriority } from "@/lib/alerts/sort";
import { AlertDetailModal } from "./AlertDetailModal";
import { EmptyState } from "@/components/ui/EmptyState";

const DEFAULT_VIEW_LIMITS = [6, 12, 24] as const;

type AlertsOverviewPanelProps = {
  initialAlerts: Alert[];
  totalOpenCount?: number;
  defaultViewLimit?: number;
  viewLimits?: readonly number[];
  showViewAllLink?: boolean;
  showLevelFilter?: boolean;
  showExport?: boolean;
};

type LevelFilter = "all" | RiskLevel;

export function AlertsOverviewPanel({
  initialAlerts,
  totalOpenCount,
  defaultViewLimit = 6,
  viewLimits = DEFAULT_VIEW_LIMITS,
  showViewAllLink = true,
  showLevelFilter = false,
  showExport = false,
}: AlertsOverviewPanelProps) {
  const [alerts, setAlerts] = useState(() => dedupeAlerts(initialAlerts));
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [viewLimit, setViewLimit] = useState(defaultViewLimit);
  const [selected, setSelected] = useState<Alert | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setAlerts(dedupeAlerts(initialAlerts));
  }, [initialAlerts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { alerts: fresh } = await fetchAlerts();
        if (!cancelled) {
          setAlerts(dedupeAlerts(fresh));
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not refresh alerts");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openAlerts = useMemo(() => {
    let list = sortAlertsByPriority(alerts.filter(isOpenAlert));
    if (levelFilter !== "all") {
      list = list.filter((a) => a.level === levelFilter);
    }
    return list;
  }, [alerts, levelFilter]);

  const openTotal = totalOpenCount ?? openAlerts.length;
  const maxLimit = viewLimits[viewLimits.length - 1] ?? 24;

  const visibleAlerts = useMemo(
    () => openAlerts.slice(0, viewLimit),
    [openAlerts, viewLimit]
  );

  const handleAcknowledge = useCallback(async (id: string) => {
    setAcknowledging(true);
    setActionError(null);
    try {
      const { alert } = await acknowledgeAlertApi(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? alert : a)));
      setSelected(alert);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not acknowledge alert");
    } finally {
      setAcknowledging(false);
    }
  }, []);

  const handleResolve = useCallback(async (id: string) => {
    setResolving(true);
    setActionError(null);
    try {
      const { alert } = await resolveAlertApi(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? alert : a)));
      setSelected(alert);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not resolve alert");
    } finally {
      setResolving(false);
    }
  }, []);

  return (
    <>
      {actionError ? (
        <p className="alerts-action-error" role="alert">
          {actionError}
        </p>
      ) : null}
      {loadError ? (
        <p className="alerts-action-error alerts-action-error--muted" role="status">
          {loadError}
        </p>
      ) : null}

      <section className="alerts-overview-panel" aria-label="Active alerts">
        <div className="alerts-overview-toolbar">
          <p className="alerts-overview-summary">
            Showing <strong>{visibleAlerts.length}</strong> of{" "}
            <strong>{levelFilter === "all" ? openTotal : openAlerts.length}</strong> open alerts
            {levelFilter !== "all" ? ` (${levelFilter})` : ""}
          </p>
          <div className="alerts-toolbar-right">
            {showLevelFilter ? (
              <div className="alerts-view-toggle" role="tablist" aria-label="Alert level">
                {(["all", "critical", "elevated", "normal"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    role="tab"
                    aria-selected={levelFilter === lvl}
                    className={`alerts-view-btn${levelFilter === lvl ? " active" : ""}`}
                    onClick={() => setLevelFilter(lvl)}
                  >
                    {lvl === "all" ? "All" : lvl}
                  </button>
                ))}
              </div>
            ) : null}
            {showExport ? (
              <button
                type="button"
                className="filter-export-btn alerts-export-btn"
                onClick={() => exportAlertsCsv(openAlerts)}
                disabled={openAlerts.length === 0}
              >
                Export CSV
              </button>
            ) : null}
            <div className="alerts-view-toggle" role="tablist" aria-label="Alerts per view">
              {viewLimits.map((limit) => (
                <button
                  key={limit}
                  type="button"
                  role="tab"
                  aria-selected={viewLimit === limit}
                  className={`alerts-view-btn${viewLimit === limit ? " active" : ""}`}
                  onClick={() => setViewLimit(limit)}
                >
                  {limit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {openAlerts.length === 0 ? (
          <EmptyState
            title="No open alerts"
            description="Ingest and snapshot refresh populate alerts when risk thresholds are crossed."
          />
        ) : (
          <ul className="alerts-overview-list">
            {visibleAlerts.map((alert) => (
              <li key={alert.id}>
                <button
                  type="button"
                  className={`alert-overview-row alert-overview-row--${alert.level}${
                    alert.critical ? " alert-overview-row--flagged" : ""
                  }`}
                  onClick={() => setSelected(alert)}
                  aria-label={`Open alert: ${alert.title}`}
                >
                  <div className="alert-overview-main">
                    <span className="alert-overview-level">{alert.statusLabel}</span>
                    <h3 className="alert-overview-title">{alert.title}</h3>
                    <p className="alert-overview-detail">{alert.detail}</p>
                  </div>
                  <div className="alert-overview-side">
                    <span className="alert-overview-meta">{alert.meta}</span>
                    <span className="alert-overview-cta">Details →</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {openTotal > viewLimit ? (
          <p className="alerts-overview-footer">
            {openTotal - viewLimit} more open alerts not shown.{" "}
            {viewLimit < maxLimit ? (
              <>
                <button
                  type="button"
                  className="alerts-footer-link"
                  onClick={() => setViewLimit(maxLimit)}
                >
                  Show {maxLimit}
                </button>
                {" · "}
              </>
            ) : null}
            {showViewAllLink ? (
              <Link href="/alerts" className="alerts-footer-link">
                View all alerts
              </Link>
            ) : (
              <Link href="/companies" className="alerts-footer-link">
                Browse companies
              </Link>
            )}
          </p>
        ) : null}
      </section>

      {selected ? (
        <AlertDetailModal
          alert={selected}
          onClose={() => setSelected(null)}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          acknowledging={acknowledging}
          resolving={resolving}
        />
      ) : null}
    </>
  );
}
