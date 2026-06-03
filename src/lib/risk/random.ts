/**
 * Deterministic, seedable pseudo-random number generator for the Monte Carlo
 * engine. Reproducibility matters: the same scenario + seed must always produce
 * the same loss distribution, so runs are auditable and testable. We use
 * `mulberry32` (fast, good statistical quality for simulation) plus a Box–Muller
 * transform for standard-normal draws.
 */

export type Rng = {
  /** Uniform draw in [0, 1). */
  next(): number;
  /** Standard-normal draw N(0, 1) via Box–Muller. */
  nextNormal(): number;
};

/** Hash an arbitrary string seed into a 32-bit integer (FNV-1a). */
export function hashSeed(seed: string | number): number {
  if (typeof seed === "number") return seed >>> 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — a compact, well-distributed 32-bit PRNG. */
export function makeRng(seed: string | number): Rng {
  let a = hashSeed(seed) || 1;
  let spare: number | null = null;

  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextNormal = (): number => {
    // Box–Muller: generate two normals per pair of uniforms, cache the spare.
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    let v = 0;
    // Avoid log(0).
    while (u === 0) u = next();
    while (v === 0) v = next();
    const mag = Math.sqrt(-2 * Math.log(u));
    spare = mag * Math.sin(2 * Math.PI * v);
    return mag * Math.cos(2 * Math.PI * v);
  };

  return { next, nextNormal };
}
