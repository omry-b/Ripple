"use client";

import Link from "next/link";
import { useLiveData } from "@/context/LiveDataContext";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { AlertsSectionClient } from "@/components/alerts/AlertsSectionClient";
import { CompanyExposureTable } from "@/components/tables/CompanyExposureTable";
import { StreamGrid } from "@/components/streams/StreamGrid";
import { SectionJumpNav } from "@/components/overview/SectionJumpNav";
import { RiskSpectrumBar } from "@/components/overview/RiskSpectrumBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function OverviewPage() {
  const { dashboard, snapshot: liveSnapshot } = useLiveData();
  if (!dashboard) return null;
  const snapshot = liveSnapshot ?? dashboard.snapshot;

  return (
    <main className="content-container dashboard-overview" id="main-content">
      <SectionJumpNav />

      <SectionLabel id="overview" primary>
        Live Risk Overview
      </SectionLabel>

      <BentoGrid
        snapshot={snapshot}
        topCompanies={dashboard.topCompaniesMini}
        hotspots={snapshot.hotspots}
      />

      <SectionLabel
        id="alerts"
        count={<span className="section-count">{snapshot.openAlertsCount} open</span>}
        actions={
          <Link href="/alerts" className="text-link">
            View all →
          </Link>
        }
      >
        Active Alerts
      </SectionLabel>
      <RiskSpectrumBar
        alerts={dashboard.alerts}
        totalOpen={snapshot.openAlertsCount}
      />
      <AlertsSectionClient
        initialAlerts={dashboard.alerts}
        totalOpenCount={snapshot.openAlertsCount}
      />

      <SectionLabel
        id="companies"
        count={<span className="section-count">{snapshot.trackedCompanies} tracked</span>}
      >
        Company Exposure Ranking
      </SectionLabel>
      <CompanyExposureTable companies={dashboard.companies} compact />

      <SectionLabel
        id="intelligence"
        actions={
          <Link href="/intelligence" className="text-link">
            Open feed →
          </Link>
        }
      >
        Intelligence
      </SectionLabel>
      <p className="page-lead">
        24-hour external coverage from seven sources — scheduled every few hours or on demand.
      </p>

      <SectionLabel
        id="signals"
        count={<span className="section-count">{snapshot.activeStreamsCount} active</span>}
        actions={
          <Link href="/signals" className="text-link">
            View all →
          </Link>
        }
      >
        Live Signal Streams
      </SectionLabel>
      <StreamGrid streams={dashboard.streams.slice(0, 4)} linkToSignals />

      <SectionLabel
        id="scenario"
        actions={
          <Link href="/scenario" className="text-link">
            Open workbench →
          </Link>
        }
      >
        Scenario Workbench
      </SectionLabel>
      <p className="page-lead">
        Stress-test the portfolio against geopolitical and supplier shocks with what-if
        simulations.
      </p>
    </main>
  );
}
