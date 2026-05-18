import type { GeoRegion } from "@/types/domain";

const APAC_IDS = new Set(["apple", "tsmc", "foxconn", "samsung", "qualcomm", "nvidia"]);

export function regionForCompanyId(id: string): GeoRegion {
  if (APAC_IDS.has(id)) return "APAC";
  if (id === "amd") return "AMER";
  if (id.startsWith("supplier-")) {
    const n = Number.parseInt(id.replace("supplier-", ""), 10) || 0;
    return (["APAC", "EMEA", "AMER"] as const)[n % 3];
  }
  return "EMEA";
}
