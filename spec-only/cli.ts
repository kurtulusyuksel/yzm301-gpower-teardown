import { calculate, Input } from './engine.js';
declare const process: { argv:string[]; exitCode:number };
try {
  const args=process.argv.slice(2), values:Record<string,string>={};
  const allowed=new Set(['test','mode','tails','d','dz','alpha','power','n']);
  for(let i=0;i<args.length;i+=2){const key=args[i].startsWith('--')?args[i].slice(2):'';if(!allowed.has(key)||i+1>=args.length||values[key]!==undefined)throw Error('invalid, missing, or duplicate CLI argument');values[key]=args[i+1];}
  if(values.test!=='t-paired')throw Error('--test must be t-paired');
  if(values.d!==undefined&&values.dz!==undefined)throw Error('provide only one of --d or --dz');
  const input:Input={mode:values.mode as Input['mode'],tails:Number(values.tails),dz:Number(values.dz??values.d),alpha:Number(values.alpha),power:values.power===undefined?undefined:Number(values.power),n:values.n===undefined?undefined:Number(values.n)};
  console.log(JSON.stringify(calculate(input)));
} catch(error){console.log(JSON.stringify({error:error instanceof Error?error.message:String(error)}));process.exitCode=1;}
