import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

const names=(await fs.readdir('evidence')).filter(name=>/^gui-\d+-.*\.json$/.test(name)).sort();
const vectors=[];
for(const name of names) {
  const raw=await fs.readFile('evidence/'+name);
  const record=JSON.parse(raw.toString('utf8'));
  const tree=record.accessibility.tree;
  if(!tree.includes('Value: Means: Difference between two dependent means (matched pairs) ID: 1001')) throw Error('Wrong family: '+name);
  const field=id=>{
    const match=tree.match(new RegExp('Value: ([^\\r\\n]+?) ID: '+id+'(?:\\r?\\n|$)'));
    if(!match) throw Error('Missing control '+id+' in '+name);
    return match[1];
  };
  const mode=field(1002).startsWith('Post hoc:')?'post-hoc':'a-priori';
  const input={test:'t-paired',mode,tails:field(1040)==='Two'?2:1,dz:Number(field(1021)),alpha:Number(field(1022)),[mode==='post-hoc'?'n':'power']:Number(field(1023))};
  if(!Object.values(input).every(value=>typeof value!=='number'||Number.isFinite(value))) throw Error('Invalid input '+name);
  const error=tree.match(/metin ([^\r\n]+?) ID: 65535/);
  const expected=error?{error:error[1]}:{
    n_total:mode==='post-hoc'?input.n:Number(field(1053)),
    actual_power:Number(field(mode==='post-hoc'?1053:1054)),
    critical:Number(field(1051)), df:Number(field(1052)), ncp:Number(field(1050))
  };
  if(!Object.values(expected).every(value=>typeof value!=='number'||Number.isFinite(value))) throw Error('Unfinished GUI output '+name);
  const limitation=mode==='a-priori' && expected.n_total>1000000 ? 'Original G*Power result exceeds the local 1,000,000-pair search limit; retained as a known incompatibility, not a match.' : undefined;
  vectors.push({id:record.id,capturedAt:record.capturedAt,source:'G*Power 3.1.9.7 Windows GUI',evidence:'evidence/'+name,evidence_sha256:createHash('sha256').update(raw).digest('hex'),input,expected,...(limitation?{limitation}:{})});
}
if(!vectors.length)throw Error('No GUI evidence');
await fs.writeFile('oracle/gpower-gui.json',JSON.stringify(vectors,null,2)+'\n');
console.log(`${vectors.length} real G*Power GUI vectors generated from retained UI evidence.`);
