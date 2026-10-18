export type PairedInput = { test?: 't-paired'; mode: 'post-hoc' | 'a-priori'; tails: 1 | 2; dz: number; alpha: number; n?: number; power?: number };
export type PairedResult = { n_total: number; actual_power: number; critical: number; df: number; ncp: number };

// Normal probability, evaluated as a positive-term convergent series.
function normal(x: number): number {
  if (x < 0) return 1 - normal(-x);
  if (x >= 9) return 1;
  let term = x, sum = x;
  for (let j = 1; j < 500; j++) {
    term *= x * x / (2 * j + 1); sum += term;
    if (term < sum * 1e-16) break;
  }
  return Math.min(1, 0.5 + Math.exp(-x*x/2) * sum / Math.sqrt(2*Math.PI));
}
function logGamma(x: number): number {
  let correction = 0;
  while (x < 16) { correction -= Math.log(x); x++; }
  const r = 1/x, r2 = r*r;
  return correction + (x-.5)*Math.log(x)-x+.5*Math.log(2*Math.PI)
    + r*(1/12+r2*(-1/360+r2*(1/1260+r2*(-1/1680+r2/1188))));
}
function integrate(f: (x:number)=>number, a:number, b:number): number {
  function recurse(a:number,b:number,fa:number,fm:number,fb:number,whole:number,tol:number,depth:number):number {
    const m=(a+b)/2, l=(a+m)/2, r=(m+b)/2, fl=f(l), fr=f(r);
    const left=(m-a)*(fa+4*fl+fm)/6, right=(b-m)*(fm+4*fr+fb)/6;
    if (depth===0 || Math.abs(left+right-whole)<15*tol) return left+right+(left+right-whole)/15;
    return recurse(a,m,fa,fl,fm,left,tol/2,depth-1)+recurse(m,b,fm,fr,fb,right,tol/2,depth-1);
  }
  // Split into short panels so narrow probability transitions cannot be skipped.
  let total=0;
  const count=Math.ceil((b-a)/0.5);
  for(let j=0;j<count;j++) {
    const l=a+(b-a)*j/count,r=a+(b-a)*(j+1)/count,m=(l+r)/2;
    const fl=f(l),fm=f(m),fr=f(r);
    total+=recurse(l,r,fl,fm,fr,(r-l)*(fl+4*fm+fr)/6,1e-11/count,18);
  }
  return total;
}
// T = (Z + delta)/sqrt(V/df), with independent Z normal and V chi-square.
function rejection(c:number, df:number, delta:number, tails:number):number {
  const k=df/2, scale=Math.sqrt(2*df);
  const base=k>10000 ? .5*Math.log(k/(2*Math.PI))-1/(12*k)+1/(360*k*k*k) : k*Math.log(k)-k-logGamma(k);
  const lo=Math.max(-scale,-12), hi=16;
  const result=integrate(x=>{
    const u=x/scale, s=1+u;
    if(s<=0) return df===1 ? Math.exp(Math.log(2)+base+k)/scale*(normal(delta)+(tails===2?normal(-delta):0)) : 0;
    const logShape=2*Math.log1p(u)-2*u-u*u;
    const density=Math.exp(Math.log(2)+base-Math.log(s)+k*logShape)/scale;
    return density*(normal(delta-c*s)+(tails===2?normal(-delta-c*s):0));
  },lo,hi);
  return Math.max(0,Math.min(1,result));
}
const criticalCache=new Map<string,number>();
function criticalValue(alpha:number,df:number,tails:number):number {
  const key=`${alpha}:${df}:${tails}`, cached=criticalCache.get(key);
  if(cached!==undefined)return cached;
  // For alpha > .5, the one-sided central quantile is negative.
  if(tails===1 && alpha>.5) return -criticalValue(1-alpha,df,1);
  let lo=0,hi=1;
  while(rejection(hi,df,0,tails)>alpha) { hi*=2; if(!Number.isFinite(hi)) throw Error('Critical quantile exceeds numeric range'); }
  for(let j=0;j<52;j++){const m=(lo+hi)/2;if(rejection(m,df,0,tails)>alpha)lo=m;else hi=m;}
  const value=(lo+hi)/2;
  if(criticalCache.size>=4096)criticalCache.clear();
  criticalCache.set(key,value);
  return value;
}
const round=(x:number)=>Math.round(x*10000)/10000;
export function calculatePairedTTest(input:PairedInput):PairedResult {
  if(input.test!==undefined && input.test!=='t-paired') throw Error('Unsupported test');
  if(input.tails!==1 && input.tails!==2) throw Error('tails must be 1 or 2');
  if(!Number.isFinite(input.alpha)||input.alpha<=0||input.alpha>=1) throw Error('alpha must be between 0 and 1');
  if(!Number.isFinite(input.dz)||input.dz<=0) throw Error('dz must be positive and finite');
  const evaluate=(n:number)=>{const df=n-1, ncp=input.dz*Math.sqrt(n), critical=criticalValue(input.alpha,df,input.tails);return {n_total:n,df,ncp,critical,actual_power:rejection(critical,df,ncp,input.tails)};};
  let n:number;
  if(input.mode==='post-hoc') {
    if(!Number.isInteger(input.n)||input.n!<3||input.n!>2147483646) throw Error('n must be an integer in [3, 2147483646]');
    n=input.n!;
  } else if(input.mode==='a-priori') {
    if(input.dz<0.00001||input.dz>20) throw Error('a-priori dz must be in [0.00001, 20]');
    if(!Number.isFinite(input.power)||input.power!<=input.alpha||input.power!>=1) throw Error('power must satisfy alpha < power < 1');
    let lo=1,hi=2;
    while(evaluate(hi).actual_power<input.power!){lo=hi;hi=Math.min(1000000,hi*2);if(lo===hi)throw Error('Required sample size exceeds local search limit of 1000000');}
    while(hi-lo>1){const mid=Math.floor((lo+hi)/2);if(evaluate(mid).actual_power>=input.power!)hi=mid;else lo=mid;}
    n=hi;
  } else throw Error('mode must be post-hoc or a-priori');
  const result=evaluate(n);
  return {...result,actual_power:round(result.actual_power),critical:round(result.critical),ncp:round(result.ncp)};
}
