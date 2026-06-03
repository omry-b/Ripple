/**
 * Standard-normal distribution utilities used by the risk engine.
 *
 * These are dependency-free numerical approximations chosen for accuracy:
 *   - normalCdf:        Abramowitz & Stegun 7.1.26 erf approximation (|err| < 1.5e-7)
 *   - normalInverseCdf: Peter Acklam's algorithm (|err| < 1.15e-9 over the full range)
 *
 * They underpin the one-factor portfolio loss model (Vasicek / Merton threshold
 * model) and the analytic Expected Shortfall multipliers.
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Standard-normal probability density φ(x). */
export function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/** error function erf(x), Abramowitz & Stegun 7.1.26 (|err| < 1.5e-7). */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

/** Standard-normal cumulative distribution Φ(x) = 0.5 · (1 + erf(x / √2)). */
export function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/**
 * Inverse standard-normal CDF Φ⁻¹(p), Peter Acklam's rational approximation.
 * Accurate to ~1e-9 absolute error across p ∈ (0, 1).
 */
export function normalInverseCdf(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  // Coefficients in rational approximations.
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

/**
 * Analytic Expected Shortfall multiplier for a standard normal at confidence α:
 *   ES_α / σ = φ(Φ⁻¹(α)) / (1 − α)
 *
 * This is the textbook ratio of a position's Expected Shortfall to its
 * volatility. Returns ~2.063 at 95% and ~2.665 at 99% — i.e. ES99 is ~1.29×
 * ES95, which is the correct relationship (the previous flat 1.18 understated
 * the tail).
 */
export function expectedShortfallMultiplier(confidence: number): number {
  const alpha = confidence > 1 ? confidence / 100 : confidence;
  const z = normalInverseCdf(alpha);
  return normalPdf(z) / (1 - alpha);
}
