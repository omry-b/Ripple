import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAlertsForCompany,
  getCompany,
  getScoreFactors,
  getSignalsForCompany,
  getSuppliersForCompany,
  getScoreAttribution,
} from "@/lib/api";
import { ScoreBreakdownChart } from "@/components/charts/ScoreBreakdownChart";
import { RiskScoreSparkline } from "@/components/charts/RiskScoreSparkline";
import { PageHeader } from "@/components/shell/PageHeader";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { CompanyProfileSections } from "@/components/companies/CompanyProfileSections";
import { PeerComparisonCard } from "@/components/companies/PeerComparisonCard";
import { CompanyNotes } from "@/components/companies/CompanyNotes";
import { SupplierTable } from "@/components/companies/SupplierTable";
import { SupplierGraph } from "@/components/companies/SupplierGraph";
import { ScoreAttributionCard } from "@/components/companies/ScoreAttributionCard";
import { CvarBacktestChart } from "@/components/charts/CvarBacktestChart";
import { CompanyPrintButton } from "@/components/companies/CompanyPrintButton";
import { CompanyStoriesPanelClient } from "@/components/companies/CompanyStoriesPanelClient";
import { CompanyActivityPanel } from "@/components/companies/CompanyActivityPanel";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const company = await getCompany(id);
  return {
    title: company ? `${company.name} Ripple` : "Company Ripple",
  };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  const [alerts, signals, scoreFactors, suppliers, attribution] = await Promise.all([
    getAlertsForCompany(id),
    getSignalsForCompany(id),
    getScoreFactors(id),
    getSuppliersForCompany(id),
    getScoreAttribution(id, company.delta7d),
  ]);

  return (
    <>
      <PageHeader title={company.name} subtitle={`${company.tier} supplier · risk profile`} />
      <main className="content-container company-print-root" id="main-content">
        <Breadcrumbs
          items={[
            { label: "Companies", href: "/companies" },
            { label: company.name },
          ]}
        />

        <div className="company-profile-grid">
          <div className="company-stat-card">
            <span className="hero-stat-label">Risk score</span>
            <span
              className={`metric-display-medium ${company.scoreLevel === "critical" ? "critical-accent" : "elevated-accent"}`}
              style={{ marginTop: 8 }}
            >
              {company.score}
            </span>
          </div>
          <div className="company-stat-card">
            <span className="hero-stat-label">CVaR₉₅</span>
            <span className="metric-display-medium" style={{ marginTop: 8 }}>
              {company.cvar}
            </span>
          </div>
          <div className="company-stat-card">
            <span className="hero-stat-label">Contagion depth</span>
            <span className="metric-display-medium" style={{ marginTop: 8 }}>
              {company.contagionHops} hops
            </span>
          </div>
        </div>

        <span className="section-label">30-day risk trend</span>
        <section className="workbench-card company-trend-card">
          <RiskScoreSparkline
            values={company.history30d}
            accent={company.scoreLevel === "critical" ? "#EF4444" : "#F59E0B"}
          />
          <p className="company-trend-note">
            <span className={`trend-indicator ${company.deltaTrend}`}>{company.delta7d}</span>
            {" "}7-day change vs prior week.
          </p>
        </section>

        <span className="section-label">Score drivers</span>
        <ScoreBreakdownChart factors={scoreFactors} totalScore={company.score} />

        <span className="section-label">Score drivers · attribution</span>
        <ScoreAttributionCard attribution={attribution} />

        <span className="section-label">Sector peers</span>
        <PeerComparisonCard company={company} />

        <CvarBacktestChart companyId={company.id} />

        <span className="section-label">Supply network</span>
        <SupplierGraph company={company} suppliers={suppliers} />

        <span className="section-label">Supply chain · tier 1 & tier 2</span>
        <SupplierTable suppliers={suppliers} />

        <span className="section-label">Risk activity timeline</span>
        <CompanyActivityPanel companyId={company.id} companyName={company.name} />

        <span className="section-label">Recent external stories (24h)</span>
        <CompanyStoriesPanelClient companyId={company.id} companyName={company.name} initialStories={[]} />

        <CompanyNotes companyId={company.id} companyName={company.name} />

        <CompanyPrintButton companyName={company.name} />

        <CompanyProfileSections company={company} alerts={alerts} signals={signals} />

        <span className="section-label">Actions</span>
        <section className="workbench-card company-actions-card">
          <Link href="/signals" className="text-link company-action-link">
            View all signal streams →
          </Link>
          <br />
          <Link
            href="/scenario"
            className="text-link company-action-link"
          >
            Run scenario simulation →
          </Link>
        </section>
      </main>
    </>
  );
}
