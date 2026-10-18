# Independent paired t calculation

API: `calculatePairedTTest(input)` exported from `t_paired.ts`. Input fields are `mode` (`a-priori` or `post-hoc`), `tails` (1 or 2), `dz`, `alpha`, and respectively `power` or `n`. The optional `test` field must be `t-paired`. Results contain `n_total`, `actual_power`, `critical`, `df`, and `ncp`; continuous values are rounded to four decimals. Invalid inputs throw an Error.

From the workspace root, compile and validate:

```powershell
node node_modules/typescript/bin/tsc cleanroom/t_paired.ts cleanroom/cli.ts --target es2020 --module es2020 --strict --outDir cleanroom/build --skipLibCheck
node cleanroom/validate.mjs
node cleanroom/build/cli.js --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95
```

CLI success writes one JSON line and exits 0. Errors write one JSON line and exit 1. `--dz` and `--d` both specify dz.

The implementation conditions on chi-square variance: `T=(Z+delta)/sqrt(V/df)`. It integrates the corresponding normal rejection probabilities against the square-root chi-square density using adaptive Simpson quadrature. The integration variable scales fluctuations around 1 to maintain accuracy at large df. Central t critical values use the same integral with delta zero and bisection. A-priori calculation brackets and bisects integer N using unrounded power; its minimum N is 2. The df=1 density has an explicit analytic endpoint limit. The bounded quantile cache contains only computed numerical results.

The implementation reads no reference fixtures at runtime. Validation reads the two approved fixture files and compares exact N/df, CSV numeric fields within 0.001, and supported GUI numeric fields after rounding to four decimals. No fixture numbers are embedded in the algorithm.

Post-hoc requires positive finite dz and integer N in [3, 2147483646]. A-priori requires dz in [0.00001,20] and alpha < power < 1, and searches N from 2 through at most 1,000,000 pairs. GUI-10 exceeds that limit and deliberately produces a range error. Extremely small tail probabilities, overflow-scale dz, and every possible point in the accepted numeric domain have not been independently validated. Integration truncates standardized variance fluctuations to [-12,16] (and the physical lower boundary); this is numerical quadrature, not arbitrary-precision computation. No MCP adapter is included in this standalone candidate.

The actual read boundary and validation results are recorded in `SESSION.md`.
