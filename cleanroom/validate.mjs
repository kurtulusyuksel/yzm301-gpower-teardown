import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { calculatePairedTTest } from './build/t_paired.js';
const fields=['actual_power','critical','ncp'];
let csvPassed=0, rejected=0, guiPassed=0;
const lines=readFileSync(new URL('../oracle/vectors.csv',import.meta.url),'utf8').trim().split(/\r?\n/);
const headers=lines.shift().split(',');
for(const line of lines){
  const row=Object.fromEntries(line.split(',').map((v,i)=>[headers[i],v]));
  const input={mode:row.mode,tails:+row.tails,dz:+row.dz,alpha:+row.alpha,...(row.mode==='post-hoc'?{n:+row.n_input}:{power:+row.power})};
  if(input.n===2){assert.throws(()=>calculatePairedTTest(input));rejected++;continue;}
  const actual=calculatePairedTTest(input);
  assert.equal(actual.n_total,+row.expected_n,line);assert.equal(actual.df,+row.df,line);
  for(const key of fields)assert.ok(Math.abs(actual[key]-Number(row[key]))<=.001,`${line}: ${key} ${actual[key]}`);
  csvPassed++;
}
for(const row of JSON.parse(readFileSync(new URL('../oracle/gpower-gui.json',import.meta.url),'utf8'))){
  if(row.expected.error||row.limitation){assert.throws(()=>calculatePairedTTest(row.input));rejected++;continue;}
  const actual=calculatePairedTTest(row.input);
  for(const key of ['n_total','df',...fields]) assert.equal(actual[key],Math.round(row.expected[key]*10000)/10000,`${row.id}: ${key}`);
  guiPassed++;
}
for(const input of [{mode:'post-hoc',tails:3,dz:.5,alpha:.05,n:10},{mode:'post-hoc',tails:2,dz:.5,alpha:1.5,n:10}])assert.throws(()=>calculatePairedTTest(input));
for(const n of [3,53,54,2147483646]) {
  const result=calculatePairedTTest({mode:'post-hoc',tails:2,dz:Number.MIN_VALUE,alpha:.05,n});
  assert.equal(result.actual_power,.05);assert.equal(result.n_total,n);
}
console.log(JSON.stringify({csvPassed,guiPassed,expectedFixtureRejections:rejected,extraValidation:'invalid tails/alpha, tiny dz, maximum N passed'}));
