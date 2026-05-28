import { PageHeader } from "@/components/shell/PageHeader";
import { SystemStatusPanel } from "@/components/settings/SystemStatusPanel";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "System — Ripple",
};

export default function SystemSettingsPage() {
  return (
    <div className="content-container">
      <Breadcrumbs
        items={[
          { label: "Overview", href: "/" },
          { label: "System" },
        ]}
      />
      <PageHeader
        title="System status"
        subtitle="Postgres on DigitalOcean · timers on Cloudflare · app on Vercel"
      />
      <p className="watchlist-manager-hint" style={{ marginBottom: 16 }}>
        <Link href="/api/health">/api/health</Link>
        {" · "}
        <Link href="/api/ops/status">/api/ops/status</Link>
        {" · "}
        <Link href="/api/feed/rss">RSS feed</Link>
      </p>
      <SystemStatusPanel />
    </div>
  );
}
