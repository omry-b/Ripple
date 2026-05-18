# Ripple risk methodology (internal)

## Signal layer

Each **signal stream** (logistics, geopolitical, financial, weather, AIS) produces a 0–100 score from normalized ingest events. Category weights are configurable in `src/lib/risk/weights.ts`.

## Company score

`computeCompanyScore()` blends:

- Weighted signal exposure for the company’s region and tier
- Tier multiplier (Tier 1 suppliers weigh more on downstream OEMs)
- Concentration factor from supplier graph degree

Outputs include a **confidence band** (± points) when reading coverage is thin.

## Portfolio CVaR

**CVaR95** / **CVaR99** — tail loss at the selected confidence level (`CvarLevelControl` in UI). Baseline compares current portfolio USD tail exposure to a **30-day rolling** proxy from `history30d` per company.

## Scenarios

Shocks specify **region**, **duration**, and **severity**. Contagion uses **BFS** over supplier edges (`graph-propagation.ts`). Loss distribution uses 12-bin Monte Carlo (`monte-carlo.ts`). Async runs queue in-memory (`job-queue.ts`) for worker migration later.

## Attribution

Score deltas surface primary drivers (e.g. “+9 due to Taiwan Strait”) from mock attribution rules until live factor decomposition ships.

See also the public page: `/methodology`.
