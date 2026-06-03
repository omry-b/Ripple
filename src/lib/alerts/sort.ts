import type { Alert } from "@/types/domain";

export function alertPriority(alert: Alert): number {
  if (alert.critical) return 0;
  if (alert.level === "critical") return 1;
  if (alert.level === "elevated") return 2;
  return 3;
}

export function sortAlertsByPriority(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => {
    const p = alertPriority(a) - alertPriority(b);
    if (p !== 0) return p;
    return a.title.localeCompare(b.title);
  });
}

export function dedupeAlerts(alerts: Alert[]): Alert[] {
  const seen = new Set<string>();
  const out: Alert[] = [];
  for (const alert of alerts) {
    if (seen.has(alert.id)) continue;
    seen.add(alert.id);
    out.push(alert);
  }
  return out;
}

export function isOpenAlert(alert: Alert): boolean {
  if (alert.status === "open") return true;
  if (alert.status === "acknowledged" || alert.status === "resolved") return false;
  return /open/i.test(alert.statusLabel);
}
