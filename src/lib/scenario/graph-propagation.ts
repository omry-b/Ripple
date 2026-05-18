import type { GeoRegion } from "@/types/domain";
import { getSuppliersForCompany } from "@/lib/mock/suppliers";
import { mockStore } from "@/lib/mock/store";

export type PropagationNode = {
  id: string;
  name: string;
  hops: number;
  region: GeoRegion;
};

/**
 * BFS walk over supplier edges from companies in the shocked region.
 */
export function walkContagionGraph(
  region: GeoRegion,
  maxHops = 3,
  maxNodes = 8
): PropagationNode[] {
  const seeds = mockStore
    .getCompanies()
    .filter((c) => c.region === region)
    .slice(0, 3);

  const seen = new Set<string>();
  const queue: PropagationNode[] = [];

  for (const seed of seeds) {
    seen.add(seed.id);
    queue.push({
      id: seed.id,
      name: seed.name,
      hops: 0,
      region: seed.region,
    });
  }

  const result: PropagationNode[] = [...queue];
  let head = 0;

  while (head < queue.length && result.length < maxNodes) {
    const current = queue[head];
    head += 1;
    if (current.hops >= maxHops) continue;

    const suppliers = getSuppliersForCompany(current.id);
    for (const link of suppliers) {
      if (seen.has(link.id) || result.length >= maxNodes) continue;
      seen.add(link.id);
      const node: PropagationNode = {
        id: link.id,
        name: link.name,
        hops: current.hops + 1,
        region: link.region,
      };
      queue.push(node);
      result.push(node);
    }
  }

  return result.sort((a, b) => a.hops - b.hops || a.name.localeCompare(b.name));
}

export function contagionEntityNames(region: GeoRegion): string[] {
  return walkContagionGraph(region).map((n) =>
    n.hops === 0 ? n.name : `${n.name} (+${n.hops} hop${n.hops > 1 ? "s" : ""})`
  );
}
