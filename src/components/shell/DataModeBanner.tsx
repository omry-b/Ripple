"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HealthResponse = {
  dataMode: string;
  database?: { connected: boolean };
  auth?: string;
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
  const dbOk = health?.database?.connected === true;

  return (
    <div className={`demo-banner${isMock ? "" : " demo-banner-live"}`}>
      {isMock ? (
        <>
          Demo data · in-memory mock · set <code>DATABASE_URL</code> on Vercel for Postgres
        </>
      ) : (
        <>
          Live · <strong>Postgres</strong> (DigitalOcean)
          {dbOk ? " · connected" : " · checking DB…"} · Cloudflare crons active ·{" "}
          <Link href="/settings/system" style={{ color: "#93c5fd" }}>
            system status
          </Link>
        </>
      )}
    </div>
  );
}
