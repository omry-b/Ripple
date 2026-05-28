import { getDashboard } from "@/lib/api";
import { NavHeader } from "@/components/shell/NavHeader";
import { SignalTickerLive } from "@/components/shell/SignalTickerLive";
import { PageEffects } from "@/components/shell/PageEffects";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { LiveDataProvider } from "@/context/LiveDataContext";
import { RefreshBanner } from "@/components/shell/RefreshBanner";
import { SkipToContent } from "@/components/shell/SkipToContent";
import { OfflineBanner } from "@/components/shell/OfflineBanner";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { KeyboardShortcuts } from "@/components/shell/KeyboardShortcuts";
import { DataModeBanner } from "@/components/shell/DataModeBanner";
import { PageTransition } from "@/components/shell/PageTransition";
import { DemoAuthProvider } from "@/context/DemoAuthContext";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboard = await getDashboard();

  return (
    <DemoAuthProvider>
      <LiveDataProvider initialDashboard={dashboard}>
        <SkipToContent />
      <DataModeBanner />
      <OfflineBanner />
      <NavHeader />
      <RefreshBanner />
      <SignalTickerLive />
      <PageEffects />
      <CommandPalette />
      <KeyboardShortcuts />
        <PageTransition>{children}</PageTransition>
        <OnboardingTour />
      </LiveDataProvider>
    </DemoAuthProvider>
  );
}
