import type { Alert } from "@/types/domain";
import { AlertsOverviewPanel } from "./AlertsOverviewPanel";

type AlertsSectionProps = {
  alerts: Alert[];
  totalOpenCount?: number;
};

/** Server-friendly alerts block (high-contrast list, not glass grid). */
export function AlertsSection({ alerts, totalOpenCount }: AlertsSectionProps) {
  return (
    <AlertsOverviewPanel
      initialAlerts={alerts}
      totalOpenCount={totalOpenCount}
      showViewAllLink
    />
  );
}
