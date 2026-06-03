const ORG_IDS = ["org_demo", "org_acme", "org_globex"] as const;

/**
 * The demo org is the "full universe" tenant — it sees every entity, so the
 * default experience shows the recognizable companies (Apple, TSMC, NVIDIA…)
 * rather than a hash-filtered subset. Real tenant orgs remain scoped.
 */
const SEE_ALL_ORG = "org_demo";

export type KnownOrgId = (typeof ORG_IDS)[number];

export function isScopedOrg(organizationId: string): organizationId is KnownOrgId {
  return (ORG_IDS as readonly string[]).includes(organizationId);
}

export function entityOrgId(entityId: string): string {
  let hash = 0;
  for (let i = 0; i < entityId.length; i += 1) {
    hash = (hash + entityId.charCodeAt(i)) | 0;
  }
  return ORG_IDS[Math.abs(hash) % ORG_IDS.length];
}

export function belongsToOrg(entityId: string, organizationId: string): boolean {
  if (!isScopedOrg(organizationId) || organizationId === SEE_ALL_ORG) return true;
  return entityOrgId(entityId) === organizationId;
}

export function filterIdsForOrg<T extends { id: string }>(
  items: T[],
  organizationId: string
): T[] {
  if (!isScopedOrg(organizationId) || organizationId === SEE_ALL_ORG) return items;
  return items.filter((item) => belongsToOrg(item.id, organizationId));
}
