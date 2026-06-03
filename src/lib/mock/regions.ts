import type { GeoRegion } from "@/types/domain";

const APAC_IDS = new Set([
  "apple", "tsmc", "foxconn", "samsung", "qualcomm", "nvidia",
  "sk-hynix", "murata", "tdk", "sony-semi", "pegatron", "wistron", "flex", "nidec", "denso",
]);

const AMER_IDS = new Set([
  "amd", "micron", "texas-instruments", "analog-devices", "broadcom",
  "western-digital", "jabil", "magna",
]);

const EMEA_IDS = new Set([
  "infineon", "stmicro", "nxp", "bosch", "continental",
  "maersk", "kuehne-nagel", "db-schenker", "dhl-supply",
]);

export function regionForCompanyId(id: string): GeoRegion {
  if (APAC_IDS.has(id)) return "APAC";
  if (AMER_IDS.has(id)) return "AMER";
  if (EMEA_IDS.has(id)) return "EMEA";
  // Legacy procedural ids and any unknowns: stable hash-based assignment.
  if (id.startsWith("supplier-")) {
    const n = Number.parseInt(id.replace("supplier-", ""), 10) || 0;
    return (["APAC", "EMEA", "AMER"] as const)[n % 3];
  }
  const hash = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  return (["APAC", "EMEA", "AMER"] as const)[hash % 3];
}
