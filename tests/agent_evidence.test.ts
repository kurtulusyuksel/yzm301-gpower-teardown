import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=(p:string)=>JSON.parse(fs.readFileSync(p.replaceAll('\\','/'),'utf8').replace(/^\uFEFF/,''));
const sha=(p:string)=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const dataset=read('oracle/agent-evaluation.json');
const evaluation=read('evidence/ai-agent/evaluation.json');
const live=read('evidence/ai-agent/live-comparison.json');
assert.equal(dataset.length,10);assert.equal(live.rows.length,10);
let tokens=0,nCorrect=0,fullCorrect=0;
for(const c of dataset){
 const row=live.rows.find((r:any)=>r.id===c.id);assert.ok(row,c.id);
 const record=read(row.sharedIntentDecision);assert.equal(record.provider,'Ollama local');assert.equal(record.status,'answered');
 assert.equal(record.outputMode,'mcp_return_direct');assert.equal(record.query,c.question);
 for(const [key,value] of Object.entries(c.expectedParameters))assert.equal(record.parameters[key],value,c.id+' '+key);
 assert.equal(record.toolCalls.length,1);assert.equal(record.toolCalls[0].tool,'calculate_paired_power');
 const expected=Object.fromEntries(Object.entries(c.expected).map(([k,v])=>[k,Math.round(Number(v)*10000)/10000]));
 assert.deepEqual(record.result,expected);
 for(const r of record.modelCalls){assert.ok(Number.isInteger(r.response.prompt_eval_count));assert.ok(Number.isInteger(r.response.eval_count));tokens+=r.response.prompt_eval_count+r.response.eval_count;}
 const capture=read(row.gui.capture);assert.deepEqual(capture.parameters,record.parameters);
 assert.equal(sha(capture.screenshot),capture.screenshot_sha256);
 const tree=capture.accessibility.tree;
 const field=(id:number)=>{const m=tree.match(new RegExp('Value: ([^\\r\\n]+?) ID: '+id+'(?:\\r?\\n|$)'));assert.ok(m,c.id+' UI '+id);return m[1];};
 assert.match(field(1001),/two dependent means/);assert.match(tree,/Effect size dz ID: 1005/);
 assert.equal(Number(field(1021)),record.parameters.dz);assert.equal(Number(field(1022)),record.parameters.alpha);
 const post=record.parameters.mode==='post-hoc';assert.equal(field(1002).startsWith('Post hoc:'),post);
 assert.equal(Number(field(1023)),post?record.parameters.n:record.parameters.power);
 const raw={n_total:post?Number(field(1023)):Number(field(1053)),actual_power:Number(field(post?1053:1054)),critical:Number(field(1051)),df:Number(field(1052)),ncp:Number(field(1050))};
 for(const [key,value] of Object.entries(raw))assert.equal(Math.round(value*10000)/10000,expected[key],c.id+' actual GPower '+key);
 const matches=Object.entries(expected).map(([key,value])=>Math.round(row.gui.result[key]*10000)/10000===value);
 if(matches.every(Boolean))fullCorrect++;if(Math.round(row.gui.result.n_total)===expected.n_total)nCorrect++;
 assert.ok(capture.duration_ms>0);
}
assert.equal(tokens,live.mcp.tokens);assert.equal(live.mcp.correct,10);assert.equal(live.gui.correct,fullCorrect);assert.equal(live.gui.nCorrect,nCorrect);
assert.equal(evaluation.mcpCorrect,10);
const negative=read('evidence/ai-agent/live-negative-checks.json');assert.equal(negative.length,2);
for(const record of negative){assert.equal(record.status,'needs_clarification');assert.equal(record.toolCalls.length,0);assert.equal(record.result,undefined);}
console.log('Recorded AI evidence: 10 live MCP runs, real GUI inputs/results, screenshot hashes, token totals and accuracy counts verified. No model API used in this test.');
