import Link from "next/link";
import type { SupplierLink } from "@/types/domain";

type SupplierTableProps = {
  suppliers: SupplierLink[];
};

export function SupplierTable({ suppliers }: SupplierTableProps) {
  const tier1 = suppliers.filter((s) => s.tier === "Tier 1");
  const tier2 = suppliers.filter((s) => s.tier === "Tier 2");

  return (
    <div className="supplier-tables">
      <SupplierTierSection title="Tier 1 · direct exposure" rows={tier1} />
      <SupplierTierSection title="Tier 2 · upstream & routing" rows={tier2} />
    </div>
  );
}

function SupplierTierSection({
  title,
  rows,
}: {
  title: string;
  rows: SupplierLink[];
}) {
  if (rows.length === 0) return null;

  return (
    <section className="workbench-card supplier-tier-block">
      <h3 className="supplier-tier-title">{title}</h3>
      <table className="mini-table supplier-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Region</th>
            <th className="num-col">Score</th>
            <th>Relationship</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                {row.id.startsWith("supplier-") ? (
                  row.name
                ) : (
                  <Link href={`/companies/${row.id}`} className="supplier-name-link">
                    {row.name}
                  </Link>
                )}
              </td>
              <td>{row.region}</td>
              <td
                className="num-col"
                style={{ color: row.score >= 70 ? "#EF4444" : "#F59E0B", fontWeight: 600 }}
              >
                {row.score}
              </td>
              <td style={{ color: "#A3A3A3", fontSize: 12 }}>{row.relationship}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
