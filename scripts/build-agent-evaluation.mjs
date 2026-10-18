import fs from 'node:fs';
// Expected values come from retained G*Power records, never from the language model.
const gui=JSON.parse(fs.readFileSync('oracle/gpower-expanded.json','utf8'));
const scenarios=[
  [2,'Tedavi öncesi ve sonrası sistolik tansiyonu aynı hastalarda karşılaştıracağız.'],
  [3,'Aynı kişilerin diyet öncesi ve sonrası tansiyon farkları için mevcut örneklemin gücünü öğrenmek istiyoruz.'],
  [4,'Rehabilitasyon öncesi ve sonrası aynı kişilerin ölçümlerini eşleştirdik.'],
  [6,'Kurgusal küçük bir pilotta her kişinin önce ve sonra ölçümü var.'],
  [12,'Kurgusal bir sınır değer araştırmasında aynı kişilerin önce ve sonra ölçümlerini planlıyoruz. Standartlaştırılmış etki bu sınır testinde bilerek yirmidir; yüzde değildir ve aynen kullanılmalıdır.'],
  [13,'Egzersiz öncesi ve sonrası tansiyonu aynı kişilerde karşılaştıracağız.'],
  [14,'Aynı hastaların eğitim öncesi ve sonrası ölçümlerini inceleyeceğiz.'],
  [15,'Aynı kişilerin takip öncesi ve sonrası farkını değerlendireceğiz.'],
  [16,'Tedavi öncesi ve sonrası kurgusal ağrı puanları eşleştirilmiş durumda.'],
  [17,'Program öncesi ve sonrası aynı katılımcıların ölçümlerini karşılaştıracağız.'],
];
const cases=scenarios.map(([n,context],i)=>{
  const v=gui.find(v=>v.id==='GUI-'+String(n).padStart(2,'0'));
  if(!v?.screenshots?.length)throw Error('Missing screenshot '+n);
  const p=v.input;
  const question=context+` Çift yönlü eşleştirilmiş t-testi, dz=${String(p.dz).replace('.',',')}, alfa=${String(p.alpha).replace('.',',')}. `+
    (p.mode==='a-priori'?`Hedef güç %${p.power*100} için kaç hasta/eşleşmiş çift gerekir?`:`${p.n} hasta/eşleşmiş çift ile post-hoc güç nedir?`);
  return {id:'AI-'+String(i+1).padStart(2,'0'),question,synthetic:true,expectedFamily:'t-paired',expectedParameters:p,expected:v.expected,
    guiEvidence:{id:v.id,record:v.evidence,sha256:v.evidence_sha256,screenshot:v.screenshots[0].path,screenshot_sha256:v.screenshots[0].sha256,capturedAt:v.capturedAt}};
});
fs.writeFileSync('oracle/agent-evaluation.json',JSON.stringify(cases,null,2)+'\n');
console.log('10 synthetic questions grounded in actual G*Power records.');
