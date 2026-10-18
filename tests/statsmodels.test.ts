import fs from 'node:fs';
import assert from 'node:assert/strict';
import { calculatePairedTTest } from '../src/engine/t_paired.js';
import { calculatePairedTTest as independent } from '../cleanroom/t_paired.js';

const lines=fs.readFileSync('oracle/statsmodels-vectors.csv','utf8').trim().split(/\r?\n/);
const headers=lines.shift()!.split(',');
const differences:any[]=[];
let count=0;
for(const line of lines) {
  const row=Object.fromEntries(line.split(',').map((v,i)=>[headers[i],v]));
  const input:any={test:'t-paired',mode:row.mode,tails:Number(row.tails),dz:Number(row.dz),alpha:Number(row.alpha),
    ...(row.mode==='a-priori'?{power:Number(row.power)}:{n:Number(row.n_input)})};
  for(const [label,calc] of [['src/engine',calculatePairedTTest],['cleanroom',independent]] as const) {
    const result=calc(input);
    for(const [key,column] of [['n_total','expected_n'],['df','df'],['actual_power','actual_power'],['critical','critical'],['ncp','ncp']] as const) {
      const expected=Number(row[column]);
      const rounded=Math.round(expected*10000)/10000;
      const actual=result[key];
      if(actual!==rounded) differences.push({row:count+1,implementation:label,input,field:key,expected:rounded,actual});
    }
  }
  count++;
}
fs.writeFileSync('evidence/statsmodels-comparison.json',JSON.stringify({source:'statsmodels, not G*Power GUI',vectors:count,implementations:2,differences},null,2)+'\n');
assert.ok(count>500);
assert.equal(differences.length,0,JSON.stringify(differences.slice(0,10)));
console.log(`statsmodels: ${count} vectors, both implementations exact at four decimals; N/df exact.`);
