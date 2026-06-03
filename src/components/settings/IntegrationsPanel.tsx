"use client";

import { useState } from "react";
import Link from "next/link";

export function IntegrationsPanel() {
  const [status, setStatus] = useState<string | null>(null);

  async function registerWebhook() {
    setStatus("Registering…");
    try {
      const res = await fetch("/api/subscriptions/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com/ripple-webhook",
          events: ["alert.critical", "alert.acknowledged", "alert.resolved", "signal.elevated"],
        }),
      });
      const data = (await res.json()) as { signingSecret?: string; error?: string };
      setStatus(
        res.ok
          ? `Webhook saved. Signing secret: ${data.signingSecret?.slice(0, 8) ?? "—"}…`
          : data.error ?? "Failed"
      );
    } catch {
      setStatus("Request failed");
    }
  }

  return (
    <section className="workbench-card subscribe-cta" aria-label="Outbound integrations">
      <h3 className="supplier-tier-title">Outbound integrations</h3>
      <p className="subscribe-cta-copy">
        RSS for readers and webhooks for automation. Slack, email, and PagerDuty light up when
        configured on the server — check integration pills in{" "}
        <strong>System status</strong> below.
      </p>
      <div className="subscribe-cta-actions">
        <Link href="/api/feed/rss" className="subscribe-cta-btn" target="_blank" rel="noopener">
          Open RSS feed
        </Link>
        <button
          type="button"
          className="subscribe-cta-btn primary"
          onClick={() => void registerWebhook()}
        >
          Register demo webhook
        </button>
      </div>
      {status ? <p className="subscribe-cta-status">{status}</p> : null}
    </section>
  );
}
