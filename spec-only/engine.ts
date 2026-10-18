export interface Input { mode: 'a-priori' | 'post-hoc'; tails: number; dz: number; alpha: number; power?: number; n?: number }
export interface Result { n_total: number; actual_power: number; critical: number; df: number; ncp: number }
const log2 = Math.log(2);
function logGamma(z: number): number {
  const c = [676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-0.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
  if (z < .5) return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
  z--; let x=.9999999999998099; for(let i=0;i<c.length;i++) x+=c[i]/(z+i+1);
  const t=z+7.5; return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
}
function normal(x: number): number {
  if(x===0) return .5; if(x>38) return 1; if(x< -38) return 0;
  const t=x*x/2, a=.5; let q: number;
  if(t<1.5) {let term=1/a, sum=term; for(let i=1;i<300;i++){term*=t/(a+i);sum+=term;if(Math.abs(term)<Math.abs(sum)*1e-16)break;}q=1-sum*Math.exp(-t+a*Math.log(t)-logGamma(a));}
  else {let b=t+1-a,c=1e300,d=1/b,h=d;for(let i=1;i<300;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const change=d*c;h*=change;if(Math.abs(change-1)<2e-15)break;}q=Math.exp(-t+a*Math.log(t)-logGamma(a))*h;}
  return x<0?q/2:1-q/2;
}
function betaFraction(a:number,b:number,x:number):number {let c=1,d=1-(a+b)*x/(a+1);d=1/d;let h=d;for(let m=1;m<500;m++){let aa=m*(b-m)*x/((a+2*m-1)*(a+2*m));d=1+aa*d;c=1+aa/c;if(Math.abs(d)<1e-300)d=1e-300;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;h*=d*c;aa=-(a+m)*(a+b+m)*x/((a+2*m)*(a+2*m+1));d=1+aa*d;c=1+aa/c;if(Math.abs(d)<1e-300)d=1e-300;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const v=d*c;h*=v;if(Math.abs(v-1)<2e-14)break;}return h;}
function beta(x:number,a:number,b:number):number {if(x<=0)return 0;if(x>=1)return 1;const front=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return x<(a+1)/(a+b+2)?front*betaFraction(a,b,x)/a:1-front*betaFraction(b,a,1-x)/b;}
function tCdf(t:number,df:number):number {const tail=.5*beta(df/(df+t*t),df/2,.5);return t<0?tail:1-tail;}
function criticalT(p:number,df:number):number {if(p===.5)return 0;if(p<.5)return -criticalT(1-p,df);let lo=0,hi=1;while(tCdf(hi,df)<p)hi*=2;for(let i=0;i<65;i++){const m=(lo+hi)/2;if(tCdf(m,df)<p)lo=m;else hi=m;}return (lo+hi)/2;}
function integrate(f:(x:number)=>number,a:number,b:number,tolerance=2e-10):number {const fa=f(a),fb=f(b),m=(a+b)/2,fm=f(m),s=(b-a)*(fa+4*fm+fb)/6;function rec(a:number,b:number,fa:number,fm:number,fb:number,s:number,e:number,depth:number):number{const m=(a+b)/2,l=f((a+m)/2),r=f((m+b)/2),sl=(m-a)*(fa+4*l+fm)/6,sr=(b-m)*(fm+4*r+fb)/6,delta=sl+sr-s;if(depth<=0||Math.abs(delta)<15*e)return sl+sr+delta/15;return rec(a,m,fa,l,fm,sl,e/2,depth-1)+rec(m,b,fm,r,fb,sr,e/2,depth-1);}return rec(a,b,fa,fm,fb,s,tolerance,22);}
function raw(n:number,dz:number,alpha:number,tails:number) {const df=n-1,root=Math.sqrt(df),delta=dz*Math.sqrt(n),critical=criticalT(1-alpha/tails,df);
  const base=df>=32?-.5*Math.log(Math.PI)-1/(6*df)+1/(45*df**3):(1-df/2)*log2-logGamma(df/2)+(df-1)*Math.log(root)-df/2;
  const density=(r:number)=>{if(r===0)return df===1?Math.sqrt(2/Math.PI):0;const u=(r-root)/root;return Math.exp(base+df*(Math.log1p(u)-u-u*u/2)-Math.log1p(u));};
  const f=(r:number)=>density(r)*(normal(delta-critical*r/root)+(tails===2?normal(-delta-critical*r/root):0));
  // Fixed subintervals prevent a narrow conditional-normal transition from being missed.
  const a=Math.max(0,root-12),b=root+12;let power=0;for(let i=0;i<24;i++)power+=integrate(f,a+(b-a)*i/24,a+(b-a)*(i+1)/24);
  return {n_total:n,actual_power:Math.max(0,Math.min(1,power)),critical,df,ncp:delta};
}
export function calculate(input:Input):Result {const {mode,tails,dz,alpha}=input;if(mode!=='a-priori'&&mode!=='post-hoc')throw Error('mode must be a-priori or post-hoc');if(tails!==1&&tails!==2)throw Error('tails must be 1 or 2');if(!Number.isFinite(dz)||dz<=0)throw Error('dz must be positive and finite');if(!Number.isFinite(alpha)||alpha<=0||alpha>=1)throw Error('alpha must be between 0 and 1');let n:number;
  if(mode==='post-hoc'){n=input.n!;if(!Number.isInteger(n)||n<3||n>2147483646)throw Error('n must be an integer in [3, 2147483646]');}
  else {if(dz<.00001||dz>20)throw Error('a-priori dz must be in [0.00001, 20]');const target=input.power!;if(!Number.isFinite(target)||target<=alpha||target>=1)throw Error('power must satisfy alpha < power < 1');let lo=2,hi=2;while(raw(hi,dz,alpha,tails).actual_power<target&&hi<1000000){lo=hi+1;hi=Math.min(1000000,hi*2);}if(raw(hi,dz,alpha,tails).actual_power<target)throw Error('sample-size search limit of 1000000 pairs exceeded');while(lo<hi){const mid=Math.floor((lo+hi)/2);if(raw(mid,dz,alpha,tails).actual_power>=target)hi=mid;else lo=mid+1;}n=lo;}
  const result=raw(n,dz,alpha,tails);return {...result,actual_power:round(result.actual_power),critical:round(result.critical),ncp:round(result.ncp)};
}
function round(x:number):number{return Math.round(x*10000)/10000;}
