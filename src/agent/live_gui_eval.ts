// The GUI driver is supervised Computer Use, never a substituted calculation engine.
// Share the measured LLM intent decision between arms, then compare MCP with live GUI.
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {chat,MODEL} from './ollama.js';
const base='evidence/ai-agent/live-gui';fs.mkdirSync(base,{recursive:true});
const paired=JSON.parse(fs.readFileSync('evidence/ai-agent/evaluation.json','utf8'));
if(paired.mcpCorrect!==10)throw Error('Need a verified 10-question MCP evaluation before live comparison.');
const schema={type:'object',properties:Object.fromEntries(['n_total','actual_power','critical','df','ncp'].map(k=>[k,{type:'number'}])),required:['n_total','actual_power','critical','df','ncp'],additionalProperties:false};
const rows:any[]=[];
for(const c of paired.rows) {
  const log=JSON.parse(fs.readFileSync(c.mcp.logFile.replaceAll('\\','/'),'utf8'));
  const decision=log.outputMode==='mcp_return_direct'?log.modelCalls:log.modelCalls.slice(0,-1);
  const decisionUsage={input:decision.reduce((n:any,r:any)=>n+r.response.prompt_eval_count,0),output:decision.reduce((n:any,r:any)=>n+r.response.eval_count,0)};
  const request={id:c.id,query:c.question,parameters:c.mcp.parameters,decisionLog:c.mcp.logFile,createdAt:new Date().toISOString()};
  fs.writeFileSync(base+'/request.json',JSON.stringify(request,null,2)+'\n');
  console.log(c.id+': waiting for supervised live GUI capture');
  const deadline=Date.now()+15*60*1000;
  const responseFile=base+'/'+c.id+'-capture.json';
  while(!fs.existsSync(responseFile)) {if(Date.now()>deadline)throw Error('GUI capture timeout '+c.id);await new Promise(r=>setTimeout(r,500));}
  const capture=JSON.parse(fs.readFileSync(responseFile,'utf8'));
  if(capture.id!==c.id||JSON.stringify(capture.parameters)!==JSON.stringify(request.parameters))throw Error('GUI parameters mismatch');
  const bytes=fs.readFileSync(capture.screenshot);
  if(createHash('sha256').update(bytes).digest('hex')!==capture.screenshot_sha256)throw Error('Screenshot hash mismatch');
  const start=performance.now();
  const messages=[{role:'system',content:'You are reading a LIVE G*Power calculation result. Do not calculate any number yourself. Read all five output fields from the screenshot. n_total is the number of matched pairs (input Total sample size in post hoc). Return JSON only. If text is hard to read, do not substitute a mathematical estimate.'},
    {role:'user',content:c.question,images:[bytes.toString('base64')]}];
  const reply=await chat(messages,undefined,{format:schema});
  const result=JSON.parse(reply.message.content),reading_ms=performance.now()-start;
  const round=(n:number)=>Math.round(n*10000)/10000;
  const fieldMatches=Object.fromEntries(Object.entries(c.expected).map(([key,value])=>[key,round(result[key])===round(value as number)]));
  const input=decisionUsage.input+reply.prompt_eval_count,output=decisionUsage.output+reply.eval_count;
  const decision_ms=decision.reduce((n:number,r:any)=>n+r.wall_ms,0);
  rows.push({id:c.id,question:c.question,expected:c.expected,parameters:c.mcp.parameters,sharedIntentDecision:c.mcp.logFile,
    mcp:c.mcp,gui:{result,fieldMatches,nMatch:fieldMatches.n_total,correct:Object.values(fieldMatches).every(Boolean),
      tokenUsage:{input,output,total:input+output},decisionUsage,screenshotUsage:{input:reply.prompt_eval_count,output:reply.eval_count},
      duration_ms:decision_ms+capture.duration_ms+reading_ms,decision_ms,inputAndCapture_ms:capture.duration_ms,reading_ms,
        capture:responseFile,response:reply,request:{messages:messages.map(m=>({...m,...('images' in m?{images:['[exact original screenshot is referenced in capture record]']}:{})})),format:schema}}});
  fs.writeFileSync(base+'/progress.json',JSON.stringify(rows,null,2)+'\n');
  console.log(c.id+': live GUI '+(rows.at(-1).gui.correct?'PASS':'FAIL'));
}
const sum=(key:'mcp'|'gui')=>({tokens:rows.reduce((n,r)=>n+r[key].tokenUsage.total,0),duration_ms:rows.reduce((n,r)=>n+r[key].duration_ms,0),
  correct:rows.filter(r=>r[key].correct).length,nCorrect:rows.filter(r=>key==='mcp'?r.mcp.numericMatch:r.gui.nMatch).length});
const report={createdAt:new Date().toISOString(),provider:'Ollama local',model:MODEL,count:rows.length,mcp:sum('mcp'),gui:sum('gui'),
  method:'Paired branches share the actual LLM intent/tool decision. MCP arm executes real stdio tool; GUI arm enters the same LLM-selected values into original G*Power using supervised Computer Use, then the same model reads the fresh screenshot.',
  tokenSource:'Measured Ollama prompt_eval_count and eval_count. Shared intent tokens charged to both branches. No character-based estimates.',
  timing:'MCP measured agent wall time; GUI shared decision model time + supervised UI input/capture wall time + visual-reading wall time. Initial app startup/setup excluded; UI supervision includes orchestration delays.',
  limitations:['Not a randomized latency experiment; supervised GUI driver and caching affect elapsed time.','Only the Qwen inference tokens are metered; host assistant/tool infrastructure is not metered in either branch.','Local hardware/energy cost not measured; API invoice charge is not applicable.'],rows};
fs.writeFileSync('evidence/ai-agent/live-comparison.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:report.count,mcp:report.mcp,gui:report.gui},null,2));
