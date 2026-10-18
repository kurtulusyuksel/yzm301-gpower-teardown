#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { calculatePairedTTest } from '../engine/t_paired.js';
import { PairedTTestInput } from '../engine/types.js';

/**
 * G*Power Paired t-Test MCP Server
 * Clean thin adapter layer invoking the core engine directly.
 */
const GPOWER_PAIRED_TOOL: Tool = {
  name: 'calculate_paired_power',
  description: 'Calculates statistical power or required sample size (pairs) for dependent means t-tests (paired samples t-test, e.g. pre-post clinical studies) according to G*Power algorithms.',
  inputSchema: {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['a-priori', 'post-hoc'],
        description: "'a-priori' to compute required sample size (pairs) for given power; 'post-hoc' to compute achieved power for given sample size."
      },
      tails: {
        type: 'number',
        enum: [1, 2],
        description: 'Direction of hypothesis: 1 for one-tailed (directional) or 2 for two-tailed (non-directional).'
      },
      dz: {
        type: 'number',
        description: "Cohen's dz effect size. Post-hoc: > 0; a-priori: [0.00001, 20]. Local a-priori search is limited to 1,000,000 pairs."
      },
      alpha: {
        type: 'number',
        description: 'Type I error probability (alpha significance level, typically 0.05).'
      },
      power: {
        type: 'number',
        description: 'Target statistical power (1 - beta) for a-priori analysis (e.g. 0.80 or 0.95).'
      },
      n: {
        type: 'number',
        description: 'Total number of pairs for post-hoc analysis (integer in [3, 2147483646]).'
      }
    },
    required: ['mode', 'tails', 'dz', 'alpha']
  }
};

async function startServer() {
  const server = new Server(
    {
      name: 'gpower-mcp-server',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [GPOWER_PAIRED_TOOL]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: toolArgs } = request.params;

    if (name !== 'calculate_paired_power') {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const input: PairedTTestInput = {
        test: 't-paired',
        mode: toolArgs?.['mode'] as any,
        tails: Number(toolArgs?.['tails']) as 1 | 2,
        dz: Number(toolArgs?.['dz'] ?? toolArgs?.['d']),
        alpha: Number(toolArgs?.['alpha']),
        power: toolArgs?.['power'] !== undefined ? Number(toolArgs?.['power']) : undefined,
        n: toolArgs?.['n'] !== undefined ? Number(toolArgs?.['n']) : undefined
      };

      const result = calculatePairedTTest(input);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message || String(error) })
          }
        ]
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch((err) => {
  console.error('Fatal MCP Server Error:', err);
  process.exit(1);
});
