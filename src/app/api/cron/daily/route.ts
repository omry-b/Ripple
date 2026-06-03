import { refreshSnapshot } from "@/lib/api";
import { sendWatchlistDigest } from "@/lib/notifications/digest";
import { getAlerts } from "@/lib/api";
import { drainScenarioJobQueue } from "@/lib/scenario/worker";
import { authorizeServiceRequest } from "@/lib/auth/service-secret";
import { pruneDuplicateOpenAlerts } from "@/lib/alerts/prune-duplicates";
import { warmStoriesForTopCompanies } from "@/lib/news/warm-stories";

/** Combined daily cron Hobby-safe (single cron slot). Runs snapshot, digest, scenario drain. */
export async function GET(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const asOf = new Date().toISOString();
  const results: Record<string, unknown> = { asOf };

  try {
    results.snapshot = await refreshSnapshot();
  } catch (e) {
    results.snapshotError = e instanceof Error ? e.message : "Snapshot refresh failed";
  }

  try {
    const alerts = await getAlerts();
    const open = alerts.filter((a) => a.status === "open");
    results.digest = await sendWatchlistDigest({
      to: process.env.DIGEST_EMAIL_TO ?? "analyst@ripple.demo",
      frequency: "daily",
      alerts: open,
      companyCount: 12,
    });
  } catch (e) {
    results.digestError = e instanceof Error ? e.message : "Digest failed";
  }

  try {
    results.scenarioWorker = await drainScenarioJobQueue(10);
  } catch (e) {
    results.scenarioWorkerError = e instanceof Error ? e.message : "Scenario worker failed";
  }

  try {
    results.duplicatesPruned = await pruneDuplicateOpenAlerts();
  } catch (e) {
    results.pruneError = e instanceof Error ? e.message : "Prune failed";
  }

  try {
    results.storiesWarm = await warmStoriesForTopCompanies(12);
  } catch (e) {
    results.storiesWarmError = e instanceof Error ? e.message : "Stories warm failed";
  }

  return Response.json(results);
}
