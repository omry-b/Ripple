export const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "Ripple API",
    version: "0.1.0",
    description: "Supply chain risk intelligence — demo/mock mode",
  },
  servers: [{ url: "/api" }],
  paths: {
    "/health": { get: { summary: "Health check" } },
    "/snapshot": { get: { summary: "Dashboard snapshot (cached 60s)" } },
    "/dashboard": { get: { summary: "Full dashboard payload" } },
    "/signals": { get: { summary: "Signal streams" } },
    "/companies": { get: { summary: "Company rankings" } },
    "/alerts": { get: { summary: "Active alerts" } },
    "/search": { get: { summary: "Full-text search", parameters: [{ name: "q", in: "query" }] } },
    "/scenarios/{id}/run": {
      post: { summary: "Run scenario (sync or ?async=true)" },
    },
    "/scenarios/jobs/{id}": { get: { summary: "Poll async scenario job" } },
    "/ingest/run": { post: { summary: "Run ingest pipeline (admin)" } },
    "/ingest/dead-letters": { get: { summary: "Failed ingest jobs (DLQ)" } },
  },
};
