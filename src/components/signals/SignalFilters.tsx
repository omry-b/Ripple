"use client";

import type { RiskLevel } from "@/types/domain";

export type SignalFilterState = {
  level: RiskLevel | "all";
  category: string;
};

type SignalFiltersProps = {
  categories: string[];
  filters: SignalFilterState;
  onChange: (next: SignalFilterState) => void;
  resultCount: number;
};

const LEVELS: { value: RiskLevel | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "critical", label: "Critical" },
  { value: "elevated", label: "Elevated" },
  { value: "normal", label: "Normal" },
];

export function SignalFilters({
  categories,
  filters,
  onChange,
  resultCount,
}: SignalFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            className={`filter-chip${filters.level === l.value ? " active" : ""}`}
            onClick={() => onChange({ ...filters, level: l.value })}
          >
            {l.label}
          </button>
        ))}
      </div>
      <select
        className="filter-select"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <span className="filter-count">{resultCount} streams</span>
    </div>
  );
}
