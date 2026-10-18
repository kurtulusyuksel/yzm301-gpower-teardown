import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {calculatePairedTTest} from '../src/engine/t_paired.js';
import {calculatePairedTTest as independent} from '../cleanroom/t_paired.js';
const vectors=JSON.parse(fs.readFileSync('oracle/gpower-expanded.json','utf8'));
const rows:any[]=[];
let withScreenshots=0;
for(const v of vectors) {
  for(const artifact of [{path:v.evidence,sha256:v.evidence_sha256},...v.screenshots])
    assert.equal(createHash('sha256').update(fs.readFileSync(artifact.path)).digest('hex'),artifact.sha256,v.id+' artifact');
  if(v.screenshots.length)withScreenshots++;
  for(const [label,calc] of [['src/engine',calculatePairedTTest],['cleanroom',independent]] as const) {
    if(v.limitation){assert.throws(()=>calc(v.input),/search.*limit/i);rows.push({id:v.id,implementation:label,matched:false,reason:v.limitation});continue;}
    if(v.expected.error){assert.throws(()=>calc(v.input));rows.push({id:v.id,implementation:label,matched:true,kind:'rejection'});continue;}
    const actual=calc(v.input);
    const deltas:any={};
    for(const key of ['n_total','actual_power','critical','df','ncp'] as const) {
      const rounded=Math.round(v.expected[key]*10000)/10000;
      assert.equal(actual[key],rounded,v.id+' '+label+' '+key);
      deltas[key]=actual[key]-v.expected[key];
    }
    rows.push({id:v.id,implementation:label,matched:true,deltas});
  }
}
assert.ok(withScreenshots>=30,'Need at least 30 screenshot-backed GUI vectors');
const report={source:'G*Power GUI',count:vectors.length,withScreenshots,
  matchedPerImplementation:rows.filter(r=>r.matched).length/2,knownLimitationsPerImplementation:rows.filter(r=>!r.matched).length/2,rows};
fs.writeFileSync('evidence/expanded-gui-comparison.json',JSON.stringify(report,null,2)+'\n');
console.log(`Expanded GUI: ${report.matchedPerImplementation}/${vectors.length} matched per implementation; ${withScreenshots} screenshot-backed vectors.`);
