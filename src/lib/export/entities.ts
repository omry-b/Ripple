import type { Company, SignalStream } from "@/types/domain";
import { downloadCsv } from "./csv";

export function exportCompaniesCsv(companies: Company[]): void {
  const rows: (string | number)[][] = [
    ["id", "name", "tier", "score", "cvar", "delta7d", "contagion_hops"],
    ...companies.map((c) => [
      c.id,
      c.name,
      c.tier,
      c.score,
      c.cvar,
      c.delta7d,
      c.contagionHops,
    ]),
  ];
  downloadCsv(`ripple-companies-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

export function exportSignalsCsv(streams: SignalStream[]): void {
  const rows: (string | number)[][] = [
    ["id", "name", "category", "level", "score", "updated", "description"],
    ...streams.map((s) => [
      s.id,
      s.name,
      s.category,
      s.level,
      s.score,
      s.time,
      s.description,
    ]),
  ];
  downloadCsv(`ripple-signals-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}
