import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {pathToFileURL} from 'node:url';
import {runLlmAgent} from './llm_agent.js';
import {chat,MODEL} from './ollama.js';
const round=(n:number)=>Math.round(n*10000)/10000;
const sha=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
export async function runLlmEvaluation() {
  const cases=JSON.parse(fs.readFileSync('oracle/agent-evaluation.json','utf8'));
  const dir='evidence/ai-agent';fs.mkdirSync(dir,{recursive:true});
  const rows:any[]=[];
  const resultSchema={type:'object',properties:Object.fromEntries(['n_total','actual_power','critical','df','ncp'].map(k=>[k,{type:'number'}])),required:['n_total','actual_power','critical','df','ncp'],additionalProperties:false};
  for(const c of cases) {
    const record=fs.readFileSync(c.guiEvidence.record);
    const bytes=fs.readFileSync(c.guiEvidence.screenshot);
    if(sha(record)!==c.guiEvidence.sha256||sha(bytes)!==c.guiEvidence.screenshot_sha256)throw Error(c.id+' source hash mismatch');
    const agent=await runLlmAgent(c.question);
    const paramMatch=agent.status==='answered'&&Object.entries(c.expectedParameters).every(([k,v])=>agent.parameters?.[k]===v);
    const numericMatch=agent.status==='answered'&&Object.entries(c.expected).every(([k,v])=>agent.result?.[k]===round(v as number));
    const start=performance.now();
    const messages=[{role:'system',content:'Read the attached real G*Power result screenshot for the Turkish research question. Do NOT calculate or infer missing values. Copy the five output fields from the screenshot as numbers. n_total is total matched pairs (for post hoc it is the input Total sample size). Critical t, Df, Noncentrality parameter and Actual power/Power are visible. Return only the requested JSON.'},
      {role:'user',content:c.question,images:[bytes.toString('base64')]}];
    let gui:any,guiError:string|undefined;
    try {
      const response=await chat(messages,undefined,{format:resultSchema});
      const parsed=JSON.parse(response.message.content);
      gui={model:response.model,response,result:parsed,
        tokenUsage:{input:response.prompt_eval_count,output:response.eval_count,total:response.prompt_eval_count+response.eval_count},duration_ms:performance.now()-start,
        numericMatch:Object.entries(c.expected).every(([k,v])=>round(parsed[k])===round(v as number))};
    }catch(e){guiError=e instanceof Error?e.message:String(e);}
    const row={id:c.id,question:c.question,expectedFamily:c.expectedFamily,expectedParameters:c.expectedParameters,expected:c.expected,
      mcp:{status:agent.status,parameterMatch:paramMatch,numericMatch,correct:paramMatch&&numericMatch,parameters:agent.parameters,result:agent.result,
        tokenUsage:agent.tokenUsage,duration_ms:agent.duration_ms,logFile:agent.logFile,error:agent.error},
      gui:{...gui,error:guiError,source:c.guiEvidence,request:{messages:messages.map(m=>({...m,...('images' in m?{images:['[base64 omitted; exact screenshot path and SHA-256 above]']}:{})})),format:resultSchema},
        scope:'Recorded real G*Power screenshot replay: model visual reading only. GUI input/capture time is NOT included.'}};
    rows.push(row);
    fs.writeFileSync(path.join(dir,'evaluation-progress.json'),JSON.stringify(rows,null,2)+'\n');
    console.log(`${c.id}: MCP ${row.mcp.correct?'PASS':'FAIL'}, screenshot ${gui?.numericMatch?'PASS':'FAIL'}`);
  }
  const totals=(key:'mcp'|'gui')=>({inputTokens:rows.reduce((n,r)=>n+(r[key].tokenUsage?.input??0),0),outputTokens:rows.reduce((n,r)=>n+(r[key].tokenUsage?.output??0),0),
    totalTokens:rows.reduce((n,r)=>n+(r[key].tokenUsage?.total??0),0),duration_ms:rows.reduce((n,r)=>n+(r[key].duration_ms??0),0)});
  const report={createdAt:new Date().toISOString(),model:MODEL,provider:'Ollama local',temperature:0,thinking:false,count:rows.length,
    mcpCorrect:rows.filter(r=>r.mcp.correct).length,guiReadingCorrect:rows.filter(r=>r.gui.numericMatch).length,
    mcp:totals('mcp'),guiReading:totals('gui'),tokenSource:'Actual Ollama prompt_eval_count and eval_count, summed over every request; no character estimates',
    limitations:['GUI arm replays already recorded screenshots; it does not drive G*Power or measure input/capture latency.',
      'Model decoding/tool output generation differs between arms; this is a workflow comparison, not an isolated causal estimate.',
      'Ten supported synthetic Turkish questions, two-sided tests only; not general medical or family-classification accuracy.',
      'Local inference: no provider invoice cost, energy/hardware cost not measured. Cold model load and warm-cache conditions affect timings.'],rows};
  fs.writeFileSync(path.join(dir,'evaluation.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({count:report.count,mcpCorrect:report.mcpCorrect,guiReadingCorrect:report.guiReadingCorrect,mcp:report.mcp,guiReading:report.guiReading},null,2));
  // GUI mistakes are an observed comparison outcome, not a reason to hide the run.
  if(report.mcpCorrect!==cases.length)process.exitCode=1;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)await runLlmEvaluation();
