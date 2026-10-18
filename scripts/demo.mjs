// Actual CLI subprocess recording; no terminal UI automation or fabricated output.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
fs.mkdirSync('demo',{recursive:true});
const stream=fs.createWriteStream('demo/cli.cast');
stream.write(JSON.stringify({version:2,width:108,height:28,timestamp:Math.floor(Date.now()/1000),
  title:'PairedLab: paired t-test CLI demonstration',env:{TERM:'xterm-256color',SHELL:'node'},
  note:'Actual CLI subprocess stdout/stderr recorded; display pauses are scripted.'})+'\n');
const start=performance.now();
function output(text){stream.write(JSON.stringify([(performance.now()-start)/1000,'o',text.replace(/\r?\n/g,'\r\n')])+'\n');}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
output('PairedLab | YZM301 | Educational paired-means t-test reimplementation\n');
output('Synthetic example: before/after blood pressure, dz = 10 / 20 = 0.5.\nN means patients / matched pairs.\n\n');
const commands=[
  {at:5,label:'Required pairs, two-sided, alpha=.05, target=.95',args:['--mode','a-priori','--power','.95'],cli:'src/cli.ts'},
  {at:18,label:'Achieved power for 54 matched pairs',args:['--mode','post-hoc','--n','54'],cli:'src/cli.ts'},
  {at:31,label:'Independent clean-room CLI: same planning question',args:['--mode','a-priori','--power','.95'],cli:'cleanroom/cli.ts'},
  {at:44,label:'Invalid post-hoc N=2: JSON error and nonzero exit',args:['--mode','post-hoc','--n','2'],cli:'src/cli.ts'},
];
const log=[];
for(const c of commands){
  await pause(Math.max(0,c.at*1000-(performance.now()-start)));
  const args=['--import','tsx',c.cli,'--test','t-paired','--tails','2','--d','.5','--alpha','.05',...c.args];
  output('\n'+c.label+'\n$ node '+args.join(' ')+'\n');
  const before=performance.now();
  const r=spawnSync(process.execPath,args,{encoding:'utf8'});
  if(r.error)throw r.error;
  output(r.stdout+r.stderr+'exit='+r.status+'\n');
  log.push({command:['node',...args],exit:r.status,stdout:r.stdout,stderr:r.stderr,duration_ms:performance.now()-before});
}
await pause(Math.max(0,57000-(performance.now()-start)));
output('\nReference evidence and known limits: README.md and LEDGER.md\n');
await pause(Math.max(0,60000-(performance.now()-start)));
output('End of 60-second CLI demonstration.\n');
stream.end();
fs.writeFileSync('demo/commands.json',JSON.stringify(log,null,2)+'\n');
console.log('Recorded demo/cli.cast and demo/commands.json');
