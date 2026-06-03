"use client";

import type { Alert } from "@/types/domain";
import { AlertsOverviewPanel } from "./AlertsOverviewPanel";

type AlertsSectionClientProps = {
  initialAlerts: Alert[];
  totalOpenCount: number;
};

/** Overview active alerts — compact list with 6/12/24 view limits. */
export function AlertsSectionClient({
  initialAlerts,
  totalOpenCount,
}: AlertsSectionClientProps) {
  return (
    <AlertsOverviewPanel
      initialAlerts={initialAlerts}
      totalOpenCount={totalOpenCount}
      showViewAllLink
    />
  );
}
