import { PageHeader } from "@/components/shell/PageHeader";
import { SystemStatusPanel } from "@/components/settings/SystemStatusPanel";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "Ripple | System",
};

export default function SystemSettingsPage() {
  return (
    <>
      <PageHeader
        title="System status"
        subtitle="Postgres on DigitalOcean · timers on Cloudflare · app on Vercel"
      />
      <main className="content-container">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "System" },
          ]}
        />
        <nav className="system-quick-links" aria-label="Quick API links">
          <Link href="/api/health">Health</Link>
          <Link href="/api/ops/status">Ops status</Link>
          <Link href="/api/feed/rss">RSS feed</Link>
        </nav>
        <SystemStatusPanel />
      </main>
    </>
  );
}
