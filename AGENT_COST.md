# Ajan süreç ve maliyet durumu

Önceki model, iterasyon, dolar maliyeti ve token toplamları ham oturum veya sağlayıcı kullanım kayıtlarına bağlı değildi. Doğrulanmış ölçüm olarak kullanılamazlar.

clinical_agent.ts karakter uzunluğundan token tahmini yapar; model API çağrısı yoktur. benchmark_eval.ts GUI için soru başına 3450 token ve 4500 ms varsayar. Yerel motor süresi gerçek GUI/MCP karşılaştırması değildir.

npm run eval bir ayrıştırıcı demosu ve varsayımsal maliyet senaryosudur. Tasarruf oranları deneysel ölçüm veya bonus kanıtı değildir. Gerçek ölçüm için aynı soruların GUI/MCP oturum kayıtları, model adı, sağlayıcı usage alanları, süreler ve fiyat tarihi saklanmalıdır.
