"use client";

import { useCallback, useEffect, useState } from "react";
import type { Alert } from "@/types/domain";
import { acknowledgeAlertApi, resolveAlertApi } from "@/lib/client/api";
import { AlertCard } from "./AlertCard";
import { AlertCardShell, type AlertCardVariant } from "./AlertCardShell";
import { AlertDetailModal } from "./AlertDetailModal";

type AlertsSectionClientProps = {
  initialAlerts: Alert[];
};

export function AlertsSectionClient({ initialAlerts }: AlertsSectionClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selected, setSelected] = useState<Alert | null>(null);

  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);
  const [acknowledging, setAcknowledging] = useState(false);
  const [resolving, setResolving] = useState(false);

  const handleAcknowledge = useCallback(async (id: string) => {
    setAcknowledging(true);
    try {
      const { alert } = await acknowledgeAlertApi(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? alert : a)));
      setSelected(alert);
    } finally {
      setAcknowledging(false);
    }
  }, []);

  const handleResolve = useCallback(async (id: string) => {
    setResolving(true);
    try {
      const { alert } = await resolveAlertApi(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? alert : a)));
      setSelected(alert);
    } finally {
      setResolving(false);
    }
  }, []);

  return (
    <>
      <section className="atmosphere-section reveal">
        <div className="atmosphere-blob-1" />
        <div className="atmosphere-blob-2" />
        <div className="glass-grid">
          {alerts.map((alert) => {
            const variant: AlertCardVariant = alert.critical
              ? "critical"
              : alert.level === "elevated"
                ? "elevated"
                : "default";

            return (
              <AlertCardShell key={alert.id} variant={variant}>
                <button
                  type="button"
                  className="alert-card-trigger"
                  onClick={() => setSelected(alert)}
                  aria-label={`Open details for ${alert.title}`}
                >
                  <AlertCard alert={alert} />
                </button>
              </AlertCardShell>
            );
          })}
        </div>
      </section>

      {selected && (
        <AlertDetailModal
          alert={selected}
          onClose={() => setSelected(null)}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          acknowledging={acknowledging}
          resolving={resolving}
        />
      )}
    </>
  );
}
