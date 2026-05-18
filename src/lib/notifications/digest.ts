import type { Alert } from "@/types/domain";
import { dispatchNotification } from "@/lib/notifications/dispatcher";

export type DigestFrequency = "daily" | "weekly";

export async function sendWatchlistDigest(params: {
  to: string;
  frequency: DigestFrequency;
  alerts: Alert[];
  companyCount: number;
}): Promise<{ sent: boolean; message: string }> {
  const title = `Ripple ${params.frequency} digest`;
  const body = [
    `${params.alerts.length} active alerts across ${params.companyCount} watched companies.`,
    ...params.alerts.slice(0, 5).map((a) => `• [${a.level}] ${a.title}`),
  ].join("\n");

  return dispatchNotification({
    channel: "email",
    title,
    body,
    metadata: { to: params.to, frequency: params.frequency },
  });
}
