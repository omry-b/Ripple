const MOCK_STATS = [
  { label: "Risk index", value: "67.4", accent: true },
  { label: "CVaR₉₅", value: "$2.1B", accent: true },
  { label: "Live signals", value: "214", accent: false },
  { label: "Open alerts", value: "3", accent: false },
];

export function WelcomeDashboardPreview() {
  return (
    <div className="welcome-preview" aria-hidden>
      <div className="welcome-preview-chrome">
        <span className="welcome-preview-dot" />
        <span className="welcome-preview-dot" />
        <span className="welcome-preview-dot" />
        <span className="welcome-preview-url">ripple.app / overview</span>
      </div>
      <div className="welcome-preview-body">
        <div className="welcome-preview-stats">
          {MOCK_STATS.map((s) => (
            <div key={s.label} className="welcome-preview-stat">
              <span className={`welcome-preview-stat-val${s.accent ? " accent" : ""}`}>
                {s.value}
              </span>
              <span className="welcome-preview-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="welcome-preview-grid">
          <div className="welcome-preview-map" />
          <div className="welcome-preview-card" />
          <div className="welcome-preview-card" />
          <div className="welcome-preview-card wide" />
        </div>
      </div>
    </div>
  );
}
