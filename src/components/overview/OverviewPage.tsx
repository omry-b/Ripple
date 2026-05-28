"use client";

import Link from "next/link";
import type { DashboardPayload } from "@/types/domain";
import { useLiveData } from "@/context/LiveDataContext";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { AlertsSectionClient } from "@/components/alerts/AlertsSectionClient";
import { CompanyExposureTable } from "@/components/tables/CompanyExposureTable";
import { StreamGrid } from "@/components/streams/StreamGrid";
import { SectionJumpNav } from "@/components/overview/SectionJumpNav";

type OverviewPageProps = {
  data: DashboardPayload;
};

export function OverviewPage({ data }: OverviewPageProps) {
  const { dashboard: liveDashboard, snapshot: liveSnapshot } = useLiveData();
  const liveData = liveDashboard ?? data;
  const snapshot = liveSnapshot ?? liveData.snapshot;

  return (
    <main className="content-container" id="main-content">
      <SectionJumpNav />
      <span className="section-label" id="overview">
        Live Risk Overview
      </span>
      <BentoGrid
        snapshot={snapshot}
        topCompanies={liveData.topCompaniesMini}
        hotspots={snapshot.hotspots}
      />

      <span className="section-label" id="alerts">
        Active Alerts · {snapshot.openAlertsCount} Open
      </span>
      <AlertsSectionClient initialAlerts={liveData.alerts} />

      <span className="section-label" id="companies">
        Company Exposure Ranking
      </span>
      <CompanyExposureTable companies={liveData.companies} compact />

      <span className="section-label" id="signals">
        Live Signal Streams · {snapshot.activeStreamsCount} Active{" "}
        <Link href="/signals" className="text-link" style={{ marginLeft: 8 }}>
          View all →
        </Link>
      </span>
      <StreamGrid streams={liveData.streams.slice(0, 4)} linkToSignals />

      <span className="section-label" id="scenario">
        Scenario Workbench{" "}
        <Link href="/scenario" className="text-link" style={{ marginLeft: 8 }}>
          Open workbench →
        </Link>
      </span>
      <p className="overview-hint">
        Run what-if simulations on the Scenario page.
      </p>
    </main>
  );
}
