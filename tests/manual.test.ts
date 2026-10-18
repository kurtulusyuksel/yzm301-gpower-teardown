import assert from 'node:assert/strict';
import fs from 'node:fs';
import { calculatePairedTTest } from '../src/engine/t_paired.js';
import { calculatePairedTTest as independent } from '../cleanroom/t_paired.js';
// Official manual, section 19.3, printed p.48: effect sizes are displayed rounded.
// Use their full values derived from the documented group parameters.
const cases=[
  {id:'DOK-01',dz:.4/Math.sqrt(2-2*.55),power:.832114,ncp:2.981424},
  {id:'DOK-02',dz:.4/Math.sqrt(2),power:.500352},
];
const results=[];
for(const c of cases) {
  for(const [label,calc] of [['src/engine',calculatePairedTTest],['cleanroom',independent]] as const) {
    const actual=calc({test:'t-paired',mode:'post-hoc',tails:2,dz:c.dz,alpha:.05,n:50});
    assert.equal(actual.n_total,50); assert.equal(actual.df,49);
    assert.equal(actual.actual_power,Math.round(c.power*10000)/10000);
    assert.equal(actual.critical,2.0096);
    if(c.ncp)assert.equal(actual.ncp,Math.round(c.ncp*10000)/10000);
    results.push({id:c.id,implementation:label,actual});
  }
}
fs.writeFileSync('evidence/manual-comparison.json',JSON.stringify({
  source:'https://www.psychologie.hhu.de/fileadmin/redaktion/Fakultaeten/Mathematisch-Naturwissenschaftliche_Fakultaet/Psychologie/AAP/gpower/GPowerManual.pdf',
  section:'19.3, printed page 48',results},null,2)+'\n');
console.log('Manual: 2 documented examples pass for both implementations.');
