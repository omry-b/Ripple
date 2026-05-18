export type ScoreAttribution = {
  summary: string;
  drivers: { label: string; points: number }[];
};

const ATTRIBUTIONS: Record<string, ScoreAttribution> = {
  apple: {
    summary: "+9 pts over 7d — primarily Taiwan Strait exposure",
    drivers: [
      { label: "Taiwan Strait alert", points: 5 },
      { label: "AIS shipping anomalies", points: 2 },
      { label: "Supplier concentration (TSMC)", points: 2 },
    ],
  },
  tsmc: {
    summary: "+12 pts — fab corridor stress + geopolitical index",
    drivers: [
      { label: "TSMC signal stream", points: 6 },
      { label: "Geopolitical escalation", points: 4 },
      { label: "Port dwell spillover", points: 2 },
    ],
  },
  foxconn: {
    summary: "+6 pts — SEA port congestion affecting assembly routes",
    drivers: [
      { label: "SEA port congestion alert", points: 4 },
      { label: "Logistics lane volatility", points: 2 },
    ],
  },
};

export function getScoreAttribution(companyId: string, delta7d: string): ScoreAttribution {
  if (ATTRIBUTIONS[companyId]) return ATTRIBUTIONS[companyId];

  const match = delta7d.match(/\+(\d+)/);
  const pts = match ? Number.parseInt(match[1], 10) : 3;

  return {
    summary: `${delta7d} — composite signal drift (placeholder engine)`,
    drivers: [
      { label: "Cross-stream signal average", points: Math.ceil(pts / 2) },
      { label: "Regional exposure weight", points: Math.floor(pts / 2) },
    ],
  };
}
