import { prepareDashboardForUi } from "@/lib/alerts/payload";
import { getSessionUser } from "@/lib/auth/session";
import { filterIdsForOrg } from "@/lib/org/scope";
import type { Alert, Company, DashboardPayload, DashboardSnapshot } from "@/types/domain";
import {
  getAlerts,
  getCompanies,
  getDashboard,
  getSnapshot,
} from "@/lib/api/index";

export async function getOrgId(request?: Request): Promise<string> {
  const user = await getSessionUser(request);
  return user.organizationId;
}

export async function getScopedCompanies(request?: Request): Promise<Company[]> {
  const orgId = await getOrgId(request);
  return filterIdsForOrg(await getCompanies(), orgId);
}

export async function getScopedAlerts(request?: Request): Promise<Alert[]> {
  const orgId = await getOrgId(request);
  return filterIdsForOrg(await getAlerts(), orgId);
}

export async function getScopedDashboard(request?: Request): Promise<DashboardPayload> {
  const dashboard = await getDashboard();
  const orgId = await getOrgId(request);
  const companies = filterIdsForOrg(dashboard.companies, orgId);
  const alerts = filterIdsForOrg(dashboard.alerts, orgId);
  const exposed = companies.filter((c) => c.scoreLevel === "critical" || c.scoreLevel === "elevated").length;
  return prepareDashboardForUi({
    ...dashboard,
    companies,
    alerts,
    snapshot: { ...dashboard.snapshot, exposedCompanies: exposed },
  });
}

export async function getScopedSnapshot(request?: Request): Promise<DashboardSnapshot> {
  const snapshot = await getSnapshot();
  const companies = await getScopedCompanies(request);
  const exposed = companies.filter((c) => c.scoreLevel === "critical" || c.scoreLevel === "elevated").length;
  return { ...snapshot, exposedCompanies: exposed };
}
