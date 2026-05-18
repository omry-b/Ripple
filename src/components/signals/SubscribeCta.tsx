export function SubscribeCta() {
  return (
    <aside className="subscribe-cta" aria-label="Alert subscriptions">
      <div>
        <span className="subscribe-cta-title">Stream to your stack</span>
        <p className="subscribe-cta-copy">
          Connect Ripple signals to Slack, PagerDuty, or a custom webhook when live data is
          available. Demo mode — integrations coming soon.
        </p>
      </div>
      <div className="subscribe-cta-actions">
        <button type="button" className="subscribe-cta-btn" disabled title="Coming soon">
          RSS feed
        </button>
        <button type="button" className="subscribe-cta-btn primary" disabled title="Coming soon">
          Add webhook
        </button>
      </div>
    </aside>
  );
}
