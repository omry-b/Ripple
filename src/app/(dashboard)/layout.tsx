import { getSnapshot, getTicker } from "@/lib/api";
import { NavHeader } from "@/components/shell/NavHeader";
import { SignalTicker } from "@/components/shell/SignalTicker";
import { PageEffects } from "@/components/shell/PageEffects";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snapshot, ticker] = await Promise.all([getSnapshot(), getTicker()]);

  return (
    <>
      <div className="demo-banner">Demo data · scores and CVaR are illustrative</div>
      <NavHeader asOf={snapshot.asOf} />
      <SignalTicker items={ticker} />
      <PageEffects />
      {children}
    </>
  );
}
