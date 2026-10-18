import { execFileSync } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { PairedTTestInput } from '../src/engine/types.js';

function runCli(args: string[]): any {
  const out = execFileSync(process.execPath, ['--import', 'tsx', 'src/cli.ts', ...args], { encoding: 'utf-8' }).trim();
  return JSON.parse(out);
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
    { test: 't-paired', mode: 'post-hoc', tails: 1, dz: 0.4, alpha: 0.05, n: 30 },
    { test: 't-paired', mode: 'post-hoc', tails: 2, dz: 0.00001, alpha: 0.05, n: 3 },
    { test: 't-paired', mode: 'post-hoc', tails: 2, dz: 0.000005, alpha: 0.05, n: 3 },
    { test: 't-paired', mode: 'a-priori', tails: 2, dz: 20, alpha: 0.05, power: 0.95 }
  ];

  let passed = 0;
  const client = new Client({ name: 'equivalence-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', 'tsx', 'src/mcp/server.ts']
  });

  try {
  await client.connect(transport);
  const listed = await client.listTools();
  if (!listed.tools.some(tool => tool.name === 'calculate_paired_power')) {
    throw new Error('MCP tool not advertised');
  }
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const cliArgs = [
      '--test', tc.test,
      '--mode', tc.mode,
      '--tails', String(tc.tails),
      '--dz', String(tc.dz),
      '--alpha', String(tc.alpha)
    ];
    if (tc.mode === 'a-priori') {
      cliArgs.push('--power', String(tc.power));
    } else {
      cliArgs.push('--n', String(tc.n));
    }

    const cliResult = runCli(cliArgs);
    const response = await client.callTool({ name: 'calculate_paired_power', arguments: { ...tc } });
    if (response.isError) throw new Error(JSON.stringify(response));
    const content = response.content as Array<{ type: string; text?: string }>;
    const payload = content.find(item => item.type === 'text');
    if (!payload?.text) throw new Error('Missing MCP result');
    const mcpResult = JSON.parse(payload.text);

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
  } finally {
    await client.close();
    await transport.close();
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
