import { describe, expect, it } from "vitest";
import { walkContagionGraph, contagionEntityNames } from "../lib/scenario/graph-propagation";

describe("graph propagation", () => {
  it("returns nodes within hop limit", async () => {
    const nodes = await walkContagionGraph("APAC", 2, 10);
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.every((n) => n.hops <= 2)).toBe(true);
  });

  it("produces contagion entity labels", () => {
    const names = contagionEntityNames("APAC");
    expect(names.length).toBeGreaterThan(0);
  });
});
