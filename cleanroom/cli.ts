import { calculatePairedTTest, type PairedInput } from './t_paired.js';
declare const process: { argv:string[]; exitCode:number; };
try {
  const args=process.argv.slice(2), values:Record<string,unknown>={};
  for(let i=0;i<args.length;i+=2){
    if(!args[i].startsWith('--')||args[i+1]===undefined) throw Error('Expected --key value arguments');
    let key=args[i].slice(2);if(key==='d')key='dz';
    if(!['test','mode','tails','dz','alpha','n','power'].includes(key))throw Error('Unknown argument: '+key);
    values[key]=['test','mode'].includes(key)?args[i+1]:Number(args[i+1]);
  }
  console.log(JSON.stringify(calculatePairedTTest(values as PairedInput)));
}catch(error){console.log(JSON.stringify({error:error instanceof Error?error.message:String(error)}));process.exitCode=1;}
