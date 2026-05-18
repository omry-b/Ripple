const ORG_IDS = ["org_demo", "org_acme", "org_globex"] as const;

export function entityOrgId(entityId: string): string {
  let hash = 0;
  for (let i = 0; i < entityId.length; i += 1) {
    hash = (hash + entityId.charCodeAt(i)) | 0;
  }
  return ORG_IDS[Math.abs(hash) % ORG_IDS.length];
}

export function belongsToOrg(entityId: string, organizationId: string): boolean {
  return entityOrgId(entityId) === organizationId;
}

export function filterIdsForOrg<T extends { id: string }>(
  items: T[],
  organizationId: string
): T[] {
  return items.filter((item) => belongsToOrg(item.id, organizationId));
}
