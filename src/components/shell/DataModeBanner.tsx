"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  dataMode: string;
  database: string;
  auth: string;
};

export function DataModeBanner() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  const mode = health?.dataMode ?? "mock";
  const isMock = mode === "mock";

  return (
    <div className={`demo-banner${isMock ? "" : " demo-banner-live"}`}>
      {isMock ? (
        <>
          Demo data · in-memory mock store · set <code>DATABASE_URL</code> for Postgres
        </>
      ) : (
        <>
          Live data mode · Postgres · auth: {health?.auth} ·{" "}
          <a href="/api/health" style={{ color: "#3b82f6" }}>
            system health
          </a>
        </>
      )}
    </div>
  );
}
