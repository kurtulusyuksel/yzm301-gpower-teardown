import { PairedTTestInput, PairedTTestOutput } from './types.js';
import { tInv, nctCdf } from './math.js';

/**
 * Validates inputs according to G*Power mathematical and binary-proven boundary constraints:
 * [REA] "effect size be greater than 0.00001"
 * [DOK] alpha in (0, 1)
 * [DOK] tails in {1, 2}
 * [DOK] a-priori: power in (alpha, 1)
 * [DOK] post-hoc: n >= 2 (integer)
 */
export function validatePairedInput(input: PairedTTestInput): void {
  if (input.test !== 't-paired') {
    throw new Error(`Unsupported test: '${input.test}'. Only 't-paired' is supported by this engine.`);
  }

  if (input.tails !== 1 && input.tails !== 2) {
    throw new Error(`Invalid tails: ${input.tails}. Tails must be 1 or 2.`);
  }

  if (isNaN(input.dz) || input.dz <= 0.00001) {
    throw new Error(`Invalid effect size dz (${input.dz}). Effect size must be greater than 0.00001.`);
  }

  if (isNaN(input.alpha) || input.alpha <= 0 || input.alpha >= 1) {
    throw new Error(`Invalid alpha (${input.alpha}). Alpha must be between 0 and 1.`);
  }

  if (input.mode === 'a-priori') {
    if (input.power === undefined || isNaN(input.power) || input.power <= input.alpha || input.power >= 1) {
      throw new Error(`Invalid power (${input.power}). For a-priori analysis, target power must be between alpha (${input.alpha}) and 1.0.`);
    }
  } else if (input.mode === 'post-hoc') {
    if (input.n === undefined || isNaN(input.n) || input.n < 2 || !Number.isInteger(input.n)) {
      throw new Error(`Invalid sample size n (${input.n}). For post-hoc analysis, total pairs n must be an integer >= 2.`);
    }
  } else {
    throw new Error(`Invalid calculation mode: '${input.mode}'. Must be 'a-priori' or 'post-hoc'.`);
  }
}

/**
 * Computes power for a given sample size N (number of pairs).
 */
export function computePowerForN(
  N: number,
  tails: 1 | 2,
  dz: number,
  alpha: number
): { actualPower: number; criticalT: number; df: number; ncp: number } {
  const df = N - 1;
  const ncp = dz * Math.sqrt(N);

  let criticalT: number;
  let actualPower: number;

  if (tails === 1) {
    // One-tailed: upper tail critical value t_{1-alpha, df}
    criticalT = tInv(1.0 - alpha, df);
    // Power = 1 - F(t_crit; df, delta)
    actualPower = 1.0 - nctCdf(criticalT, df, ncp);
  } else {
    // Two-tailed: upper tail critical value t_{1 - alpha/2, df}
    criticalT = tInv(1.0 - alpha / 2.0, df);
    // Power = 1 - F(t_crit; df, delta) + F(-t_crit; df, delta)
    const upperProb = 1.0 - nctCdf(criticalT, df, ncp);
    const lowerProb = nctCdf(-criticalT, df, ncp);
    actualPower = upperProb + lowerProb;
  }

  return {
    actualPower: Math.min(1.0, Math.max(0.0, actualPower)),
    criticalT,
    df,
    ncp
  };
}

/**
 * Executes Paired t-test Power Analysis (A Priori or Post Hoc).
 */
export function calculatePairedTTest(input: PairedTTestInput): PairedTTestOutput {
  validatePairedInput(input);

  if (input.mode === 'post-hoc') {
    const N = input.n!;
    const res = computePowerForN(N, input.tails, input.dz, input.alpha);
    return {
      n_total: N,
      actual_power: round4(res.actualPower),
      critical: round4(res.criticalT),
      df: res.df,
      ncp: round4(res.ncp)
    };
  }

  // Mode: a-priori -> Find minimal integer N >= 2 where actual_power >= target_power
  const targetPower = input.power!;
  let low = 2;
  let high = 10;

  // Exponential expansion to find upper bound
  while (true) {
    const res = computePowerForN(high, input.tails, input.dz, input.alpha);
    if (res.actualPower >= targetPower) {
      break;
    }
    low = high;
    high *= 2;
    if (high > 1000000) {
      throw new Error("Sample size search exceeded upper limit (1,000,000 pairs). Check input parameters.");
    }
  }

  // Binary search for exact integer threshold
  let bestN = high;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const res = computePowerForN(mid, input.tails, input.dz, input.alpha);
    if (res.actualPower >= targetPower) {
      bestN = mid;
      high = mid - 1; // Try to find smaller N
    } else {
      low = mid + 1; // Need larger N
    }
  }

  const finalRes = computePowerForN(bestN, input.tails, input.dz, input.alpha);

  return {
    n_total: bestN,
    actual_power: round4(finalRes.actualPower),
    critical: round4(finalRes.criticalT),
    df: finalRes.df,
    ncp: round4(finalRes.ncp)
  };
}

function round4(val: number): number {
  return Math.round(val * 10000) / 10000;
}
