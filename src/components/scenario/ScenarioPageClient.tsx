"use client";

import { useSearchParams } from "next/navigation";
import type { Scenario } from "@/types/domain";
import { ScenarioWorkbench } from "./ScenarioWorkbench";

type ScenarioPageClientProps = {
  scenarios: Scenario[];
};

export function ScenarioPageClient({ scenarios }: ScenarioPageClientProps) {
  const searchParams = useSearchParams();
  // A stress-test tool should default to an actual stress, not today's baseline,
  // so scenarios show real portfolio impact on the first run.
  const severity = Number(searchParams.get("severity")) || 130;
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
