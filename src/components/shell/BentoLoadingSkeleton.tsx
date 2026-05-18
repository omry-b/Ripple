export function BentoLoadingSkeleton() {
  return (
    <main className="content-container dashboard-loading">
      <div className="skeleton-hero" />
      <section className="bento-grid bento-grid-skeleton" aria-hidden>
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
