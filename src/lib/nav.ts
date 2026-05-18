export const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Signals", href: "/signals" },
  { label: "Scenario", href: "/scenario" },
  { label: "Companies", href: "/companies" },
] as const;

export type NavHref = (typeof NAV_ITEMS)[number]["href"];
