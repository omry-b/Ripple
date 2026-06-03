export function CompaniesTableSkeleton() {
  return (
    <div className="companies-skeleton" aria-busy="true" aria-label="Loading companies">
      <div className="companies-skeleton-bar" />
      <div className="companies-skeleton-bar companies-skeleton-bar--short" />
      <div className="companies-skeleton-table">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="companies-skeleton-row" />
        ))}
      </div>
    </div>
  );
}
