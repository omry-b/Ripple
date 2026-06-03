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

**CVaR95** / **CVaR99** — tail loss at the selected confidence level (`CvarLevelControl` in UI). The 99% level scales off the 95% base by the **textbook normal Expected Shortfall ratio** ES₉₉/ES₉₅ = φ(Φ⁻¹(.99))/.01 ÷ φ(Φ⁻¹(.95))/.05 ≈ **1.29** (`cvar-config.ts`, `normal.ts`), not an ad-hoc constant. Baseline compares current portfolio USD tail exposure to a **30-day rolling** proxy from `history30d` per company.

## Scenarios — Monte Carlo loss engine

Shocks specify **region**, **duration**, **severity**, and **confidence**. The loss distribution comes from a genuine **one-factor Gaussian threshold model** (`monte-carlo-engine.ts`) — the structure used in Basel IRB / CreditMetrics:

```
Xᵢ = √ρ·M + √(1−ρ)·Zᵢ ,   M, Zᵢ ~ N(0,1)          (M = shared systemic factor)
entity i disrupted  ⟺  Xᵢ < Φ⁻¹(pᵢ)                (Merton/Vasicek threshold)
loss if disrupted    = Eᵢ · LGD ,  LGD ~ N(μ, σ)    (loss-given-disruption)
portfolio loss L     = Σ lossᵢ      over N = 10,000 reproducible trials
```

- **Disruption probability** `pᵢ` is convex in the live company score and scaled by scenario severity (`buildScenarioSimulation`).
- **Systemic correlation** `ρ` and **loss severity** `μ` both rise with scenario severity, so tail events cluster — i.e. contagion. As a result the **diversification benefit shrinks under stress** (an emergent, not hardcoded, property).
- From the simulated distribution we read **Expected Loss**, **VaRα** (α-quantile) and **CVaRα / Expected Shortfall** (mean of the worst 1−α tail). CVaR is **coherent and sub-additive**: portfolio CVaR ≤ Σ standalone CVaR, and the gap is reported as the diversification benefit.

Contagion entities use **BFS** over supplier edges (`graph-propagation.ts`). Async runs queue in Postgres (`scenario_jobs`) and are drained by a Cloudflare cron worker.

Seeds are derived from `scenario:severity:duration:region:confidence`, so identical runs reproduce exactly while distinct parameters diverge.

## Validation

`npm run evaluate` runs the model-validation harness (coherence, convergence to the analytic mean, a **Kupiec POF VaR backtest**, and stress sensitivity). See [EVALUATION.md](./EVALUATION.md) for the latest report.

## Attribution

Score deltas surface primary drivers (e.g. “+9 due to Taiwan Strait”) from mock attribution rules until live factor decomposition ships.

See also the public page: `/methodology`.
