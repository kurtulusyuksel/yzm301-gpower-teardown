#!/usr/bin/env node

import { calculatePairedTTest } from './engine/t_paired.js';
import { PairedTTestInput } from './engine/types.js';

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  try {
    const test = args['test'] || 't-paired';
    if (test !== 't-paired') {
      throw new Error(`Invalid test family '${test}'. Supported test families: t-paired`);
    }

    const mode = args['mode'] as any;
    if (!mode || (mode !== 'a-priori' && mode !== 'post-hoc')) {
      throw new Error("Missing or invalid --mode. Must be 'a-priori' or 'post-hoc'.");
    }

    const tailsStr = args['tails'];
    if (!tailsStr) {
      throw new Error("Missing parameter: --tails (must be 1 or 2)");
    }
    const tails = Number(tailsStr) as 1 | 2;

    // Support both --dz and --d for Cohen's dz
    const dzStr = args['dz'] || args['d'];
    if (!dzStr) {
      throw new Error("Missing parameter: --dz or --d (effect size)");
    }
    const dz = Number(dzStr);

    const alphaStr = args['alpha'];
    if (!alphaStr) {
      throw new Error("Missing parameter: --alpha (significance level)");
    }
    const alpha = Number(alphaStr);

    let power: number | undefined;
    let n: number | undefined;

    if (mode === 'a-priori') {
      const powerStr = args['power'];
      if (!powerStr) {
        throw new Error("Missing parameter: --power for a-priori mode (e.g. 0.95)");
      }
      power = Number(powerStr);
    } else {
      const nStr = args['n'] || args['n-total'] || args['n_total'];
      if (!nStr) {
        throw new Error("Missing parameter: --n for post-hoc mode (total number of pairs)");
      }
      n = Number(nStr);
    }

    const input: PairedTTestInput = {
      test: 't-paired',
      mode,
      tails,
      dz,
      alpha,
      power,
      n
    };

    const output = calculatePairedTTest(input);
    // Single-line JSON output as required by CLI contract
    console.log(JSON.stringify(output));
    process.exit(0);
  } catch (err: any) {
    console.error(JSON.stringify({ error: err.message || String(err) }));
    process.exit(1);
  }
}

main();
