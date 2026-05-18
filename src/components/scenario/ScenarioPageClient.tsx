"use client";

import { useSearchParams } from "next/navigation";
import type { Scenario } from "@/types/domain";
import { ScenarioWorkbench } from "./ScenarioWorkbench";

type ScenarioPageClientProps = {
  scenarios: Scenario[];
};

export function ScenarioPageClient({ scenarios }: ScenarioPageClientProps) {
  const searchParams = useSearchParams();
  const severity = Number(searchParams.get("severity")) || 100;
  const durationDays = Number(searchParams.get("duration")) || 30;
  const scenarioId = searchParams.get("scenario") ?? undefined;

  return (
    <ScenarioWorkbench
      scenarios={scenarios}
      initialSeverity={severity}
      initialDurationDays={durationDays}
      initialScenarioId={scenarioId}
    />
  );
}
