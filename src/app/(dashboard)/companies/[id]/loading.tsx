import { PageHeader } from "@/components/shell/PageHeader";

export default function CompanyDetailLoading() {
  return (
    <>
      <PageHeader title="Company profile" subtitle="Loading exposure data…" />
      <main className="content-container company-detail-skeleton" aria-busy="true">
        <div className="companies-skeleton-bar" />
        <div className="companies-skeleton-bar companies-skeleton-bar--short" />
        <div className="companies-skeleton-table">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="companies-skeleton-row companies-skeleton-row--tall" />
          ))}
        </div>
      </main>
    </>
  );
}
