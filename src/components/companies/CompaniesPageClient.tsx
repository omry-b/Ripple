"use client";

import { useEffect, useMemo, useState } from "react";
import type { Alert, Company } from "@/types/domain";
import {
  CompanyExposureTable,
  COMPANY_TABLE_COLUMNS,
  DEFAULT_COLUMN_VISIBILITY,
  type CompanyColumnVisibility,
} from "@/components/tables/CompanyExposureTable";
import { exportCompaniesCsv } from "@/lib/export/entities";
import { addToWatchlist, getWatchlistIds, toggleWatchlistId } from "@/lib/watchlist";
import Link from "next/link";

export type CompanySortKey = "score" | "name" | "cvar" | "delta";

const PAGE_SIZE = 25;

type CompaniesPageClientProps = {
  companies: Company[];
  alertFilter: Alert | null;
  watchlistOnly?: boolean;
};

export function CompaniesPageClient({
  companies,
  alertFilter,
  watchlistOnly = false,
}: CompaniesPageClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CompanySortKey>("score");
  const [tier, setTier] = useState<string>("all");
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(100);
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState<CompanyColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setWatchlistIds(new Set(getWatchlistIds()));
    sync();
    window.addEventListener("ripple-watchlist-change", sync);
    return () => window.removeEventListener("ripple-watchlist-change", sync);
  }, []);

  const filtered = useMemo(() => {
    let list = companies;

    if (watchlistOnly) {
      list = list.filter((c) => watchlistIds.has(c.id));
    }

    if (alertFilter) {
      list = list.filter((c) => alertFilter.affectedCompanyIds.includes(c.id));
    }

    if (tier !== "all") {
      list = list.filter((c) => c.tier === tier);
    }

    list = list.filter((c) => c.score >= scoreMin && c.score <= scoreMax);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "cvar":
          return b.cvarUsd - a.cvarUsd;
        case "delta":
          return b.score - a.score;
        case "score":
        default:
          return b.score - a.score;
      }
    });
  }, [companies, alertFilter, watchlistOnly, watchlistIds, search, sort, tier, scoreMin, scoreMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addSelectedToWatchlist = () => {
    addToWatchlist([...selectedIds]);
    setSelectedIds(new Set());
  };

  const toggleWatchlist = (id: string) => {
    toggleWatchlistId(id);
    setWatchlistIds(new Set(getWatchlistIds()));
  };

  return (
    <>
      {watchlistOnly && (
        <div className="alert-filter-banner">
          <span>
            Showing <strong>watchlist</strong> only ({watchlistIds.size} saved)
          </span>
          <Link href="/companies" className="alert-filter-clear">
            Show all companies ×
          </Link>
        </div>
      )}

      {alertFilter && (
        <div className="alert-filter-banner">
          <span>
            Showing exposure for alert: <strong>{alertFilter.title}</strong>
          </span>
          <Link href="/companies" className="alert-filter-clear">
            Clear filter ×
          </Link>
        </div>
      )}

      <div className="column-picker-bar">
        {COMPANY_TABLE_COLUMNS.map((col) => (
          <label key={col.key} className="column-picker-label">
            <input
              type="checkbox"
              checked={columns[col.key]}
              onChange={(e) =>
                setColumns((c) => ({ ...c, [col.key]: e.target.checked }))
              }
            />
            {col.label}
          </label>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          type="search"
          className="filter-search"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Search companies"
        />
        <select
          className="filter-select"
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by tier"
        >
          <option value="all">All tiers</option>
          <option value="Tier 1">Tier 1</option>
          <option value="Tier 2">Tier 2</option>
        </select>
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as CompanySortKey);
            setPage(1);
          }}
          aria-label="Sort companies"
        >
          <option value="score">Sort: Risk score</option>
          <option value="cvar">Sort: CVaR</option>
          <option value="name">Sort: Name</option>
          <option value="delta">Sort: Score (alt)</option>
        </select>
        <button
          type="button"
          className="filter-export-btn"
          onClick={() => exportCompaniesCsv(filtered)}
          disabled={filtered.length === 0}
        >
          Export CSV
        </button>
        {selectedIds.size > 0 && (
          <button type="button" className="filter-export-btn" onClick={addSelectedToWatchlist}>
            Add {selectedIds.size} to watchlist
          </button>
        )}
        <span className="filter-count">{filtered.length} companies</span>
      </div>

      <div className="score-range-bar">
        <label className="score-range-label" htmlFor="score-min">
          Min score {scoreMin}
        </label>
        <input
          id="score-min"
          type="range"
          min={0}
          max={100}
          value={scoreMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            setScoreMin(Math.min(v, scoreMax));
            setPage(1);
          }}
          className="score-range-input"
          aria-label="Minimum risk score"
        />
        <label className="score-range-label" htmlFor="score-max">
          Max score {scoreMax}
        </label>
        <input
          id="score-max"
          type="range"
          min={0}
          max={100}
          value={scoreMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            setScoreMax(Math.max(v, scoreMin));
            setPage(1);
          }}
          className="score-range-input"
          aria-label="Maximum risk score"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No companies match your filters.</p>
      ) : (
        <>
          <CompanyExposureTable
            companies={paged}
            columnVisibility={columns}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            watchlistIds={watchlistIds}
            onToggleWatchlist={toggleWatchlist}
          />
          {totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Companies pagination">
              <button
                type="button"
                className="pagination-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="pagination-meta">
                Page {safePage} of {totalPages} · {filtered.length} total
              </span>
              <button
                type="button"
                className="pagination-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
