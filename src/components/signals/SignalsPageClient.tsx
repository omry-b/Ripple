"use client";

import { useMemo, useState } from "react";
import type { Company, SignalStream } from "@/types/domain";
import { useSignals } from "@/lib/hooks";
import { StreamGrid } from "@/components/streams/StreamGrid";
import { SignalFilters, type SignalFilterState } from "./SignalFilters";
import { SignalDetailDrawer } from "./SignalDetailDrawer";
import { SignalComparePanel } from "./SignalComparePanel";
import { SubscribeCta } from "./SubscribeCta";
import { exportSignalsCsv } from "@/lib/export/entities";
import { EmptyState } from "@/components/ui/EmptyState";

type SignalsPageClientProps = {
  streams: SignalStream[];
  companies: Company[];
};

export function SignalsPageClient({ streams, companies }: SignalsPageClientProps) {
  const { signals: liveStreams } = useSignals(streams);
  const [filters, setFilters] = useState<SignalFilterState>({
    level: "all",
    category: "all",
  });
  const [selected, setSelected] = useState<SignalStream | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const categories = useMemo(
    () => [...new Set(liveStreams.map((s) => s.category))].sort(),
    [liveStreams]
  );

  const filtered = useMemo(() => {
    return liveStreams.filter((s) => {
      if (filters.level !== "all" && s.level !== filters.level) return false;
      if (filters.category !== "all" && s.category !== filters.category) return false;
      return true;
    });
  }, [liveStreams, filters]);

  const compareSignals = useMemo(() => {
    const picked = compareIds
      .map((id) => liveStreams.find((s) => s.id === id))
      .filter((s): s is SignalStream => Boolean(s));
    return picked.length === 2 ? (picked as [SignalStream, SignalStream]) : null;
  }, [compareIds, liveStreams]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  return (
    <>
      <SubscribeCta />

      <div className="signals-toolbar">
        <SignalFilters
          categories={categories}
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />
        <button
          type="button"
          className={`filter-export-btn${compareMode ? " active" : ""}`}
          onClick={() => {
            setCompareMode((m) => !m);
            setCompareIds([]);
          }}
        >
          {compareMode ? "Exit compare" : "Compare signals"}
        </button>
        <button
          type="button"
          className="filter-export-btn"
          onClick={() => exportSignalsCsv(filtered)}
          disabled={filtered.length === 0}
        >
          Export CSV
        </button>
      </div>

      {compareSignals && (
        <SignalComparePanel
          signals={compareSignals}
          onClear={() => setCompareIds([])}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No signal streams match"
          description="Adjust level or category filters to see live channels."
          action={{ label: "Reset filters", href: "/signals" }}
        />
      ) : (
        <StreamGrid
          streams={filtered}
          onStreamSelect={compareMode ? undefined : setSelected}
          selectedId={selected?.id}
          compareMode={compareMode}
          compareIds={compareIds}
          onToggleCompare={compareMode ? toggleCompare : undefined}
        />
      )}
      <SignalDetailDrawer
        signal={selected}
        companies={companies}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
