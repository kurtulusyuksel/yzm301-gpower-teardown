# Independent SPEC implementation

Build from the workspace root:

```powershell
node node_modules/typescript/bin/tsc spec-only/engine.ts spec-only/cli.ts --target es2020 --module es2020 --strict --outDir spec-only/build --skipLibCheck
node --experimental-default-type=module spec-only/build/cli.js --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95
node --experimental-default-type=module spec-only/build/cli.js --test t-paired --mode post-hoc --tails 2 --dz 0.5 --alpha 0.05 --n 54
node --experimental-default-type=module spec-only/selftest.mjs
```

Success prints one JSON object containing n_total, actual_power, critical, df, ncp; failure prints an error object and exits 1. Numbers round to four decimal places, with JSON naturally omitting trailing zeros. The engine exports calculate(input) for reuse without invoking the CLI. A-priori searches from N=2 through N=1000000; post-hoc validates N in [3,2147483646]. All other validation follows SPEC.

Power is computed by integrating conditional normal rejection probabilities against the chi distribution for sqrt(chi-square(df)); adaptive Simpson integration uses 24 initial intervals and absolute error targets. Central t quantiles invert the regularized incomplete beta CDF. Gamma values use a Lanczos expansion, with a Stirling expression for stable chi normalization at larger df. The engine does not read data files or reference tables.

Limitations: finite precision and numerical quadrature are not a proof of accuracy at every admissible extreme. Very large post-hoc N and alpha near floating-point endpoints especially need independent verification. No MCP transport is included in this standalone implementation. The SPEC's documented G*Power large-N discrepancy remains an intentional search-limit error.
