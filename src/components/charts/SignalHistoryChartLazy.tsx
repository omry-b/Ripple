"use client";

import dynamic from "next/dynamic";
import type { RiskLevel } from "@/types/domain";

const SignalHistoryChart = dynamic(
  () => import("./SignalHistoryChart").then((m) => m.SignalHistoryChart),
  {
    ssr: false,
    loading: () => (
      <div className="chart-skeleton" style={{ height: 80 }} aria-label="Loading chart" />
    ),
  }
);

type Props = {
  values: number[];
  level: RiskLevel;
  height?: number;
};

export function SignalHistoryChartLazy(props: Props) {
  return <SignalHistoryChart {...props} />;
}
