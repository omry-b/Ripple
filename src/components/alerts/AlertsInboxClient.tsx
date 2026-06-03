"use client";

import type { Alert } from "@/types/domain";
import { AlertsOverviewPanel } from "./AlertsOverviewPanel";

type AlertsInboxClientProps = {
  initialAlerts: Alert[];
  totalOpenCount: number;
};

export function AlertsInboxClient({ initialAlerts, totalOpenCount }: AlertsInboxClientProps) {
  return (
    <AlertsOverviewPanel
      initialAlerts={initialAlerts}
      totalOpenCount={totalOpenCount}
      defaultViewLimit={24}
      viewLimits={[12, 24, 48, 100]}
      showViewAllLink={false}
      showLevelFilter
      showExport
    />
  );
}
