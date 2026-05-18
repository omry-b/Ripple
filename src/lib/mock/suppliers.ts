import type { GeoRegion, SupplierLink } from "@/types/domain";
import { regionForCompanyId } from "@/lib/mock/regions";

const SUPPLIER_POOL: Omit<SupplierLink, "relationship">[] = [
  { id: "tsmc", name: "TSMC", tier: "Tier 2", region: "APAC", score: 74 },
  { id: "foxconn", name: "Foxconn", tier: "Tier 1", region: "APAC", score: 68 },
  { id: "samsung", name: "Samsung", tier: "Tier 2", region: "APAC", score: 58 },
  { id: "qualcomm", name: "Qualcomm", tier: "Tier 2", region: "APAC", score: 52 },
  { id: "nvidia", name: "NVIDIA", tier: "Tier 1", region: "APAC", score: 49 },
  { id: "amd", name: "AMD", tier: "Tier 2", region: "AMER", score: 44 },
  { id: "apple", name: "Apple Inc.", tier: "Tier 1", region: "APAC", score: 81 },
];

function link(
  base: Omit<SupplierLink, "relationship">,
  relationship: string
): SupplierLink {
  return { ...base, relationship };
}

export function getSuppliersForCompany(companyId: string): SupplierLink[] {
  const region = regionForCompanyId(companyId) as GeoRegion;
  const peers = SUPPLIER_POOL.filter((s) => s.id !== companyId);

  const upstream = peers
    .filter((s) => s.tier === "Tier 2")
    .slice(0, 3)
    .map((s) => link(s, "Upstream component / fab"));

  const downstream = peers
    .filter((s) => s.tier === "Tier 1" && s.id !== companyId)
    .slice(0, 2)
    .map((s) => link(s, "Downstream OEM exposure"));

  const regional = Array.from({ length: 3 }, (_, i) => {
    const n = i + 1;
    return link(
      {
        id: `supplier-${companyId}-${n}`,
        name: `${region} Logistics Hub ${n}`,
        tier: n === 1 ? "Tier 1" : "Tier 2",
        region,
        score: 35 + n * 8,
      },
      n === 1 ? "Primary logistics corridor" : "Secondary routing node"
    );
  });

  return [...upstream, ...downstream, ...regional].slice(0, 8);
}
