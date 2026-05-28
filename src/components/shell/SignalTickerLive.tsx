"use client";

import { useLiveData } from "@/context/LiveDataContext";
import { SignalTicker } from "./SignalTicker";

export function SignalTickerLive() {
  const { ticker } = useLiveData();
  return <SignalTicker items={ticker} />;
}
