import { execSync } from 'child_process';
import { calculatePairedTTest } from '../src/engine/t_paired.js';
import { PairedTTestInput } from '../src/engine/types.js';

function runCli(args: string[]): any {
  const cmd = `npx tsx src/cli.ts ${args.join(' ')}`;
  const out = execSync(cmd, { encoding: 'utf-8' }).trim();
  return JSON.parse(out);
}

function runMcpEngine(input: PairedTTestInput): any {
  return calculatePairedTTest(input);
}

async function testEquivalence() {
  console.log("=========================================================================");
  console.log("  YZM301 TEARDOWN SPRINT: CLI & MCP EŞDEĞERLİK TESTİ (THIN ADAPTER)       ");
  console.log("=========================================================================\n");

  const testCases: PairedTTestInput[] = [
    { test: 't-paired', mode: 'a-priori', tails: 2, dz: 0.5, alpha: 0.05, power: 0.95 },
    { test: 't-paired', mode: 'a-priori', tails: 1, dz: 0.8, alpha: 0.05, power: 0.80 },
    { test: 't-paired', mode: 'a-priori', tails: 2, dz: 0.2, alpha: 0.01, power: 0.90 },
    { test: 't-paired', mode: 'post-hoc', tails: 2, dz: 0.5, alpha: 0.05, n: 54 },
    { test: 't-paired', mode: 'post-hoc', tails: 1, dz: 0.4, alpha: 0.05, n: 30 }
  ];

  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const cliArgs = [
      `--test ${tc.test}`,
      `--mode ${tc.mode}`,
      `--tails ${tc.tails}`,
      `--dz ${tc.dz}`,
      `--alpha ${tc.alpha}`
    ];
    if (tc.mode === 'a-priori') {
      cliArgs.push(`--power ${tc.power}`);
    } else {
      cliArgs.push(`--n ${tc.n}`);
    }

    const cliResult = runCli(cliArgs);
    const mcpResult = runMcpEngine(tc);

    const matches =
      cliResult.n_total === mcpResult.n_total &&
      cliResult.actual_power === mcpResult.actual_power &&
      cliResult.critical === mcpResult.critical &&
      cliResult.df === mcpResult.df &&
      cliResult.ncp === mcpResult.ncp;

    if (matches) {
      passed++;
      console.log(`[PASS] Case ${i + 1} (${tc.mode}, tails=${tc.tails}, dz=${tc.dz}): CLI ve MCP çıktıları birebir özdeş.`);
    } else {
      console.error(`[FAIL] Case ${i + 1} mismatch:`, { cliResult, mcpResult });
    }
  }

  console.log("\n-------------------------------------------------------------------------");
  console.log(`Sonuç: ${passed}/${testCases.length} eşdeğerlik testi başarılı.`);
  console.log("Motor mimarisi: Tekil paylaşımlı hesaplama motoru (DRY ilkesi sağlandı).");
  console.log("=========================================================================\n");

  if (passed !== testCases.length) {
    process.exit(1);
  }
}

testEquivalence().catch((err) => {
  console.error(err);
  process.exit(1);
});
