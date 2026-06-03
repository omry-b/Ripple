import { PageHeader } from "@/components/shell/PageHeader";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { IntelligenceFeed } from "@/components/intelligence/IntelligenceFeed";
import { IntelligencePulse } from "@/components/intelligence/IntelligencePulse";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata = {
  title: "Ripple | Intelligence",
};

export default function IntelligencePage() {
  return (
    <>
      <PageHeader
        title="Intelligence feed"
        subtitle="24-hour external coverage · on-demand or scheduled crawl"
      />
      <main className="content-container" id="main-content">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Intelligence" },
          ]}
        />
        <SectionLabel id="pulse" primary>
          Portfolio pulse
        </SectionLabel>
        <IntelligencePulse />
        <SectionLabel id="feed">24-hour feed</SectionLabel>
        <p className="page-lead">
          Timeline of external stories — flat surfaces, semantic color by outlet type.
        </p>
        <IntelligenceFeed />
      </main>
    </>
  );
}
