import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base=['--test','t-paired','--mode','a-priori','--tails','2','--d','.5','--alpha','.05','--power','.95'];
const cases=[
  ['--tails','2junk'],['--d','.5junk'],['--alpha','.05junk'],['--power','.95junk'],
  ['--power','.05'],['--power','.04'],['--power','1'],['--d','0'],['--alpha','0'],
];
for(const args of [...cases.map(c=>[...base,...c]),
  ['--test','t-paired','--mode','post-hoc','--tails','2','--d','.5','--alpha','.05','--n','3.5']]) {
  const r=spawnSync(process.execPath,['--import','tsx','src/cli.ts',...args],{encoding:'utf8'});
  if(r.error)throw r.error;
  assert.equal(r.status,1,JSON.stringify(args));
  assert.equal(typeof JSON.parse((r.stdout||r.stderr).trim()).error,'string');
}
console.log('CLI validation: 10 malformed or boundary inputs rejected with JSON and exit 1.');
