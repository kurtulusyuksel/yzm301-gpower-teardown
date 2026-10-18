import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {calculatePairedTTest as reference} from '../src/engine/t_paired.js';
import {calculate as calculatePairedTTest} from '../spec-only/engine.js';
const handoff=JSON.parse(fs.readFileSync('evidence/spec-only-handoff.json','utf8'));
for(const artifact of [...handoff.allowed_task_inputs,...handoff.independent_outputs])
  assert.equal(createHash('sha256').update(fs.readFileSync(artifact.path)).digest('hex'),artifact.sha256,artifact.path);
const vectors=JSON.parse(fs.readFileSync('oracle/gpower-expanded.json','utf8'));
const [header,...lines]=fs.readFileSync('oracle/statsmodels-vectors.csv','utf8').trim().split(/\r?\n/);
const fields=header.split(',');
for(const line of lines){const r=Object.fromEntries(line.split(',').map((v,i)=>[fields[i],v]));vectors.push({id:'STATSMODELS-'+vectors.length,input:{test:'t-paired',mode:r.mode,tails:+r.tails,dz:+r.dz,alpha:+r.alpha,...(r.mode==='post-hoc'?{n:+r.n_input}:{power:+r.power})}});}
const results=[];
for(const v of vectors){
  if(v.expected?.error||v.limitation){assert.throws(()=>calculatePairedTTest(v.input));results.push({id:v.id,kind:v.limitation?'known limitation':'expected input rejection'});continue;}
  const actual=calculatePairedTTest(v.input);
  assert.deepEqual(actual,reference(v.input),v.id);
  results.push({id:v.id,actual});
}
for(const [mode,args,status] of [['a-priori',['--power','.95'],0],['post-hoc',['--n','54'],0],['post-hoc',['--n','2'],1]] as const){
  const r=spawnSync(process.execPath,['--import','tsx','spec-only/cli.ts','--test','t-paired','--mode',mode,'--tails','2','--d','.5','--alpha','.05',...args],{encoding:'utf8'});
  if(r.error)throw r.error;
  assert.equal(r.status,status); const out=JSON.parse((r.stdout||r.stderr).trim());
  if(status===0)assert.equal(out.n_total,54);else assert.equal(typeof out.error,'string');
}
fs.writeFileSync('evidence/spec-only-comparison.json',JSON.stringify({count:results.length,cliChecks:3,results},null,2)+'\n');
console.log(`SPEC-only implementation: ${results.length} held-out contract checks + 3 CLI checks passed (known limitation kept explicit).`);
