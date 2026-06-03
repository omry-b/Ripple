import { describe, expect, it } from "vitest";
import { stableIngestEventId } from "@/lib/ingest/stable-id";

describe("stableIngestEventId", () => {
  it("returns the same id for the same adapter and summary", () => {
    const a = stableIngestEventId("ais", "Simulated strait corridor density spike");
    const b = stableIngestEventId("ais", "Simulated strait corridor density spike");
    expect(a).toBe(b);
  });

  it("differs when summary changes", () => {
    const a = stableIngestEventId("weather", "Gale Warning A");
    const b = stableIngestEventId("weather", "Gale Warning B");
    expect(a).not.toBe(b);
  });
});
