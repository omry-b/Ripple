import { headers } from "next/headers";
import { getScopedDashboard } from "@/lib/api/scoped";
import { PageHeader } from "@/components/shell/PageHeader";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { AlertsInboxClient } from "@/components/alerts/AlertsInboxClient";

export const metadata = {
  title: "Ripple | Alerts",
};

export default async function AlertsPage() {
  const h = await headers();
  const request = new Request("http://internal/alerts", { headers: h });
  const dashboard = await getScopedDashboard(request);

  return (
    <>
      <PageHeader
        title="Alert inbox"
        subtitle="Open risk alerts — acknowledge, resolve, or drill into exposure"
      />
      <main className="content-container" id="main-content">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Alerts" },
          ]}
        />
        <AlertsInboxClient
          initialAlerts={dashboard.alerts}
          totalOpenCount={dashboard.snapshot.openAlertsCount}
        />
      </main>
    </>
  );
}
