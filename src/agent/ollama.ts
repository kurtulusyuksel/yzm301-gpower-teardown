export interface Message { role:string; content:string; tool_calls?:any[]; tool_name?:string; images?:string[] }
export interface ChatReply { model:string; message:Message; done:boolean; done_reason?:string; prompt_eval_count:number; eval_count:number; total_duration?:number; load_duration?:number }
export const MODEL=process.env.OLLAMA_MODEL ?? 'qwen3.5:9b';
export const HOST=process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434';
export async function chat(messages:Message[],tools?:any[],extra:Record<string,unknown>={}):Promise<ChatReply> {
  const host=HOST.startsWith('http')?HOST:'http://'+HOST;
  const response=await fetch(host.replace(/\/$/,'')+'/api/chat',{
    method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(240000),
    body:JSON.stringify({model:MODEL,messages,stream:false,think:false,keep_alive:'15m',
      options:{temperature:0,seed:301,num_ctx:8192,num_predict:600},...(tools?{tools}:{}),...extra})});
  if(!response.ok)throw Error(`Ollama HTTP ${response.status}: ${(await response.text()).slice(0,400)}`);
  const reply=await response.json() as ChatReply;
  if(!reply.done||reply.done_reason==='length')throw Error('Model response incomplete; no answer accepted.');
  for(const key of ['prompt_eval_count','eval_count'] as const)
    if(!Number.isInteger(reply[key])||reply[key]<0)throw Error('Missing measured Ollama token usage: '+key);
  return reply;
}
