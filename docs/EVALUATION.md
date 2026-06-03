# Evaluation & Evidence

Ripple's central quantitative claim is that its scenario engine produces **coherent, well-calibrated tail-risk numbers** (VaR / CVaR), not decorative charts. This document is the evidence for that claim. Everything here is reproducible:

```bash
npm run evaluate     # model-validation harness (the report below)
npm run test         # 48 unit tests, incl. 15 risk-engine property tests
```

The harness (`scripts/evaluate-risk-model.ts`) validates the engine the way a risk desk validates an internal model before production sign-off: structural coherence, Monte Carlo convergence, a statistical **backtest**, and stress sensitivity. It exits non-zero on any failure, so it can gate CI.

---

## 1. Coherence & reproducibility

| Check | Result |
|-------|--------|
| `CVaR ≥ VaR ≥ E[L] ≥ 0` | ✅ E[L]=$1.52B · VaR99=$6.19B · CVaR99=$6.79B |
| **Sub-additivity** (ES is coherent) | ✅ portfolio $6.79B ≤ Σ standalone $9.96B |
| Deterministic for a fixed seed | ✅ identical CVaR across runs |
| Diversification benefit positive | ✅ $3.17B tail removed (**31.8%**) |

Sub-additivity — portfolio risk never exceeding the sum of standalone risks — is the defining property of a *coherent* risk measure (Artzner et al., 1999). VaR famously violates it; CVaR / Expected Shortfall does not, and our implementation demonstrably preserves it.

> **A bug this caught:** the first cut computed each standalone CVaR from the *mean* loss-given-disruption, ignoring its tail. At 99% that understated standalone risk and made the portfolio appear to *violate* sub-additivity. The harness flagged it immediately; the fix (conditional-tail LGD mean, `standaloneCvar` in `monte-carlo-engine.ts`) restored coherence. This is exactly why the validation layer exists.

## 2. Convergence to the analytic expectation

E[L] must converge to the closed form Σ Eᵢ·pᵢ·μ_LGD (which holds regardless of correlation):

| Trials | Simulated E[L] | Rel. error |
|-------:|---------------:|-----------:|
| 500    | $1.45B | 5.7% |
| 2,000  | $1.48B | 3.5% |
| 10,000 | $1.52B | 1.1% |
| 50,000 | $1.52B | 1.0% |

Analytic target: **$1.53B**. The estimator is unbiased and converges at the expected √N rate. Production uses 10,000 trials (≈1% error) for sub-second runs.

## 3. VaR backtest — Kupiec POF coverage test

The decisive test: is the 99% VaR *actually* a 99% VaR? We compute model VaR99 from 40k trials, then draw **750 independent out-of-sample realizations** (fresh seeds) and count exceedances.

| Quantity | Value |
|----------|-------|
| Model VaR99 | $9.72B |
| Observed breaches | **5 / 750 (0.7%)** |
| Expected breaches | 7.5 (1.0%) |
| Kupiec LR_POF statistic | **0.954** |
| χ²₁ 95% critical value | 3.841 |

LR_POF = 0.954 < 3.841 ⇒ the null of correct coverage is **not rejected**. The VaR is statistically well-calibrated. (Kupiec, 1995, *proportion-of-failures* test — the standard regulatory VaR backtest.)

## 4. Stress sensitivity

| Severity | E[L] | VaR99 | CVaR99 | Diversification |
|---------:|-----:|------:|-------:|----------------:|
| 60%  | $1.50B | $7.43B | $8.26B  | −38.7% |
| 100% | $2.53B | $9.57B | $10.19B | −30.9% |
| 140% | $3.84B | $11.07B | $11.62B | −26.6% |

Two correct, *emergent* behaviors (neither is hardcoded):
1. Every tail metric rises monotonically with severity.
2. **Diversification benefit shrinks as severity rises** (−38.7% → −26.6%). Under stress, systemic correlation ρ increases, losses cluster, and diversification helps less — precisely the contagion dynamic the model is meant to capture.

---

## Limitations (honest disclosure)

- **Exposures and base scores are seeded demo data**, not live financial filings. The *engine* is real and validated; the *inputs* are representative. Wiring live exposures (SEC filings, market data) is the clear next step.
- **LGD is modeled as a truncated normal.** Real loss-given-default is often skewed (Beta). The normal assumption is transparent and conservative at the tail; a Beta-LGD upgrade is straightforward.
- **Single systemic factor.** A multi-factor model (region × sector) would capture cross-correlation structure the one-factor model averages over.
- **Disruption probabilities are score-derived**, not estimated from historical disruption frequencies. With a labeled event history, these could be fit directly.

These are modeling choices, stated plainly — not defects hidden behind a chart.

## References

- Artzner, Delbaen, Eber, Heath (1999), *Coherent Measures of Risk.*
- Kupiec (1995), *Techniques for Verifying the Accuracy of Risk Measurement Models.*
- Vasicek (2002), *The Distribution of Loan Portfolio Value.* / Basel II IRB.
