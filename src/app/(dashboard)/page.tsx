import { HeroSection } from "@/components/hero/HeroSection";
import { OverviewPage } from "@/components/overview/OverviewPage";

export default function HomePage() {
  return (
    <>
      <HeroSection compact />
      <OverviewPage />
    </>
  );
}
