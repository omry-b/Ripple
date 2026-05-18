"use client";

import Link from "next/link";
import type { Company } from "@/types/domain";
import { usePerspectiveTilt } from "@/lib/hooks";

type CompanyExposureTableProps = {
  companies: Company[];
  compact?: boolean;
};

export function CompanyExposureTable({ companies, compact = false }: CompanyExposureTableProps) {
  usePerspectiveTilt(".table-row-interactive", 6);

  const rows = compact ? companies.slice(0, 5) : companies;

  return (
    <section className="table-container reveal">
      <table className="risk-table">
        <thead>
          <tr className="table-header-row">
            <th>Company</th>
            <th>Risk Score</th>
            <th>Supplier Tier</th>
            <th>CVaR₉₅</th>
            <th>Δ 7d</th>
            <th>Contagion Depth</th>
            <th className="right-cell">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="table-row-interactive">
              <td style={{ fontWeight: 600, color: "#F5F5F5" }}>{row.name}</td>
              <td>
                <span
                  className={`score-badge ${row.scoreLevel === "critical" ? "critical-badge" : "elevated-badge"}`}
                >
                  {row.score}
                </span>
              </td>
              <td className="mono-cell">{row.tier}</td>
              <td className="mono-cell">{row.cvar}</td>
              <td className={`trend-indicator ${row.deltaTrend}`}>{row.delta7d}</td>
              <td className="mono-cell">{row.contagionHops} hops</td>
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
