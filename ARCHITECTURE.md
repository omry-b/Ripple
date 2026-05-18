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
