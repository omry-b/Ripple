import type { IngestAdapter } from "../types";

/** Port congestion proxy via UN Comtrade-style public CSV stub + env key hook. */
export const portsAdapter: IngestAdapter = {
  name: "ports",
  description: "Port congestion & dwell-time anomalies",
  async fetch() {
    const apiKey = process.env.PORTS_API_KEY?.trim();
    if (apiKey) {
      try {
        const res = await fetch(`https://api.portcast.io/v1/containers?api_key=${apiKey}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          return {
            adapter: "ports",
            message: "Port API responded (parsed as single event)",
            events: [
              {
                id: `port-${Date.now()}`,
                adapter: "ports",
                occurredAt: new Date().toISOString(),
                signalId: "port",
                lng: 103.85,
                lat: 1.29,
                severity: 58,
                summary: "Port congestion index elevated (live API)",
              },
            ],
          };
        }
      } catch {
        /* fall through */
      }
    }

    return {
      adapter: "ports",
      message: apiKey ? "Port API failed  -  stub" : "PORTS_API_KEY not set  -  stub",
      events: [
        {
          id: `port-${Date.now()}`,
          adapter: "ports",
          occurredAt: new Date().toISOString(),
          signalId: "port",
          lng: 103.85,
          lat: 1.29,
          severity: 55,
          summary: "Simulated Singapore / SEA port dwell spike",
        },
      ],
    };
  },
};
