"use client";

import { useMemo } from "react";
import type { Alert } from "@/types/domain";
import { isOpenAlert } from "@/lib/alerts/sort";

type RiskSpectrumBarProps = {
  alerts: Alert[];
  totalOpen?: number;
};

export function RiskSpectrumBar({ alerts, totalOpen }: RiskSpectrumBarProps) {
  const counts = useMemo(() => {
    const open = alerts.filter(isOpenAlert);
    return {
      critical: open.filter((a) => a.level === "critical").length,
      elevated: open.filter((a) => a.level === "elevated").length,
      normal: open.filter((a) => a.level === "normal").length,
      total: totalOpen ?? open.length,
    };
  }, [alerts, totalOpen]);

  const sum = counts.critical + counts.elevated + counts.normal || 1;

  return (
    <div className="risk-spectrum surface-panel surface-panel--inset" aria-label="Open alert severity mix">
      <p className="page-lead page-lead--tight">
        Severity mix across <strong>{counts.total}</strong> open alerts
      </p>
      <div className="risk-spectrum-bar" role="img" aria-hidden>
        <div
          className="risk-spectrum-segment risk-spectrum-segment--critical"
          style={{ flexGrow: counts.critical }}
          title={`${counts.critical} critical`}
        />
        <div
          className="risk-spectrum-segment risk-spectrum-segment--elevated"
          style={{ flexGrow: counts.elevated }}
          title={`${counts.elevated} elevated`}
        />
        <div
          className="risk-spectrum-segment risk-spectrum-segment--normal"
          style={{ flexGrow: counts.normal }}
          title={`${counts.normal} normal`}
        />
      </div>
      <dl className="risk-spectrum-legend">
        <div>
          <dt>
            <span className="risk-spectrum-dot risk-spectrum-dot--critical" />
            Critical
          </dt>
          <dd>
            {counts.critical} ({Math.round((counts.critical / sum) * 100)}%)
          </dd>
        </div>
        <div>
          <dt>
            <span className="risk-spectrum-dot risk-spectrum-dot--elevated" />
            Elevated
          </dt>
          <dd>
            {counts.elevated} ({Math.round((counts.elevated / sum) * 100)}%)
          </dd>
        </div>
        <div>
          <dt>
            <span className="risk-spectrum-dot risk-spectrum-dot--normal" />
            Normal
          </dt>
          <dd>
            {counts.normal} ({Math.round((counts.normal / sum) * 100)}%)
          </dd>
        </div>
      </dl>
    </div>
  );
}
