import { calculate } from './build/engine.js';

const standard={mode:'a-priori',tails:2,dz:.5,alpha:.05,power:.95};
const cases=[
 ['AC-01',standard,[54,.9502,2.0057,53,3.6742]],
 ['AC-02',{...standard,tails:1},[45,.9512,1.6802,44,3.3541]],
 ['AC-03',{...standard,mode:'post-hoc',n:54},[54,.9502,2.0057,53,3.6742]],
 ['AC-04',{...standard,mode:'post-hoc',n:53},[53,.9465,2.0066,52,3.6401]],
 ['AC-06',{...standard,mode:'post-hoc',n:3},[3,.0841,4.3027,2,.866]],
 ['AC-07',{...standard,mode:'post-hoc',n:3,dz:.00001},[3,.05,4.3027,2,0]],
 ['AC-07b',{...standard,mode:'post-hoc',n:3,dz:.000005},[3,.05,4.3027,2,0]],
 ['AC-13',{...standard,dz:20},[2,.9735,12.7062,1,28.2843]]
];
let failures=0;
for(const [id,input,expected] of cases){const actual=calculate(input);const pass=JSON.stringify(Object.values(actual))===JSON.stringify(expected);console.log(JSON.stringify({id,pass,actual}));if(!pass)failures++;}
for(const [id,patch] of [['AC-05',{mode:'post-hoc',n:2}],['fractional-n',{mode:'post-hoc',n:3.5}],['AC-09-tails',{tails:3}],['AC-09-alpha',{alpha:1.5}],['AC-10',{dz:.000005}],['AC-11',{dz:.00001}],['AC-12',{dz:100}],['power-alpha',{power:.05}],['power-low',{power:.04}]]){
 let message;try{calculate({...standard,...patch});}catch(error){message=error.message;}const pass=typeof message==='string';console.log(JSON.stringify({id,pass,error:message}));if(!pass)failures++;
}
process.exitCode=failures?1:0;

