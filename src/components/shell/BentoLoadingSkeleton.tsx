export function BentoLoadingSkeleton() {
  return (
    <main
      className="content-container dashboard-loading"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="skeleton-hero" />
      <section className="bento-grid bento-grid-skeleton" aria-hidden="true">
        <div className="bento-card bento-large skeleton-pulse" />
        <div className="bento-card bento-wide skeleton-pulse" />
        <div className="bento-card bento-small skeleton-pulse" />
        <div className="bento-card bento-small skeleton-pulse" />
        <div className="bento-card bento-small skeleton-pulse" />
        <div className="bento-card bento-wide skeleton-pulse" />
      </section>
    </main>
  );
}
