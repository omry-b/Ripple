"use client";

import Link from "next/link";
import type { Company } from "@/types/domain";
import { usePerspectiveTilt } from "@/lib/hooks";

export const COMPANY_TABLE_COLUMNS = [
  { key: "tier", label: "Supplier Tier" },
  { key: "cvar", label: "CVaR₉₅" },
  { key: "delta", label: "Δ 7d" },
  { key: "contagion", label: "Contagion Depth" },
] as const;

export type CompanyColumnKey = (typeof COMPANY_TABLE_COLUMNS)[number]["key"];

export type CompanyColumnVisibility = Record<CompanyColumnKey, boolean>;

export const DEFAULT_COLUMN_VISIBILITY: CompanyColumnVisibility = {
  tier: true,
  cvar: true,
  delta: true,
  contagion: true,
};

type CompanyExposureTableProps = {
  companies: Company[];
  compact?: boolean;
  columnVisibility?: CompanyColumnVisibility;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  watchlistIds?: Set<string>;
  onToggleWatchlist?: (id: string) => void;
};

export function CompanyExposureTable({
  companies,
  compact = false,
  columnVisibility = DEFAULT_COLUMN_VISIBILITY,
  selectable = false,
  selectedIds,
  onToggleSelect,
  watchlistIds,
  onToggleWatchlist,
}: CompanyExposureTableProps) {
  usePerspectiveTilt(".table-row-interactive", 6);

  const rows = compact ? companies.slice(0, 5) : companies;
  const showWatchlist = Boolean(onToggleWatchlist);

  return (
    <section className="table-container">
      <table className="risk-table">
        <thead>
          <tr className="table-header-row">
            {selectable && <th className="col-check" />}
            {showWatchlist && <th className="col-check" aria-label="Watchlist" />}
            <th>Company</th>
            <th>Risk Score</th>
            {columnVisibility.tier && <th>Supplier Tier</th>}
            {columnVisibility.cvar && <th>CVaR₉₅</th>}
            {columnVisibility.delta && <th>Δ 7d</th>}
            {columnVisibility.contagion && <th>Contagion Depth</th>}
            <th className="right-cell">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="table-row-interactive">
              {selectable && (
                <td className="col-check">
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(row.id) ?? false}
                    onChange={() => onToggleSelect?.(row.id)}
                    aria-label={`Select ${row.name}`}
                  />
                </td>
              )}
              {showWatchlist && (
                <td className="col-check">
                  <button
                    type="button"
                    className={`watchlist-star${watchlistIds?.has(row.id) ? " active" : ""}`}
                    onClick={() => onToggleWatchlist?.(row.id)}
                    aria-label={
                      watchlistIds?.has(row.id)
                        ? `Remove ${row.name} from watchlist`
                        : `Add ${row.name} to watchlist`
                    }
                  >
                    ★
                  </button>
                </td>
              )}
              <td style={{ fontWeight: 600, color: "#F5F5F5" }}>{row.name}</td>
              <td>
                <span
                  className={`score-badge ${row.scoreLevel === "critical" ? "critical-badge" : "elevated-badge"}`}
                >
                  {row.score}
                </span>
              </td>
              {columnVisibility.tier && <td className="mono-cell">{row.tier}</td>}
              {columnVisibility.cvar && <td className="mono-cell">{row.cvar}</td>}
              {columnVisibility.delta && (
                <td className={`trend-indicator ${row.deltaTrend}`}>{row.delta7d}</td>
              )}
              {columnVisibility.contagion && (
                <td className="mono-cell">{row.contagionHops} hops</td>
              )}
              <td className="right-cell">
                <Link
                  href={`/companies/${row.id}`}
                  className="table-action-btn"
                  style={{ opacity: 1, textDecoration: "none" }}
                  aria-label={`Analyze ${row.name} risk profile`}
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
