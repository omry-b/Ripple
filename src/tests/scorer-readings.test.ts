import { describe, expect, it } from "vitest";
import { applyReadingsToStreams } from "@/lib/risk/apply-readings";
import type { SignalStream } from "@/types/domain";

const baseStream: SignalStream = {
  id: "ais",
  name: "AIS",
  category: "Logistics",
  score: 50,
  level: "elevated",
  sparkline: "",
  history7d: [40, 42, 44, 46, 48, 49, 50],
  time: "1m ago",
  description: "test",
  relatedCompanyIds: ["apple"],
  methodology: "test",
};

describe("applyReadingsToStreams", () => {
  it("raises score when ingest readings are severe", () => {
    const updated = applyReadingsToStreams([baseStream], [
      {
        id: "r1",
        signalId: "ais",
        companyId: "apple",
        recordedAt: new Date().toISOString(),
        value: 95,
        summary: "Spike",
      },
    ]);
    expect(updated[0].score).toBeGreaterThan(50);
    expect(["elevated", "critical"]).toContain(updated[0].level);
  });

  it("leaves unrelated streams unchanged", () => {
    const other: SignalStream = { ...baseStream, id: "geo", score: 30, level: "normal" };
    const updated = applyReadingsToStreams([baseStream, other], [
      {
        id: "r1",
        signalId: "ais",
        companyId: null,
        recordedAt: new Date().toISOString(),
        value: 90,
        summary: "Spike",
      },
    ]);
    expect(updated[1]).toEqual(other);
  });
});
