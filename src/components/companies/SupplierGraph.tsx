import type { Company, SupplierLink } from "@/types/domain";

type SupplierGraphProps = {
  company: Company;
  suppliers: SupplierLink[];
};

export function SupplierGraph({ company, suppliers }: SupplierGraphProps) {
  const linked = suppliers.filter((s) => !s.id.startsWith("supplier-")).slice(0, 6);
  const cx = 150;
  const cy = 90;
  const radius = 58;

  return (
    <section className="workbench-card supplier-graph-wrap" aria-label="Supplier network graph">
      <h3 className="supplier-tier-title">Supply network</h3>
      <svg viewBox="0 0 300 180" className="supplier-graph-svg" role="img">
        <title>{`${company.name} supplier network`}</title>
        {linked.map((s, i) => {
          const angle = (i / linked.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          return (
            <g key={s.id}>
              <line x1={cx} y1={cy} x2={x} y2={y} className="supplier-graph-edge" />
              <circle cx={x} cy={y} r={14} className="supplier-graph-node" />
              <text x={x} y={y + 26} textAnchor="middle" className="supplier-graph-label">
                {s.name.length > 12 ? `${s.name.slice(0, 10)}…` : s.name}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={18} className="supplier-graph-center" />
        <text x={cx} y={cy + 4} textAnchor="middle" className="supplier-graph-center-label">
          {company.name.split(" ")[0]}
        </text>
      </svg>
    </section>
  );
}
