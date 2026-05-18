"use client";

import { useMemo, useState } from "react";
import type { Alert, Company } from "@/types/domain";
import { CompanyExposureTable } from "@/components/tables/CompanyExposureTable";
import Link from "next/link";

export type CompanySortKey = "score" | "name" | "cvar" | "delta";

type CompaniesPageClientProps = {
  companies: Company[];
  alertFilter: Alert | null;
};

export function CompaniesPageClient({ companies, alertFilter }: CompaniesPageClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CompanySortKey>("score");
  const [tier, setTier] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = companies;

    if (alertFilter) {
      list = list.filter((c) => alertFilter.affectedCompanyIds.includes(c.id));
    }

    if (tier !== "all") {
      list = list.filter((c) => c.tier === tier);
    }

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
  }, [companies, alertFilter, search, sort, tier]);

  return (
    <>
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

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          type="search"
          className="filter-search"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search companies"
        />
        <select
          className="filter-select"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          aria-label="Filter by tier"
        >
          <option value="all">All tiers</option>
          <option value="Tier 1">Tier 1</option>
          <option value="Tier 2">Tier 2</option>
        </select>
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as CompanySortKey)}
          aria-label="Sort companies"
        >
          <option value="score">Sort: Risk score</option>
          <option value="cvar">Sort: CVaR</option>
          <option value="name">Sort: Name</option>
          <option value="delta">Sort: Score (alt)</option>
        </select>
        <span className="filter-count">{filtered.length} companies</span>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No companies match your filters.</p>
      ) : (
        <CompanyExposureTable companies={filtered} />
      )}
    </>
  );
}
