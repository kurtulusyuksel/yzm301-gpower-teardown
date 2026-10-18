import fs from 'node:fs';
const r=JSON.parse(fs.readFileSync('evidence/ai-agent/live-comparison.json','utf8'));
const pct=(100*(r.gui.tokens-r.mcp.tokens)/r.gui.tokens).toFixed(2);
const text=`# Gerçek yerel LLM ölçümü\n\nModel: ${r.model}; ${r.count} kurgusal Türkçe soru.\n\n`+
`| Ölçüt | LLM + MCP | LLM + canlı G*Power ekranı |\n|---|---:|---:|\n`+
`| Doğru N | ${r.mcp.nCorrect}/${r.count} | ${r.gui.nCorrect}/${r.count} |\n`+
`| Bütün sayısal alanlar doğru | ${r.mcp.correct}/${r.count} | ${r.gui.correct}/${r.count} |\n`+
`| Ölçülmüş model tokenı | ${r.mcp.tokens} | ${r.gui.tokens} |\n`+
`| Toplam ölçülen süre (s) | ${(r.mcp.duration_ms/1000).toFixed(2)} | ${(r.gui.duration_ms/1000).toFixed(2)} |\n`+
`| Ortalama süre (s/soru) | ${(r.mcp.duration_ms/1000/r.count).toFixed(2)} | ${(r.gui.duration_ms/1000/r.count).toFixed(2)} |\n\n`+
`Bu deneyde MCP kolu %${pct} daha az model tokenı kullandı. Orijinal G*Power sonuçları doğruydu; GUI hataları bu modelin küçük yazılı ekranı okumasında oluştu.\n\n`+
`İki kol, aynı gerçek LLM niyet kararını paylaşır; karar tokenları ikisine de eklenir. GUI kolu denetimli Computer Use ile orijinal uygulamaya veri girişi, hesaplama ve yeni ekran görüntüsünü okuma içerir. Ekranlara beklenen sonuç veya metin dökümü eklenmedi; görsel model yalnız soruyu ve özgün ekranı aldı.\n\n`+
`Süreler eş koşullu veya rastgeleleştirilmiş bir hız deneyi değildir. Başlangıç kurulumu hariç; GUI sürücü gecikmeleri ve bazı geometri/odak toparlanmaları dahildir. Paylaşılan niyet seçimi zamanları önceki MCP çalışmasından alınır. Yerel Qwen kullanım sayaçları ölçülür; ev sahibi asistan altyapısı, enerji ve donanım maliyetleri ölçülmez. GUI çıktı şeması beş sayısal alanı zorunlu tutar; çekimser cevap seçeneği yoktur. Sonuçlar yalnız bu model, bu görüntü çözünürlüğü ve bu on soruyla sınırlıdır.\n\n`+
`Ham kanıt: [live-comparison.json](live-comparison.json), [evaluation.json](evaluation.json), [canlı ekranlar ve yakalama kayıtları](live-gui/), [model/MCP çağrıları](runs/).\n`;
fs.writeFileSync('evidence/ai-agent/RESULTS.md',text);
console.log(text);
