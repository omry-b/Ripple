import { describe, expect, it } from "vitest";
import { belongsToOrg, entityOrgId, filterIdsForOrg } from "../lib/org/scope";

describe("org scope", () => {
  it("assigns stable org per entity id", () => {
    const a = entityOrgId("company-1");
    const b = entityOrgId("company-1");
    expect(a).toBe(b);
    expect(["org_demo", "org_acme", "org_globex"]).toContain(a);
  });

  it("filters items by org", () => {
    const items = [
      { id: "alpha" },
      { id: "beta" },
      { id: "gamma" },
    ];
    const org = entityOrgId("alpha");
    const filtered = filterIdsForOrg(items, org);
    expect(filtered.every((i) => belongsToOrg(i.id, org))).toBe(true);
  });
});
