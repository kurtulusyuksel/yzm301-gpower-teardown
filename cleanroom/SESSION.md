# Clean-room implementation session — 2026-10-18

An independent implementation agent received a separate context and a strict read whitelist from its parent. Isolation was procedural and contextual on a shared filesystem, not operating-system file denial. The agent did not inspect the original executable, decompiler output, existing source, existing tests, README.md, LEDGER.md, evidence/, prompts/, or parent-side comparison code.

Task material actually read:

- `SPEC.md`
- `oracle/gpower-gui.json`
- `oracle/vectors.csv`

Workspace, cleanroom, and ancestor AGENTS.md existence checks found no applicable instruction files. The agent created and inspected only its own cleanroom artifacts in addition to the approved task material. Installed Node and TypeScript tooling was executed without inspecting its source. An initial CommonJS CLI invocation failed because Node reported that the enclosing package has `type: module`; this incidental runtime metadata was not a deliberate read of package.json or exposure to the original implementation. The build was switched to ES modules. No non-whitelisted implementation material was read.

The mathematical implementation was independently authored in `t_paired.ts`, with CLI in `cli.ts`, fixture validation in `validate.mjs`, and generated ES modules in `build/`. It uses conditional normal/chi-square integration and integer bisection. It contains no copied fixture outputs or original-project imports.

Validation commands:

```powershell
node node_modules/typescript/bin/tsc cleanroom/t_paired.ts cleanroom/cli.ts --target es2020 --module es2020 --strict --outDir cleanroom/build --skipLibCheck
node cleanroom/validate.mjs
```

Round 1 compilation passed in strict mode. Round 1 final validation output:

```json
{"csvPassed":105,"guiPassed":7,"expectedFixtureRejections":4,"extraValidation":"invalid tails/alpha, tiny dz, maximum N passed"}
```

The 106th CSV record is mathematical N=2 and was correctly rejected by the public API. GUI-05 and GUI-09 were expected input rejections; GUI-10 was the expected local search-limit rejection. The seven other GUI records matched all five rounded fields. CSV results matched exact N/df and numeric tolerance 0.001. Additional tests checked invalid tails and alpha, and `Number.MIN_VALUE` positive dz at N=3,53,54,2147483646 (power rounds to alpha).

Real CLI commands through the execution tool checked post-hoc dz=.5, alpha=.05, tails=2: N=54 returned the expected five fields and exit 0; N=2 returned JSON error and exit 1. An earlier attempt to spawn CLI subprocesses inside the Node validation process was unavailable in the sandbox (null child status); those subprocess checks were removed and executed directly through the execution tool instead. Initial numeric fixture assertions had already passed before that runner failure.

Residual limitations: the a-priori 1,000,000 bound intentionally excludes GUI-10; finite-precision integration and extreme alpha/dz inputs have not received exhaustive accuracy verification. The standalone implementation has no MCP transport. Main project files were preserved. See `USAGE.md` for the numeric method and usage.

## Round 2: revised black-box acceptance feedback

The parent supplied two additional numeric GUI observations and revised the approved contract. This agent reread only updated `SPEC.md` and `oracle/gpower-gui.json`, then edited only cleanroom artifacts. The unchanged approved CSV was reread by validation. No existing main implementation, tests, evidence, or parent-side comparison code was inspected.

GUI-11 rejects a-priori dz=100; GUI-12 accepts dz=20 and returns N=2. The revised spec distinguishes the a-priori minimum N=2 from the post-hoc input minimum N=3 and sets the a-priori dz interval to [0.00001,20]. The implementation now searches from N=2 and enforces that dz interval. To evaluate the newly exercised df=1 case accurately, the quadrature uses the analytic finite square-root chi-square density limit at zero; it previously returned zero at that endpoint, appropriate for df>1. This change is a mathematical endpoint correction, not a fixture-specific return.

The same strict compile and full validation commands above passed again. Round 2 output:

```json
{"csvPassed":105,"guiPassed":8,"expectedFixtureRejections":5,"extraValidation":"invalid tails/alpha, tiny dz, maximum N passed"}
```

GUI-12 independently computed `{ "n_total":2, "df":1, "ncp":28.2843, "critical":12.7062, "actual_power":0.9735 }`, matching every rounded field. GUI-11 correctly raises the effect-range error. Direct CLI checks confirmed a-priori dz=20 success exit 0, a-priori dz=100 error exit 1, and continued post-hoc N=2 error exit 1. The CSV mathematical N=2 row remains a post-hoc rejection. Original round 1 results are retained above.

No unresolved numerical issue appeared in the revised fixtures. The prior search-bound, finite-precision/extreme-input, and absent-MCP limitations remain. Implementation and generated build files are stable after this round.
