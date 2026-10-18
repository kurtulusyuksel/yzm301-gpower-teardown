import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { calculatePairedTTest } from '../src/engine/t_paired.js';

const vectors=JSON.parse(fs.readFileSync('oracle/gpower-gui.json','utf8'));
assert.ok(vectors.length >= 8, 'Expected retained GUI captures including boundaries');
const differences=[];
let passed=0;
let knownLimitations=0;
for(const vector of vectors) {
  const raw=fs.readFileSync(vector.evidence);
  assert.equal(createHash('sha256').update(raw).digest('hex'),vector.evidence_sha256,vector.id+' evidence hash');
  const args=Object.entries(vector.input).flatMap(([key,value])=>['--'+key,String(value)]);
  if(vector.limitation) {
    assert.equal(vector.input.mode,'a-priori');
    assert.ok(vector.expected.n_total>1000000);
    assert.throws(()=>calculatePairedTTest(vector.input),/search exceeded upper limit/);
    assert.throws(()=>execFileSync(process.execPath,['--import','tsx','src/cli.ts',...args],{encoding:'utf8',stdio:'pipe'}),(error:any)=>{
      assert.equal(error.status,1);
      const payload=JSON.parse(String(error.stdout).trim() || String(error.stderr).trim());
      assert.match(payload.error,/search exceeded upper limit/);
      return true;
    });
    knownLimitations++;
    differences.push({id:vector.id,matched:false,limitation:vector.limitation});
    continue;
  }
  let cli;
  if(vector.expected.error) {
    const errorKind=vector.expected.error.toLowerCase().includes('effect size')?/effect size/i:/sample size/;
    assert.throws(()=>calculatePairedTTest(vector.input), errorKind);
    assert.throws(()=>execFileSync(process.execPath,['--import','tsx','src/cli.ts',...args],{encoding:'utf8',stdio:'pipe'}),(error:any)=>{
      assert.equal(error.status,1);
      const payload=JSON.parse(String(error.stdout).trim() || String(error.stderr).trim());
      assert.match(payload.error,errorKind);
      return true;
    });
    differences.push({id:vector.id,matched:'rejection'});
    passed++;
    continue;
  }
  cli=JSON.parse(execFileSync(process.execPath,['--import','tsx','src/cli.ts',...args],{encoding:'utf8'}));
  const result=calculatePairedTTest(vector.input);
  assert.deepEqual(cli,result,vector.id+' CLI/engine');
  const diffs:Record<string,number|string>={id:vector.id};
  for(const key of ['n_total','df','actual_power','critical','ncp']) {
    const expected=vector.expected[key];
    const rounded=Math.round(expected*10000)/10000;
    assert.equal(result[key as keyof typeof result],rounded,vector.id+' '+key);
    diffs[key]=Math.abs(result[key as keyof typeof result]-expected);
  }
  differences.push(diffs);
  passed++;
}
const result={source:'G*Power 3.1.9.7 GUI',count:vectors.length,passed,matchRate:passed/vectors.length,knownLimitations,precision:'exact after rounding GUI values to 4 decimals; N and df exact',differences};
fs.writeFileSync('evidence/gui-differential-results.json',JSON.stringify(result,null,2)+'\n');
console.log(`G*Power GUI comparison: ${passed}/${vectors.length} matched; ${knownLimitations} explicitly recorded incompatibility outside the local search range.`);
if(process.argv.includes('--require-full-match')) assert.equal(knownLimitations,0,'Full G*Power equivalence is not achieved: see retained limitations.');
