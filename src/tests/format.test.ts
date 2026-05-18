import { describe, expect, it } from "vitest";
import { formatAsOf, formatRelativeAsOf } from "../lib/format";

describe("formatAsOf", () => {
  it("formats ISO timestamps", () => {
    const out = formatAsOf("2026-05-17T14:30:00.000Z");
    expect(out).toMatch(/May/);
    expect(out).toMatch(/\d/);
  });
});

describe("formatRelativeAsOf", () => {
  it("returns seconds for recent timestamps", () => {
    const iso = new Date(Date.now() - 15_000).toISOString();
    expect(formatRelativeAsOf(iso)).toMatch(/s ago/);
  });
});
