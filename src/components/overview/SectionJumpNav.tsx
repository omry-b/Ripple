"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "alerts", label: "Alerts" },
  { id: "companies", label: "Companies" },
  { id: "intelligence", label: "Intel" },
  { id: "signals", label: "Signals" },
  { id: "scenario", label: "Scenario" },
] as const;

export function SectionJumpNav() {
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id;
        if (id) setActive(id);
      },
      { rootMargin: "-18% 0px -55% 0px", threshold: [0.08, 0.2, 0.45] }
    );

    elements.forEach((el) => observer.observe(el!));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="section-jump-nav section-jump-nav--refined" aria-label="Page sections">
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`section-jump-link${isActive ? " active" : ""}`}
            aria-current={isActive ? "true" : undefined}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
