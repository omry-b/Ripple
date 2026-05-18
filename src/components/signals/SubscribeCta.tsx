"use client";

import { useState } from "react";

export function SubscribeCta() {
  const [status, setStatus] = useState<string | null>(null);

  async function registerWebhook() {
    setStatus("Registering…");
    try {
      const res = await fetch("/api/subscriptions/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com/ripple-webhook",
          events: ["alert.critical", "signal.elevated"],
        }),
      });
      const data = await res.json();
      setStatus(res.ok ? "Placeholder subscription saved" : data.error ?? "Failed");
    } catch {
      setStatus("Request failed");
    }
  }

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
        <button type="button" className="subscribe-cta-btn primary" onClick={() => void registerWebhook()}>
          Add webhook (demo)
        </button>
      </div>
      {status && <p className="subscribe-cta-status">{status}</p>}
    </aside>
  );
}
