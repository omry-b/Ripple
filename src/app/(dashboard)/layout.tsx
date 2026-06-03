import { headers } from "next/headers";
import { getScopedDashboard } from "@/lib/api/scoped";
import { NavHeader } from "@/components/shell/NavHeader";
import { SignalTickerLive } from "@/components/shell/SignalTickerLive";
import { LiveDataProvider } from "@/context/LiveDataContext";
import { RefreshBanner } from "@/components/shell/RefreshBanner";
import { SkipToContent } from "@/components/shell/SkipToContent";
import { OfflineBanner } from "@/components/shell/OfflineBanner";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { KeyboardShortcuts } from "@/components/shell/KeyboardShortcuts";
import { DataModeBanner } from "@/components/shell/DataModeBanner";
import { PageTransition } from "@/components/shell/PageTransition";
import { DemoAuthProvider } from "@/context/DemoAuthContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { AppFooter } from "@/components/shell/AppFooter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const dashboard = await getScopedDashboard(
    new Request("http://internal/dashboard", { headers: h })
  );

  return (
    <DemoAuthProvider>
      <WatchlistProvider>
      <PortfolioProvider>
      <LiveDataProvider initialDashboard={dashboard}>
        <div className="ripple-app">
          <SkipToContent />
          <DataModeBanner />
          <OfflineBanner />
          <NavHeader />
          <RefreshBanner />
          <SignalTickerLive />
          <CommandPalette />
          <KeyboardShortcuts />
          <PageTransition>{children}</PageTransition>
          <AppFooter />
          <OnboardingTour />
        </div>
      </LiveDataProvider>
      </PortfolioProvider>
      </WatchlistProvider>
    </DemoAuthProvider>
  );
}
