# Ripple architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    UI[Next.js App Router]
    LDP[LiveDataProvider]
  end
  subgraph api [API Routes]
    SNAP[/api/snapshot]
    ING[/api/ingest/run]
  end
  subgraph data [Data layer]
    DS[getDataSource]
    MOCK[Mock store]
    PG[(Postgres + Drizzle)]
  end
  UI --> LDP
  LDP --> SNAP
  SNAP --> DS
  DS --> MOCK
  DS --> PG
  ING --> Pipeline[Ingest pipeline]
  Pipeline --> Normalizer[Normalizer]
  Pipeline --> DS
```

- **UI:** `(dashboard)` route group, client polling via `LiveDataProvider`.
- **API:** `{ asOf, data }` envelope on read routes; rate limiting in middleware.
- **Data:** `DATABASE_URL` selects Postgres; otherwise in-memory mock.
- **Ingest:** Adapter → normalizer → snapshot refresh (placeholders for real keys).

## Risk engine

The quantitative core (`src/lib/risk/`, `src/lib/scenario/`) turns raw signals into scored, tail-risk-quantified output.

```mermaid
flowchart LR
  SIG[Signal streams<br/>0–100 scores] --> CS[computeCompanyScore<br/>weights · tier · concentration]
  CS --> PM[Portfolio metrics<br/>risk index · CVaR base]
  CS --> BSS[buildScenarioSimulation<br/>score → disruption prob]
  BSS --> MC[simulatePortfolioLoss<br/>one-factor Vasicek MC<br/>10k trials, seeded]
  MC --> VR[VaR · CVaR/ES · P99<br/>diversification]
  GRAPH[Supplier graph BFS] --> SCN[Scenario run]
  MC --> SCN
  VR --> UI2[RiskMetricsPanel + loss histogram]
```

- **`normal.ts`** — Φ, Φ⁻¹ (Acklam), erf, analytic Expected Shortfall multipliers.
- **`random.ts`** — seeded mulberry32 PRNG + Box–Muller normals ⇒ reproducible runs.
- **`monte-carlo-engine.ts`** — one-factor Gaussian threshold model (Basel IRB / Vasicek); coherent, sub-additive VaR/CVaR with diversification accounting.
- **Validation** — `npm run evaluate` (Kupiec VaR backtest + property checks); 15 dedicated unit tests. See [docs/EVALUATION.md](./docs/EVALUATION.md) and [docs/RISK_METHODOLOGY.md](./docs/RISK_METHODOLOGY.md).
