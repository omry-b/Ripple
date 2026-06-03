import type { Alert, DashboardPayload } from "@/types/domain";
import { dedupeAlerts, isOpenAlert, sortAlertsByPriority } from "@/lib/alerts/sort";

/** Max open alerts shipped in dashboard JSON (UI fetches full list on /alerts). */
export const DASHBOARD_ALERT_CAP = 80;

export function capOpenAlerts(alerts: Alert[]): Alert[] {
  const open = dedupeAlerts(alerts).filter(isOpenAlert);
  return sortAlertsByPriority(open).slice(0, DASHBOARD_ALERT_CAP);
}

export function prepareDashboardForUi(payload: DashboardPayload): DashboardPayload {
  return {
    ...payload,
    alerts: capOpenAlerts(payload.alerts),
  };
}
