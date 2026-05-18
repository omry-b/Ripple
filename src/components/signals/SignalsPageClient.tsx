"use client";

import { useMemo, useState } from "react";
import type { Company, SignalStream } from "@/types/domain";
import { StreamGrid } from "@/components/streams/StreamGrid";
import { SignalFilters, type SignalFilterState } from "./SignalFilters";
import { SignalDetailDrawer } from "./SignalDetailDrawer";

type SignalsPageClientProps = {
  streams: SignalStream[];
  companies: Company[];
};

export function SignalsPageClient({ streams, companies }: SignalsPageClientProps) {
  const [filters, setFilters] = useState<SignalFilterState>({
    level: "all",
    category: "all",
  });
  const [selected, setSelected] = useState<SignalStream | null>(null);

  const categories = useMemo(
    () => [...new Set(streams.map((s) => s.category))].sort(),
    [streams]
  );

  const filtered = useMemo(() => {
    return streams.filter((s) => {
      if (filters.level !== "all" && s.level !== filters.level) return false;
      if (filters.category !== "all" && s.category !== filters.category) return false;
      return true;
    });
  }, [streams, filters]);

  return (
    <>
      <SignalFilters
        categories={categories}
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />
      <StreamGrid
        streams={filtered}
        onStreamSelect={setSelected}
        selectedId={selected?.id}
      />
      <SignalDetailDrawer
        signal={selected}
        companies={companies}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
