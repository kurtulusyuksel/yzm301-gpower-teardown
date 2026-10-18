/**
 * Special Mathematical Functions for Noncentral Distribution Calculations.
 * Reconstructed according to G*Power mathematical foundations (Faul et al., 2007)
 * and Johnson & Kotz (1970) noncentral t-distribution integrals.
 */

// Error Function erf(x) via Chebyshev fitting / Abramowitz & Stegun
export function erf(x: number): number {
  // Constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

// Standard Normal Cumulative Distribution Function Phi(x)
export function normalCdf(x: number): number {
  return 0.5 * (1.0 + erf(x / Math.SQRT2));
}

// Standard Normal Inverse CDF (Probit / Quantile) via Peter John Acklam's algorithm
export function normalInv(p: number): number {
  if (p <= 0.0) return -Infinity;
  if (p >= 1.0) return Infinity;
  if (p === 0.5) return 0.0;

  // Coefficients in rational approximations
  const a = [
    -3.969683028665376e+01,
     2.209460984245205e+02,
    -2.759285104469687e+02,
     1.383577518672690e+02,
    -3.066479806614716e+01,
     2.506628277459239e+00
  ];

  const b = [
    -5.447609879822406e+01,
     1.615858368580409e+02,
    -1.556989798598866e+02,
     6.680131188771972e+01,
    -1.328068155288572e+01
  ];

  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
     4.374664141464968e+00,
     2.938163982698783e+00
  ];

  const d = [
     7.784695709041462e-03,
     3.224671290700398e-01,
     2.445134137142996e+00,
     3.754408661907416e+00
  ];

  const pLow = 0.02425;
  const pHigh = 1.0 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2.0 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0);
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0);
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2.0 * Math.log(1.0 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0);
  }
}

// Log Gamma ln(Gamma(x)) via Lanczos approximation (g=7, n=9)
export function logGamma(x: number): number {
  if (x <= 0) return NaN;
  const p = [
    0.99999999999980993,
    676.5203681218851,
   -1259.1392167224028,
    771.32342877765313,
   -176.61502916214059,
    12.507343278686905,
   -0.138571095857209,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  const g = 7;
  let z = x - 1;
  let xSum = p[0];
  for (let i = 1; i < p.length; i++) {
    xSum += p[i] / (z + i);
  }

  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(xSum);
}

// Student's t Cumulative Distribution Function
export function tCdf(t: number, df: number): number {
  if (df <= 0) return NaN;
  if (t === 0) return 0.5;

  const x = df / (df + t * t);
  const ib = incompleteBeta(0.5 * df, 0.5, x);
  if (t > 0) {
    return 1.0 - 0.5 * ib;
  } else {
    return 0.5 * ib;
  }
}

// Regularized Incomplete Beta Function I_x(a, b) via continued fraction
export function incompleteBeta(a: number, b: number, x: number): number {
  if (x < 0.0 || x > 1.0) return NaN;
  if (x === 0.0) return 0.0;
  if (x === 1.0) return 1.0;

  // Factor front
  const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1.0 - x) * b - lbeta);

  // Symmetry transformation for faster convergence
  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (front / a) * betaContinuedFraction(a, b, x);
  } else {
    return 1.0 - ((front / b) * betaContinuedFraction(b, a, 1.0 - x));
  }
}

function betaContinuedFraction(a: number, b: number, x: number): number {
  const maxIterations = 200;
  const eps = 1e-15;

  let c = 1.0;
  let d = 1.0 - (a + b) * x / (a + 1.0);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    // Even step
    let num = m * (b - m) * x / ((a + m2 - 1.0) * (a + m2));
    d = 1.0 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1.0 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1.0 / d;
    h *= d * c;

    // Odd step
    num = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1.0));
    d = 1.0 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1.0 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1.0 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1.0) < eps) {
      break;
    }
  }

  return h;
}

// Student's t Probability Density Function
export function tPdf(t: number, df: number): number {
  const lgammaDiff = logGamma(0.5 * (df + 1.0)) - logGamma(0.5 * df);
  const coef = Math.exp(lgammaDiff) / (Math.sqrt(Math.PI * df));
  return coef * Math.pow(1.0 + (t * t) / df, -0.5 * (df + 1.0));
}

// Inverse Student's t Distribution (Quantile t_inv) via Cornish-Fisher and Newton-Raphson
export function tInv(p: number, df: number): number {
  if (p <= 0.0) return -Infinity;
  if (p >= 1.0) return Infinity;
  if (p === 0.5) return 0.0;

  let flip = false;
  let targetP = p;
  if (targetP < 0.5) {
    targetP = 1.0 - targetP;
    flip = true;
  }

  const z = normalInv(targetP);
  const z2 = z * z;

  // Hill's initial approximation (CACM 396)
  const a = z * (1.0 + (z2 + 1.0) / (4.0 * df) + (5.0 * z2 * z2 + 16.0 * z2 + 3.0) / (96.0 * df * df));
  let t = a;

  // Newton-Raphson iterations
  for (let iter = 0; iter < 10; iter++) {
    const cdf = tCdf(t, df);
    const pdf = tPdf(t, df);
    const error = cdf - targetP;
    if (Math.abs(error) < 1e-15 || pdf <= 0) break;
    t -= error / pdf;
  }

  return flip ? -t : t;
}

// 64-point Gauss-Legendre Quadrature abscissas and weights on [-1, 1]
const GAUSS_NODES_64: number[] = [
  0.0243834510714777, 0.0731003444002685, 0.1216704729278046, 0.1699479374097486,
  0.2177884846429399, 0.2650499039328849, 0.3115840695840895, 0.3572459434399719,
  0.4018941793467470, 0.4453816580552885, 0.4875658094535213, 0.5283082810619902,
  0.5674751467332825, 0.6049362546081479, 0.6405668564757969, 0.6742468428448332,
  0.7058622101749947, 0.7353034907949392, 0.7624666579698748, 0.7872544586350170,
  0.8095751989320298, 0.8293489941795240, 0.8465022465349455, 0.8609689591386216,
  0.8726896594008020, 0.8816117032484430, 0.8876889064918867, 0.8908819060520589,
  0.8911578340762997, 0.8885008364775697, 0.8829023021965007, 0.8743605389524108,
  0.8628798634267602, 0.8484705572017540, 0.8311579758838199, 0.8109724708705521,
  0.7879483803601270, 0.7621240393087092, 0.7335427780210008, 0.7022528145290140,
  0.6683060019890384, 0.6317578044190844, 0.5926671665448380, 0.5510963503036720,
  0.5071110787595600, 0.4607804754050577, 0.4121772638541979, 0.3613778550150917,
  0.3084614992991049, 0.2535099543929841, 0.1966072570212711, 0.1378393535654555,
  0.0772942466016900, 0.0150617986036437
];

// Noncentral Student's t Cumulative Distribution Function (nctcdf)
// P(T <= t | df, delta) via numerical integration:
// Integral over chi-distribution Y: \int_0^\infty f_Y(y) * Phi(t * y / sqrt(df) - delta) dy
export function nctCdf(t: number, df: number, delta: number): number {
  if (df <= 0) return NaN;
  if (delta === 0) return tCdf(t, df);

  // Degrees of freedom parameters
  const sqrtDf = Math.sqrt(df);

  // Integration bounds covering 99.9999999999% of chi(df) distribution
  const a = Math.max(1e-12, sqrtDf - 8.0);
  const b = sqrtDf + 8.0 + Math.max(0, Math.abs(delta));

  const mid = 0.5 * (b + a);
  const half = 0.5 * (b - a);
  const logNorm = -(0.5 * df - 1.0) * Math.LN2 - logGamma(0.5 * df);

  let total = 0.0;
  // A fixed grid misses the narrow normal-CDF transition at small df and large
  // noncentrality (GUI-12). Bound the change in its argument per integration
  // step, retain an even Simpson grid, and cap work for extreme inputs.
  const requiredIntervals = Math.ceil((b - a) * Math.max(1, Math.abs(t) / sqrtDf) / 0.1);
  const nPoints = Math.min(32768, Math.max(96, requiredIntervals + requiredIntervals % 2));

  // Composite Simpson's / Gauss quadrature across [a, b]
  const step = (b - a) / nPoints;
  for (let i = 0; i <= nPoints; i++) {
    const y = a + i * step;
    if (y <= 0) continue;

    const logFy = logNorm + (df - 1.0) * Math.log(y) - 0.5 * y * y;
    const fy = Math.exp(logFy);
    const arg = (t * y) / sqrtDf - delta;
    const term = fy * normalCdf(arg);

    // Simpson weight: 1, 4, 2, 4, ..., 1
    const weight = (i === 0 || i === nPoints) ? 1.0 : (i % 2 === 1 ? 4.0 : 2.0);
    total += weight * term;
  }

  const result = total * (step / 3.0);
  return Math.min(1.0, Math.max(0.0, result));
}
