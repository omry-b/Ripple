"use client";

import { useCallback, useState } from "react";
import type { Alert } from "@/types/domain";
import { acknowledgeAlertApi } from "@/lib/client/api";
import { AlertCard } from "./AlertCard";
import { AlertDetailModal } from "./AlertDetailModal";

type AlertsSectionClientProps = {
  initialAlerts: Alert[];
};

export function AlertsSectionClient({ initialAlerts }: AlertsSectionClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selected, setSelected] = useState<Alert | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

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

  return (
    <>
      <section className="atmosphere-section reveal">
        <div className="atmosphere-blob-1" />
        <div className="atmosphere-blob-2" />
        <div className="glass-grid">
          {alerts.map((alert) => {
            const inner = <AlertCard alert={alert} />;
            const clickable = (
              <button
                type="button"
                className="alert-card-trigger"
                onClick={() => setSelected(alert)}
                aria-label={`Open details for ${alert.title}`}
              >
                {inner}
              </button>
            );

            return alert.critical ? (
              <div key={alert.id} className="grad-border-wrapper">
                <div className="grad-border-inner glass-card">{clickable}</div>
              </div>
            ) : (
              <div key={alert.id} className="glass-card">
                {clickable}
              </div>
            );
          })}
        </div>
      </section>

      {selected && (
        <AlertDetailModal
          alert={selected}
          onClose={() => setSelected(null)}
          onAcknowledge={handleAcknowledge}
          acknowledging={acknowledging}
        />
      )}
    </>
  );
}
