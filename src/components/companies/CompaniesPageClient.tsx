"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Alert, Company, GeoRegion } from "@/types/domain";
import {
  CompanyExposureTable,
  COMPANY_TABLE_COLUMNS,
  DEFAULT_COLUMN_VISIBILITY,
  type CompanyColumnVisibility,
} from "@/components/tables/CompanyExposureTable";
import { exportCompaniesCsv } from "@/lib/export/entities";
import { useWatchlist } from "@/context/WatchlistContext";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  filterCompanies,
  parseSortKey,
  type CompanySortKey,
} from "@/lib/companies/filter";

export type { CompanySortKey };

const PAGE_SIZE = 25;
const REGIONS: GeoRegion[] = ["APAC", "EMEA", "AMER"];
const SEARCH_DEBOUNCE_MS = 220;

type CompaniesPageClientProps = {
  companies: Company[];
  alertFilter: Alert | null;
  watchlistOnly?: boolean;
  regionFilter?: string | null;
};

export function CompaniesPageClient({
  companies,
  alertFilter,
  watchlistOnly = false,
  regionFilter: serverRegion = null,
}: CompaniesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [sort, setSort] = useState<CompanySortKey>(() => parseSortKey(searchParams.get("sort")));
  const [tier, setTier] = useState(() => searchParams.get("tier") ?? "all");
  const [scoreMin, setScoreMin] = useState(() => {
    // Guard: Number(null) === 0, so an absent param must fall through to the default.
    const raw = searchParams.get("min");
    const v = raw !== null && raw !== "" ? Number(raw) : 0;
    return Number.isFinite(v) ? v : 0;
  });
  const [scoreMax, setScoreMax] = useState(() => {
    const raw = searchParams.get("max");
    const v = raw !== null && raw !== "" ? Number(raw) : 100;
    return Number.isFinite(v) ? v : 100;
  });
  const [page, setPage] = useState(() => {
    const v = Number(searchParams.get("page"));
    return Number.isFinite(v) && v >= 1 ? v : 1;
  });
  const [urlRegion, setUrlRegion] = useState<string | null>(
    () => searchParams.get("region") ?? serverRegion
  );
  const [columns, setColumns] = useState<CompanyColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { ids: watchlistIds, toggle: toggleWatchlist, addMany, isSignedIn } = useWatchlist();

  const regionFilter = urlRegion ?? serverRegion;
  const isSearching = searchInput.trim() !== debouncedSearch.trim();

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (alertFilter) params.set("alert", alertFilter.id);
    if (watchlistOnly) params.set("watchlist", "1");
    if (regionFilter && REGIONS.includes(regionFilter as GeoRegion)) {
      params.set("region", regionFilter);
    }
    const q = debouncedSearch.trim();
    if (q) params.set("q", q);
    if (sort !== "score") params.set("sort", sort);
    if (tier !== "all") params.set("tier", tier);
    if (scoreMin > 0) params.set("min", String(scoreMin));
    if (scoreMax < 100) params.set("max", String(scoreMax));
    if (page > 1) params.set("page", String(page));

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/companies?${next}` : "/companies", { scroll: false });
    }
  }, [
    alertFilter,
    watchlistOnly,
    regionFilter,
    debouncedSearch,
    sort,
    tier,
    scoreMin,
    scoreMax,
    page,
    router,
    searchParams,
  ]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  const filtered = useMemo(
    () =>
      filterCompanies({
        companies,
        search: debouncedSearch,
        sort,
        tier,
        scoreMin,
        scoreMax,
        alertFilter,
        watchlistOnly,
        watchlistIds,
        regionFilter,
        regions: REGIONS,
      }),
    [
      companies,
      debouncedSearch,
      sort,
      tier,
      scoreMin,
      scoreMax,
      alertFilter,
      watchlistOnly,
      watchlistIds,
      regionFilter,
    ]
  );

  const visiblePublicCandidates = useMemo(
    () => [...companies].sort((a, b) => b.score - a.score).slice(0, 10),
    [companies]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addSelectedToWatchlist = () => {
    addMany([...selectedIds]);
    setSelectedIds(new Set());
  };

  const clearClientFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSort("score");
    setTier("all");
    setScoreMin(0);
    setScoreMax(100);
    setUrlRegion(null);
    setPage(1);
  };

  return (
    <>
      {isFirebaseClientConfigured() && !isSignedIn && (
        <div className="alert-filter-banner">
          <span>
            Stars are saved in this browser only.{" "}
            <Link href="/sign-in">Sign in with Google</Link> to sync your watchlist.
          </span>
        </div>
      )}

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

      {regionFilter && REGIONS.includes(regionFilter as GeoRegion) && (
        <div className="alert-filter-banner">
          <span>
            Showing companies in region: <strong>{regionFilter}</strong>
          </span>
          <button
            type="button"
            className="alert-filter-clear"
            onClick={() => {
              setUrlRegion(null);
              setPage(1);
            }}
          >
            Clear filter ×
          </button>
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

      <div className="public-companies-strip" aria-label="Popular public companies">
        <span className="public-companies-label">Public stocks</span>
        {visiblePublicCandidates.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.id}`}
            className="public-company-chip"
            title={`View ${company.name} profile and stories`}
          >
            {company.name}
          </Link>
        ))}
      </div>

      <div className="filter-bar filter-bar--companies">
        <input
          type="search"
          className="filter-search"
          placeholder="Search companies…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          aria-label="Search companies"
          aria-busy={isSearching}
        />
        <select
          className="filter-select"
          value={regionFilter ?? "all"}
          onChange={(e) => {
            const v = e.target.value;
            setUrlRegion(v === "all" ? null : v);
            setPage(1);
          }}
          aria-label="Filter by region"
        >
          <option value="all">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
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
          <option value="delta">Sort: 7d Δ score</option>
          <option value="name">Sort: Name</option>
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
        <span className="filter-count">
          {isSearching ? "Searching…" : `${filtered.length} companies`}
        </span>
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
        <EmptyState
          title="No companies match"
          description="Try clearing filters, widening the score range, or viewing all companies."
          action={
            <Link href="/companies" className="filter-export-btn">
              Clear filters
            </Link>
          }
        />
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

      {(debouncedSearch || sort !== "score" || tier !== "all" || scoreMin > 0 || scoreMax < 100) && (
        <p className="companies-filter-reset">
          <button type="button" className="text-link" onClick={clearClientFilters}>
            Reset search & filters
          </button>
        </p>
      )}
    </>
  );
}
