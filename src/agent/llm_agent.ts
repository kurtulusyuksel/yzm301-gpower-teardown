import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {chat,MODEL,HOST,Message,ChatReply} from './ollama.js';

export const SYSTEM=`Sen PairedLab araştırma planlama ajanısın. Kullanıcı Türkçe kurgusal araştırma sorusu sorar.
Yalnız aynı kişilerde önce/sonra veya eşleştirilmiş ölçümlerin t-testi desteklenir.
Bağımsız gruplar, ANOVA, ki-kare ve belirsiz tasarımlar için hesap yapma; ask_researcher çağır.
Sayısal varsayımlar YAPMA: tails, dz, alpha ve hedef güç ya da çift sayısı eksikse ask_researcher çağır.
Araç şemasının desteklediği aralıkta açıkça verilen sıra dışı değerleri klinik makullük gerekçesiyle değiştirme veya reddetme; kurgusal sınır testleri de geçerlidir. dz birden büyük olabilir.
A-priori örneklem sayısını; post-hoc verilen N'nin gücünü ister. Yalnız yüzde olarak verilen olasılıkları dönüştür; dz bir yüzde değildir, verilen dz değerini aynen koru. Türkçe ondalık virgülü anlayabilirsin.
Hesap, N, güç, df, kritik t, ncp ASLA kendinden gelmez. Her hesapta calculate_paired_power MCP aracını çağır.
Araç çağrısından sonra uygulama Türkçe yanıtı doğrudan MCP sonucundan oluşturur. Serbest metinde sayı veya hesap sonucu üretme.
Hasta/çift sayısı iki ölçüm sayısı değildir. Klinik tedavi önerisi verme. Araç hatasını başarı diye sunma.`;
const ASK={type:'function',function:{name:'ask_researcher',description:'Ask for missing parameters, clarify design, or explain unsupported family. No calculation.',parameters:{type:'object',properties:{question:{type:'string'},reason:{type:'string',enum:['ambiguous','missing_parameters','unsupported']}},required:['question','reason'],additionalProperties:false}}};

export async function runLlmAgent(query:string,options:{logDir?:string;chatFn?:typeof chat}={}) {
  const start=performance.now(),calls:any[]=[],modelCalls:any[]=[],parameterRejections:any[]=[],messages:Message[]=[{role:'system',content:SYSTEM},{role:'user',content:query}];
  const client=new Client({name:'pairedlab-llm-agent',version:'1.0.0'});
  const ts=fileURLToPath(new URL('../mcp/server.ts',import.meta.url));
  const js=fileURLToPath(new URL('../mcp/server.js',import.meta.url));
  const transport=new StdioClientTransport({command:process.execPath,args:fs.existsSync(ts)?['--import','tsx',ts]:[js]});
  const invoke=options.chatFn??chat;
  let status='failed',explanation='',clarification:any,result:any,parameters:any,error:string|undefined;
  try {
    await client.connect(transport);
    const listed=await client.listTools();
    const tool=listed.tools.find(t=>t.name==='calculate_paired_power');
    if(!tool)throw Error('Required MCP tool is not advertised.');
    const tools=[{type:'function',function:{name:tool.name,description:tool.description,parameters:tool.inputSchema}},ASK];
    for(let turn=0;turn<6;turn++) {
      const before=performance.now();
      const reply=await invoke(messages,tools);
      modelCalls.push({request:{messages:structuredClone(messages),tools},response:reply,wall_ms:performance.now()-before});
      messages.push(reply.message);
      const requested=reply.message.tool_calls??[];
      if(requested.length>1)throw Error('Only one tool action per turn is allowed.');
      if(!requested.length) {
        messages.push({role:'user',content:'Serbest metin cevap kabul edilmedi. Desteklenmeyen aile veya eksik/belirsiz parametre varsa ask_researcher aracını gerçekten çağır; araç adını metinde yazmak çağrı değildir. Desteklenen tam girdide calculate_paired_power aracını çağır. Kendin hesap sonucu verme.'});
        continue;
      }
      const call=requested[0].function;
      const args=typeof call.arguments==='string'?JSON.parse(call.arguments):call.arguments;
      if(call.name==='ask_researcher') {
        if(result||!args||typeof args.question!=='string'||!['ambiguous','missing_parameters','unsupported'].includes(args.reason))throw Error('Invalid clarification');
        clarification=args;status='needs_clarification';break;
      }
      if(call.name!=='calculate_paired_power'||result)throw Error('Unexpected or repeated calculation tool');
      // Grounding only: do not select parameters or replace the LLM's interpretation.
      // Reject invented/changed numeric inputs before any calculation.
      const numbers=Array.from(query.matchAll(/[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)/g),m=>Number(m[0].replace(',','.')));
      const percentages=Array.from(query.matchAll(/%\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*%/g),m=>Number((m[1]??m[2]).replace(',','.'))/100);
      const ungrounded=['dz','alpha',args.mode==='a-priori'?'power':'n'].filter(k=>typeof args[k]!=='number'||!(numbers.includes(args[k])||(['alpha','power'].includes(k)&&percentages.includes(args[k]))));
      if(ungrounded.length){
        const rejection={arguments:args,fields:ungrounded,reason:'Values must appear in the question; only percent probabilities may be scaled.'};
        parameterRejections.push(rejection);
        messages.push({role:'tool',tool_name:call.name,content:JSON.stringify({error:'Numeric inputs are not grounded in the user question. Re-read the exact dz/alpha/power/n. Do not scale dz or invent values.',fields:ungrounded})});
        continue;
      }
      const toolStart=performance.now();
      const raw=await client.callTool({name:call.name,arguments:args});
      const texts=Array.isArray(raw.content)?raw.content.filter((c:any)=>c.type==='text').map((c:any)=>c.text).join('\n'):'';
      const parsed=JSON.parse(texts);
      calls.push({tool:call.name,arguments:args,response:raw,duration_ms:performance.now()-toolStart});
      if(raw.isError||parsed.error)throw Error('MCP rejected parameters: '+(parsed.error??texts));
      for(const key of ['n_total','actual_power','critical','df','ncp'])if(!Number.isFinite(parsed[key]))throw Error('Invalid MCP output '+key);
      result=parsed;parameters={test:'t-paired',...args};
      messages.push({role:'tool',tool_name:call.name,content:texts});
      // Return-direct tool: no second model pass can alter a computed result.
      explanation=parameters.mode==='a-priori'?'Aynı kişilerde önce ve sonra ölçümler için eşleştirilmiş t-testi planlaması tamamlandı.':'Eşleştirilmiş ölçümler için verilen örneklemin post-hoc gücü hesaplandı.';
      status='answered';break;
    }
    if(status==='failed')throw Error('Agent turn limit reached.');
  }catch(e){error=e instanceof Error?e.message:String(e);}
  finally{await client.close().catch(()=>{});}
  const tokenUsage={input:modelCalls.reduce((n,c)=>n+c.response.prompt_eval_count,0),output:modelCalls.reduce((n,c)=>n+c.response.eval_count,0)};
  const physicianExplanation=status==='answered'?`${explanation}\n${parameters.mode==='a-priori'?'Gerekli hasta/eşleşmiş çift sayısı':'Hasta/eşleşmiş çift sayısı'}: ${result.n_total}. Güç: ${result.actual_power}; kritik t: ${result.critical}; df: ${result.df}; ncp: ${result.ncp}.`:clarification?.question;
  const record={id:randomUUID(),createdAt:new Date().toISOString(),provider:options.chatFn?'test double':'Ollama local',model:MODEL,host:HOST,outputMode:'mcp_return_direct',query,status,parameters,result,clarification,physicianExplanation,error,tokenUsage:{...tokenUsage,total:tokenUsage.input+tokenUsage.output,source:options.chatFn?'Test double counters, not measured model usage':'Ollama prompt_eval_count + eval_count; summed across requests'},duration_ms:performance.now()-start,toolCalls:calls,parameterRejections,modelCalls};
  const logDir=options.logDir??'evidence/ai-agent/runs';fs.mkdirSync(logDir,{recursive:true});
  const logFile=path.join(logDir,record.id+'.json').replaceAll('\\','/');fs.writeFileSync(logFile,JSON.stringify(record,null,2)+'\n');
  return {...record,logFile};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  const query=process.argv.slice(2).join(' ');
  if(!query){console.error(JSON.stringify({error:'Türkçe kurgusal araştırma sorusunu parametre olarak verin.'}));process.exitCode=1;}
  else {const r=await runLlmAgent(query);console.log(JSON.stringify({status:r.status,answer:r.physicianExplanation,result:r.result,parameters:r.parameters,tokenUsage:r.tokenUsage,duration_ms:r.duration_ms,logFile:r.logFile,error:r.error},null,2));if(r.status==='failed')process.exitCode=1;}
}
