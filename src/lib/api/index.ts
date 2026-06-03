import { cache } from "react";
import { getDataSource } from "@/lib/data";
import { getCachedSnapshot } from "@/lib/cache/snapshot-cache";
import type {
  Alert,
  Company,
  DashboardPayload,
  DashboardSnapshot,
  Scenario,
  ScenarioRunOptions,
  ScoreFactor,
  SignalStream,
  SimulationRun,
  TickerItem,
} from "@/types/domain";

async function ds() {
  return getDataSource();
}

export const getDashboard = cache(async (): Promise<DashboardPayload> => {
  return (await ds()).getDashboard();
});

export async function getSnapshot(): Promise<DashboardSnapshot> {
  const data = await ds();
  return getCachedSnapshot(() => data.getSnapshot());
}

export async function refreshSnapshot(): Promise<DashboardSnapshot> {
  return (await ds()).refreshSnapshot();
}

export async function getTicker(): Promise<TickerItem[]> {
  return (await ds()).getTicker();
}

export async function getSignals(): Promise<SignalStream[]> {
  return (await ds()).getSignals();
}

export async function getCompanies(): Promise<Company[]> {
  return (await ds()).getCompanies();
}

export async function getCompany(id: string): Promise<Company | null> {
  return (await ds()).getCompany(id);
}

export async function getAlerts(): Promise<Alert[]> {
  return (await ds()).getAlerts();
}

export async function getAlert(id: string): Promise<Alert | null> {
  return (await ds()).getAlert(id);
}

export async function getScenarios(): Promise<Scenario[]> {
  return (await ds()).getScenarios();
}

export async function getScenario(id: string): Promise<Scenario | null> {
  return (await ds()).getScenario(id);
}

export async function runScenario(
  id: string,
  options?: ScenarioRunOptions
): Promise<SimulationRun | null> {
  return (await ds()).runScenario(id, options);
}

export async function getSimulationRuns(): Promise<SimulationRun[]> {
  return (await ds()).getSimulationRuns();
}

export async function getAlertsForCompany(companyId: string): Promise<Alert[]> {
  return (await ds()).getAlertsForCompany(companyId);
}

export async function getSignalsForCompany(companyId: string): Promise<SignalStream[]> {
  return (await ds()).getSignalsForCompany(companyId);
}

export async function getSearchIndex() {
  return (await ds()).getSearchIndex();
}

export async function acknowledgeAlert(id: string): Promise<Alert | null> {
  return (await ds()).acknowledgeAlert(id);
}

export async function resolveAlert(id: string): Promise<Alert | null> {
  return (await ds()).resolveAlert(id);
}

export async function getScoreFactors(companyId: string): Promise<ScoreFactor[]> {
  return (await ds()).getScoreFactors(companyId);
}

export async function getSuppliersForCompany(companyId: string) {
  const { getSuppliersForCompany: getSuppliers } = await import("@/lib/mock/suppliers");
  return getSuppliers(companyId);
}

export async function getScoreAttribution(companyId: string, delta7d: string) {
  const { getScoreAttribution: getAttr } = await import("@/lib/mock/score-attribution");
  return getAttr(companyId, delta7d);
}

export { getDataSourceMode } from "@/lib/data";
