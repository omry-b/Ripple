import type { Alert } from "@/types/domain";
import { AlertCard } from "./AlertCard";

type AlertsSectionProps = {
  alerts: Alert[];
};

export function AlertsSection({ alerts }: AlertsSectionProps) {
  return (
    <section className="atmosphere-section reveal">
      <div className="atmosphere-blob-1" />
      <div className="atmosphere-blob-2" />
      <div className="glass-grid">
        {alerts.map((alert) =>
          alert.critical ? (
            <div key={alert.id} className="grad-border-wrapper">
              <div className="grad-border-inner glass-card">
                <AlertCard alert={alert} />
              </div>
            </div>
          ) : (
            <div key={alert.id} className="glass-card">
              <AlertCard alert={alert} />
            </div>
          )
        )}
      </div>
    </section>
  );
}
