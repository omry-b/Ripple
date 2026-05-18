import type { IngestAdapter } from "../types";

/** World Bank trade indicator — public API, no key required. */
export const financialAdapter: IngestAdapter = {
  name: "financial",
  description: "Macro trade / financial stress indicators",
  async fetch() {
    try {
      const res = await fetch(
        "https://api.worldbank.org/v2/country/CHN;USA;TWN/indicator/NE.TRD.GNFS.ZS?format=json&per_page=3&date=2022:2024",
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) throw new Error(`World Bank HTTP ${res.status}`);
      const json = (await res.json()) as [unknown, Array<{ country?: { value?: string }; value?: string }>];
      const rows = json[1] ?? [];
      const latest = rows.find((r) => r.value && r.value !== "");
      const label = latest?.country?.value ?? "Global";
      const value = latest?.value ?? "n/a";

      return {
        adapter: "financial",
        message: `World Bank trade indicator for ${label}`,
        events: [
          {
            id: `fin-${Date.now()}`,
            adapter: "financial",
            occurredAt: new Date().toISOString(),
            signalId: "financial",
            severity: 48,
            summary: `${label} trade (% GDP) latest: ${value}`,
          },
        ],
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Financial fetch failed";
      return {
        adapter: "financial",
        message: `Fallback stub (${message})`,
        events: [
          {
            id: `fin-${Date.now()}`,
            adapter: "financial",
            occurredAt: new Date().toISOString(),
            signalId: "financial",
            severity: 44,
            summary: "Simulated supplier credit stress widening",
          },
        ],
      };
    }
  },
};
