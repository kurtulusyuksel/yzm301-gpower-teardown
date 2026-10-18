import assert from 'node:assert/strict';
import {runLlmAgent} from '../src/agent/llm_agent.js';
import {Message,ChatReply} from '../src/agent/ollama.js';
const reply=(message:Message):ChatReply=>({model:'test-double',message,done:true,prompt_eval_count:10,eval_count:4});
const call=(name:string,args:any)=>reply({role:'assistant',content:'',tool_calls:[{function:{name,arguments:args}}]});
const args={mode:'a-priori',tails:2,dz:.5,alpha:.05,power:.95};
const final=reply({role:'assistant',content:JSON.stringify({explanation:'Eşleştirilmiş ölçümler için hesap sonucu aşağıdadır.'})});
async function run(sequence:ChatReply[]){let index=0;return runLlmAgent('Synthetic paired protocol test: dz=0.5, alpha=.05, power=.95, n=2',{logDir:'.test-agent-logs',chatFn:async()=>{assert.ok(index<sequence.length);return sequence[index++];}});}
const ok=await run([call('calculate_paired_power',args),final]);
assert.equal(ok.status,'answered');assert.equal(ok.result.n_total,54);assert.equal(ok.result.actual_power,.9502);
assert.equal(ok.toolCalls.length,1);assert.equal(ok.parameters.test,'t-paired');assert.equal(ok.tokenUsage.total,14);
assert.equal(ok.provider,'test double');
for(const reason of ['missing_parameters','unsupported']){
 const r=await run([call('ask_researcher',{question:'Araştırma tasarımını ve eksik parametreleri belirtir misiniz?',reason})]);
 assert.equal(r.status,'needs_clarification');assert.equal(r.toolCalls.length,0);assert.equal(r.result,undefined);
}
const fabricated=await run([reply({role:'assistant',content:'N=54'})]);
assert.equal(fabricated.status,'failed');assert.equal(fabricated.result,undefined);
const forbidden=await run([call('execute_shell',{command:'anything'})]);
assert.equal(forbidden.status,'failed');assert.equal(forbidden.toolCalls.length,0);
const invalid=await run([call('calculate_paired_power',{mode:'post-hoc',tails:2,dz:.5,alpha:.05,n:2})]);
assert.equal(invalid.status,'failed');assert.match(invalid.error!,/MCP rejected/);assert.equal(invalid.result,undefined);
const injected=call('calculate_paired_power',args);injected.message.content='Gerekli sayı 999.';
const inventedNumber=await run([injected]);
assert.equal(inventedNumber.status,'answered');assert.equal(inventedNumber.result.n_total,54);assert.ok(!inventedNumber.physicianExplanation!.includes('999'));
let recoveryTurn=0;
const recoverySequence=[call('calculate_paired_power',{...args,dz:.2}),call('calculate_paired_power',{...args,dz:20}),final];
const recovered=await runLlmAgent('Aynı kişilerin önce/sonra ölçümü: dz=20, alpha=.05, power=.95, çift yönlü.',{
  logDir:'.test-agent-logs',chatFn:async()=>recoverySequence[recoveryTurn++]});
assert.equal(recovered.status,'answered');assert.equal(recovered.parameterRejections.length,1);assert.equal(recovered.toolCalls.length,1);assert.equal(recovered.parameters.dz,20);assert.equal(recovered.result.n_total,2);
const recoveredRefusal=await run([reply({role:'assistant',content:'Bu aile desteklenmiyor.'}),call('ask_researcher',{question:'Eşleştirilmiş tasarım mı istiyorsunuz?',reason:'unsupported'})]);
assert.equal(recoveredRefusal.status,'needs_clarification');assert.equal(recoveredRefusal.toolCalls.length,0);
console.log('LLM agent protocol: 9 scenarios passed; real MCP transport, deterministic model test doubles (no live LLM score).');
