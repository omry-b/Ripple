import { getDashboard } from "@/lib/api";
import { HeroSection } from "@/components/hero/HeroSection";
import { OverviewPage } from "@/components/overview/OverviewPage";

export default async function HomePage() {
  const data = await getDashboard();

  return (
    <>
      <HeroSection />
      <OverviewPage data={data} />
    </>
  );
}
