import fs from 'node:fs';
import {createHash} from 'node:crypto';
const records=[];
const sha=raw=>createHash('sha256').update(raw).digest('hex');
for(const vector of JSON.parse(fs.readFileSync('oracle/gpower-gui.json','utf8'))) {
  const prefix='gui-'+vector.id.split('-')[1]+'-';
  const screens=fs.readdirSync('evidence').filter(n=>n.startsWith(prefix)&&n.endsWith('.jpg'));
  const screenshots=screens.map(name=>{
    const file='oracle/screenshots/'+name;
    fs.mkdirSync('oracle/screenshots',{recursive:true});
    fs.copyFileSync('evidence/'+name,file);
    return {path:file,sha256:sha(fs.readFileSync(file))};
  });
  records.push({...vector,screenshots});
}
for(const name of fs.readdirSync('evidence/gui-expanded').filter(n=>n.endsWith('.json')).sort()) {
  const file='evidence/gui-expanded/'+name,raw=fs.readFileSync(file);
  const capture=JSON.parse(raw);
  const tree=capture.accessibility.tree;
  if(!tree.includes('Value: Means: Difference between two dependent means (matched pairs) ID: 1001'))throw Error(file+' family');
  const field=id=>{const m=tree.match(new RegExp('Value: ([^\\r\\n]+?) ID: '+id+'(?:\\r?\\n|$)'));if(!m)throw Error(file+' control '+id);return m[1];};
  const mode=field(1002).startsWith('Post hoc:')?'post-hoc':'a-priori';
  const input={test:'t-paired',mode,tails:field(1040)==='Two'?2:1,dz:+field(1021),alpha:+field(1022),[mode==='post-hoc'?'n':'power']:+field(1023)};
  const error=tree.match(/metin ([^\r\n]+?) ID: 65535/);
  const expected=error?{error:error[1]}:{n_total:mode==='post-hoc'?input.n:+field(1053),actual_power:+field(mode==='post-hoc'?1053:1054),critical:+field(1051),df:+field(1052),ncp:+field(1050)};
  for(const obj of [input,expected])for(const value of Object.values(obj))if(typeof value==='number'&&!Number.isFinite(value))throw Error(file+' unfinished output');
  records.push({id:capture.id,capturedAt:capture.capturedAt,source:'G*Power 3.1.9.7 Windows GUI',evidence:file,evidence_sha256:sha(raw),input,expected,
    screenshots:capture.screenshots.map(path=>({path,sha256:sha(fs.readFileSync(path))}))});
}
records.sort((a,b)=>Number(a.id.split('-')[1])-Number(b.id.split('-')[1]));
fs.writeFileSync('oracle/gpower-expanded.json',JSON.stringify(records,null,2)+'\n');
const keys=['id','mode','tails','dz','alpha','power','n','n_total','actual_power','critical','df','ncp','error','evidence','screenshots'];
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
fs.writeFileSync('oracle/gpower-expanded.csv',keys.join(',')+'\n'+records.map(r=>{const flat={id:r.id,...r.input,...r.expected,evidence:r.evidence,screenshots:r.screenshots.map(s=>s.path).join(';')};return keys.map(k=>quote(flat[k])).join(',');}).join('\n')+'\n');
console.log(`${records.length} GUI vectors, ${records.filter(r=>r.screenshots.length).length} with screenshots. Original clean-room fixture is unchanged.`);
