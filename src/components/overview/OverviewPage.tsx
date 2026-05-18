"use client";

import Link from "next/link";
import type { DashboardPayload } from "@/types/domain";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { AlertsSection } from "@/components/alerts/AlertsSection";
import { CompanyExposureTable } from "@/components/tables/CompanyExposureTable";
import { StreamGrid } from "@/components/streams/StreamGrid";

type OverviewPageProps = {
  data: DashboardPayload;
};

export function OverviewPage({ data }: OverviewPageProps) {
  const { snapshot, topCompaniesMini, alerts, companies, streams } = data;

  return (
    <main className="content-container">
      <span className="section-label">Live Risk Overview</span>
      <BentoGrid
        snapshot={snapshot}
        topCompanies={topCompaniesMini}
        hotspots={snapshot.hotspots}
      />

      <span className="section-label">Active Alerts · {snapshot.openAlertsCount} Open</span>
      <AlertsSection alerts={alerts} />

      <span className="section-label">Company Exposure Ranking</span>
      <CompanyExposureTable companies={companies} compact />

      <span className="section-label">
        Live Signal Streams · {snapshot.activeStreamsCount} Active{" "}
        <Link href="/signals" style={{ color: "#3B82F6", textDecoration: "none", marginLeft: 8 }}>
          View all →
        </Link>
      </span>
      <StreamGrid streams={streams.slice(0, 4)} />

      <span className="section-label">
        Scenario Workbench{" "}
        <Link href="/scenario" style={{ color: "#3B82F6", textDecoration: "none", marginLeft: 8 }}>
          Open workbench →
        </Link>
      </span>
      <p
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: 9,
          color: "#525252",
          marginBottom: 16,
        }}
      >
        Run what-if simulations on the Scenario page.
      </p>
    </main>
  );
}
