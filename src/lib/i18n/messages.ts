export type Locale = "en";

export const messages = {
  en: {
    nav: {
      overview: "Overview",
      signals: "Signals",
      scenario: "Scenario",
      companies: "Companies",
    },
    common: {
      loading: "Loading…",
      retry: "Retry",
      lastUpdated: "Last updated",
    },
    hero: {
      eyebrow: "Supply chain intelligence",
    },
  },
} as const;

export type MessageKey = keyof (typeof messages)["en"];

export function t(locale: Locale, section: keyof (typeof messages)["en"], key: string): string {
  const block = messages[locale][section] as Record<string, string>;
  return block[key] ?? key;
}
