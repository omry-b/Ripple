import { getDashboard, getTicker } from "@/lib/api";
import { NavHeader } from "@/components/shell/NavHeader";
import { SignalTicker } from "@/components/shell/SignalTicker";
import { PageEffects } from "@/components/shell/PageEffects";
import { LiveDataProvider } from "@/context/LiveDataContext";
import { RefreshBanner } from "@/components/shell/RefreshBanner";
import { SkipToContent } from "@/components/shell/SkipToContent";
import { OfflineBanner } from "@/components/shell/OfflineBanner";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { KeyboardShortcuts } from "@/components/shell/KeyboardShortcuts";
import { DataModeBanner } from "@/components/shell/DataModeBanner";
import { PageTransition } from "@/components/shell/PageTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dashboard, ticker] = await Promise.all([getDashboard(), getTicker()]);

  return (
    <LiveDataProvider
      initialAsOf={dashboard.snapshot.asOf}
      initialSnapshot={dashboard.snapshot}
    >
      <SkipToContent />
      <DataModeBanner />
      <OfflineBanner />
      <NavHeader />
      <RefreshBanner />
      <SignalTicker items={ticker} />
      <PageEffects />
      <CommandPalette />
      <KeyboardShortcuts />
      <PageTransition>{children}</PageTransition>
    </LiveDataProvider>
  );
}
