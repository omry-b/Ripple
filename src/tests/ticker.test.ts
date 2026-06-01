import { describe, expect, it } from "vitest";
import { buildTickerFromAllSources } from "@/lib/ingest/sync-risk";

describe("buildTickerFromAllSources", () => {
  const now = Date.parse("2026-06-01T12:00:00Z");

  it("prioritizes recent ingest headlines over static stream names", () => {
    const items = buildTickerFromAllSources(
      [
        {
          id: "taiwan",
          level: "critical",
          status: "open",
          statusLabel: "● CRITICAL",
          title: "Taiwan Strait",
          detail: "old",
          meta: "",
          timeline: [{ at: "2020-01-01T00:00:00Z", event: "opened" }],
        },
      ],
      [
        {
          id: "geo",
          name: "TSMC SIGNAL",
          category: "Geopolitical",
          score: 90,
          level: "critical",
          sparkline: "",
          history7d: [80, 85, 90],
          time: "1m",
          description: "",
          relatedCompanyIds: [],
        },
      ],
      [
        {
          id: "wx-1",
          adapter: "weather",
          occurredAt: "2026-06-01T11:00:00Z",
          severity: 70,
          summary: "Severe thunderstorm warning Oklahoma",
          lng: -97,
          lat: 35,
          region: "AMER",
          level: "critical",
        },
      ],
      now
    );

    expect(items[0]?.label).toContain("THUNDERSTORM");
    const tsmcIndex = items.findIndex((i) => i.label.includes("TSMC"));
    expect(tsmcIndex).toBeGreaterThan(0);
  });
});
