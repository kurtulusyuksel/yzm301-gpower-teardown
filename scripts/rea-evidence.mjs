import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

// Local, read-only analysis. No decompiler output is written to this repository.
const client = new Client({name:'gpower-evidence',version:'1.0.0'});
const target = process.env.GPOWER_BINARY ?? 'C:/Users/kurtulus/Downloads/GPowerWin_3.1.9.7/GPower_3.1.9.7_143/GPowerNT.exe';
const entrypoint = process.env.REA_ENTRYPOINT ?? path.join(process.env.APPDATA ?? 'C:/Users/kurtulus/AppData/Roaming','npm/node_modules/rea-agents/scripts/rea.mjs');
const transport = new StdioClientTransport({
  command:process.execPath,
  args:[entrypoint,'mcp'],
  env:{...process.env, GHIDRA_INSTALL_DIR:process.env.GHIDRA_INSTALL_DIR ?? 'C:/Tools/ghidra_12.1.2_PUBLIC', JAVA_HOME:process.env.JAVA_HOME ?? 'C:/Program Files/Eclipse Adoptium/jdk-21.0.12.101-hotspot'}
});
try {
  await client.connect(transport);
  const listed=await client.listTools();
  const selected=listed.tools.filter(t=>/^(open_binary|search_strings|search_procedures|xrefs|list_xrefs|analyze_function|binary_session|get_function|trace_feature)$/.test(t.name));
  await fs.writeFile('evidence/rea-tool-schemas.json',JSON.stringify(selected.map(({name,inputSchema,annotations})=>({name,inputSchema,annotations})),null,2));
  console.log('REA tool schemas saved.');
  if (process.argv.includes('--collect') || process.argv.includes('--deep') || process.argv.includes('--paired') || process.argv.includes('--route')) {
    async function call(name,args,file) {
      const result=await client.callTool({name,arguments:args},undefined,{timeout:600000});
      if(result.isError) throw new Error(JSON.stringify(result));
      let evidence=result.structuredContent ?? JSON.parse(result.content.find(c=>c.type==='text').text);
      if(name==='analyze_function') {
        const value=evidence.normalized_result;
        evidence={projection:'metadata-only; pseudocode and assembly excluded',source_evidence_id:evidence.evidence_id,source_sha256:createHash('sha256').update(JSON.stringify(evidence)).digest('hex'),subject:evidence.subject,provider:evidence.provider,parameters:evidence.parameters,procedure:value.procedure,callers:value.callers,callees:value.callees,incoming_references:value.incoming_references,outgoing_references:value.outgoing_references,referenced_strings:value.referenced_strings,referenced_names:value.referenced_names,limitations:evidence.limitations};
      }
      await fs.writeFile('evidence/'+file,JSON.stringify(evidence,null,2));
      console.log(file+' saved');
      return evidence;
    }
    await call('open_binary',{path:target,provider_id:'ghidra'},'rea-open.json');
    if(process.argv.includes('--route')) {
      const seen=new Set();
      for(const procedure of ['0x4dace0','0x4db950','0x4dc1b0','0x4bdee0','0x4d38b0','0x4bde30','0x4d37f0','0x4d3830','0x4968d0','0x497710']) {
        const metadata=await call('analyze_function',{procedure},'rea-dispatch-'+procedure+'-metadata.json');
        for(const callee of metadata.callees.filter(item=>/^0x4f/.test(item.address)).slice(0,6)) {
          if(seen.has(callee.address))continue;
          seen.add(callee.address);
          await call('analyze_function',{procedure:callee.address},'rea-dispatch-numeric-'+callee.address+'-metadata.json');
        }
      }
    } else if(process.argv.includes('--paired')) {
      // Exact addresses obtained from the retained paired-test descriptor references.
      // Read-only metadata projections; no source, assembly, or pseudocode is exported.
      for(const procedure of ['0x4dc230','0x4dcd60','0x4dc2a0','0x4db730','0x4db990','0x4fb440','0x4f9fa0','0x4dc9d0','0x4dc0b0','0x4dbdc0','0x4dc130','0x4d2370']) {
        const metadata=await call('analyze_function',{procedure},'rea-paired-'+procedure+'-metadata.json');
        if(procedure==='0x4dc9d0') {
          for(const callee of metadata.callees.filter(item=>/^0x4f/.test(item.address)).slice(0,6)) {
            await call('analyze_function',{procedure:callee.address},'rea-paired-route-'+callee.address+'-metadata.json');
          }
        }
      }
      await call('search_strings',{pattern:'PowerT'},'rea-power-t-types.json');
      await call('xrefs',{address:'0x5cacd8'},'rea-paired-dispatch-xrefs.json');
    } else {
    const strings=await call('search_strings',{pattern:'matched pairs'},'rea-matched-strings.json');
    await call('search_strings',{pattern:'nct'},'rea-nct-strings.json');
    await call('search_strings',{pattern:'0.00001'},'rea-limit-strings.json');
    await call('search_procedures',{pattern:'nct'},'rea-nct-procedures.json');
    // Cross references only: never export decompiler bodies.
    function addresses(value) {
      if (!value || typeof value!=='object') return [];
      return Object.entries(value).flatMap(([key,item])=>key==='address' && typeof item==='string' && /^0x/.test(item) ? [item] : addresses(item));
    }
    for (const address of [...new Set(addresses(strings))].slice(0,8)) {
      await call('xrefs',{address},'rea-xrefs-'+address+'.json');
    }
    if(process.argv.includes('--deep')) {
      await call('analyze_function',{procedure:'0x4dcf10'},'rea-paired-descriptor-metadata.json');
      await call('xrefs',{address:'0x5e37dc'},'rea-nctcdf-xrefs.json');
      await call('search_strings',{pattern:'TDist-Cdf'},'rea-tdist-strings.json');
      // Fixed read-only queries only. No queued commands, dynamic tool names, or polling.
      const trace=await call('trace_feature',{query:'TDist-Cdf'},'rea-tdist-trace.json');
      const refs=trace.normalized_result?.references ?? [];
      const entries=[...new Set(refs.map(ref=>ref.containing_procedure?.procedure?.address).filter(Boolean))];
      for(const procedure of entries.slice(0,6)) {
        await call('analyze_function',{procedure},'rea-kernel-'+procedure+'-metadata.json');
      }
    }
    }
  }
} finally { await client.close(); await transport.close(); }
