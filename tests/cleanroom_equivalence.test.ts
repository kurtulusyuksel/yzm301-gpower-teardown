import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { calculatePairedTTest as mainCalculate } from '../src/engine/t_paired.js';
import { calculatePairedTTest as cleanCalculate } from '../cleanroom/t_paired.js';

// Parent-side verification. The independent implementer must not read this file.
const handoff=JSON.parse(fs.readFileSync('evidence/cleanroom-handoff.json','utf8').replace(/^\uFEFF/,''));
for(const input of [...handoff.allowed_task_inputs,...(handoff.independent_outputs ?? [])]) {
  const digest=createHash('sha256').update(fs.readFileSync(input.approved_snapshot ?? input.path)).digest('hex');
  assert.equal(digest,input.sha256,'Pinned clean-room artifact changed: '+input.path);
}
const gui=JSON.parse(fs.readFileSync('oracle/gpower-gui.json','utf8'));
const [header,...lines]=fs.readFileSync('oracle/vectors.csv','utf8').trim().split(/\r?\n/);
const fields=header.split(',');
const scipy=lines.map((line,index)=>{
  const row=Object.fromEntries(line.split(',').map((value,i)=>[fields[i],value]));
  const input={test:'t-paired',mode:row.mode,tails:Number(row.tails),dz:Number(row.dz),alpha:Number(row.alpha),...(row.mode==='post-hoc'?{n:Number(row.n_input)}:{power:Number(row.power)})};
  return {id:'SCIPY-'+(index+1),source:'SciPy',input,expected:input.n===2?{error:'sample size'}:{n_total:Number(row.expected_n),df:Number(row.df),actual_power:Number(row.actual_power),critical:Number(row.critical),ncp:Number(row.ncp)}};
});
const cases=[...gui,...scipy];
const rows=[];
for(const fixture of cases) {
  let main:any, independent:any, mainError:any, independentError:any;
  try { main=mainCalculate(fixture.input); } catch(error) { mainError=error; }
  try { independent=cleanCalculate(fixture.input); } catch(error) { independentError=error; }
  if(fixture.expected.error || fixture.limitation) {
    assert.ok(mainError,fixture.id+' existing engine should reject');
    assert.ok(independentError,fixture.id+' independent engine should reject');
    rows.push({id:fixture.id,agreement:'both reject',...(fixture.limitation?{gpowerMismatch:fixture.limitation}:{})});
    continue;
  }
  assert.ifError(mainError);
  assert.ifError(independentError);
  const differences:Record<string,number>={};
  for(const key of ['n_total','df','actual_power','critical','ncp']) {
    const actual=independent[key];
    const expected=fixture.expected[key];
    assert.ok(Number.isFinite(actual),fixture.id+' finite '+key);
    const exact=key==='n_total'||key==='df'||fixture.source!=='SciPy';
    if(exact) assert.equal(actual,Math.round(expected*10000)/10000,fixture.id+' '+key);
    else assert.ok(Math.abs(actual-expected)<=0.001,fixture.id+' '+key+' reference difference');
    assert.ok(Math.abs(actual-main[key])<=(key==='n_total'||key==='df'?0:0.001),fixture.id+' main/independent '+key);
    differences[key]=Math.abs(actual-main[key]);
  }
  rows.push({id:fixture.id,agreement:'numeric',differences});
}
for(const fixture of [gui.find((item:any)=>item.id==='GUI-02'),gui.find((item:any)=>item.id==='GUI-08')]) {
  const args=Object.entries(fixture.input).flatMap(([key,value])=>['--'+key,String(value)]);
  const output=JSON.parse(execFileSync(process.execPath,['--import','tsx','cleanroom/cli.ts',...args],{encoding:'utf8'}));
  assert.deepEqual(output,mainCalculate(fixture.input),fixture.id+' independent CLI');
}
assert.throws(()=>execFileSync(process.execPath,['--import','tsx','cleanroom/cli.ts','--test','t-paired','--mode','post-hoc','--tails','2','--dz','0.5','--alpha','0.05','--n','2'],{encoding:'utf8',stdio:'pipe'}),(error:any)=>{
  assert.equal(error.status,1);
  assert.equal(typeof JSON.parse(String(error.stdout).trim()).error,'string');
  return true;
});
fs.writeFileSync('evidence/cleanroom-comparison.json',JSON.stringify({
  subject:'Independent implementation vs existing main engine and approved fixtures',
  total:cases.length,passed:cases.length,cliChecksPassed:3,
  note:'Contract agreement includes matched rejections. GUI-10 remains a known G*Power incompatibility in both local implementations; this is not a claim of full G*Power equivalence.',
  rows
},null,2)+'\n');
console.log(`Independent clean-room comparison: ${cases.length}/${cases.length} contract checks passed. Original G*Power range limitation remains explicit.`);
