import fs from 'node:fs';
import assert from 'node:assert/strict';
import {runLlmAgent} from './llm_agent.js';
const cases=[
  {id:'unsupported',query:'Kurgusal araştırmada ilaç alan hastalar ile ayrı plasebo grubunun ortalamasını karşılaştıracağız. Gruplar bağımsızdır. dz=0.5, alfa=0.05, güç=0.95, çift yönlü test için kaç kişi gerekir?'},
  {id:'missing',query:'Aynı kişilerin tedavi öncesi ve sonrası tansiyonunu karşılaştıracağız. Kaç hasta gerekir?'}
];
const rows=[];
for(const c of cases){const result=await runLlmAgent(c.query);rows.push({...result,caseId:c.id});fs.writeFileSync('evidence/ai-agent/live-negative-checks.json',JSON.stringify(rows,null,2)+'\n');}
fs.writeFileSync('evidence/ai-agent/live-negative-checks.json',JSON.stringify(rows,null,2)+'\n');
for(const r of rows){assert.equal(r.status,'needs_clarification',r.caseId);assert.equal(r.toolCalls.length,0,r.caseId+' must not calculate');}
console.log('Live LLM: unsupported family and missing parameters both ask the researcher; no calculation performed.');
