"use client";

import { useState } from "react";
import Link from "next/link";

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
    <aside className="subscribe-cta" aria-label="Alert subscriptions">
      <div>
        <span className="subscribe-cta-title">Stream to your stack</span>
        <p className="subscribe-cta-copy">
          RSS for readers, webhooks for automation. Server alerts use{" "}
          <code>SLACK_WEBHOOK_URL</code>, <code>RESEND_API_KEY</code>, or{" "}
          <code>PAGERDUTY_ROUTING_KEY</code> on Vercel when configured.
        </p>
      </div>
      <div className="subscribe-cta-actions">
        <Link href="/api/feed/rss" className="subscribe-cta-btn" target="_blank" rel="noopener">
          RSS feed
        </Link>
        <button
          type="button"
          className="subscribe-cta-btn primary"
          onClick={() => void registerWebhook()}
        >
          Add webhook
        </button>
      </div>
      {status && <p className="subscribe-cta-status">{status}</p>}
    </aside>
  );
}
