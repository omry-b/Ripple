"use client";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "alerts", label: "Alerts" },
  { id: "companies", label: "Companies" },
  { id: "signals", label: "Signals" },
  { id: "scenario", label: "Scenario" },
] as const;

export function SectionJumpNav() {
  return (
    <nav className="section-jump-nav" aria-label="Page sections">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="section-jump-link">
          {s.label}
        </a>
      ))}
    </nav>
  );
}
