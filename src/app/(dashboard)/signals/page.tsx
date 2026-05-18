import { getSignals, getSnapshot } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { StreamGrid } from "@/components/streams/StreamGrid";

export const metadata = {
  title: "Signals — Ripple",
};

export default async function SignalsPage() {
  const [streams, snapshot] = await Promise.all([getSignals(), getSnapshot()]);

  return (
    <>
      <PageHeader
        title="Live Signal Streams"
        subtitle={`${streams.length} active channels · updated ${formatAsOf(snapshot.asOf)}`}
      />
      <main className="content-container">
        <span className="section-label">All streams</span>
        <StreamGrid streams={streams} />
      </main>
    </>
  );
}

function formatAsOf(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
