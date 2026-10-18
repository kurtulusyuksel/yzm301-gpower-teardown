# Ajan süreç ve maliyet durumu

## Yerel LLM ajanı için gerçek çalışma ölçümü

AI_AGENT.md ve evidence/ai-agent/ altındaki kayıtlar, aşağıdaki eski kurallı demodan ayrıdır. `npm run agent` yerel Ollama `qwen3.5:9b` modelini ve gerçek stdio MCP sunucusunu kullanır. Model sürümü, GGUF özeti, Q4_K_M nicemlemesi ve GPU bilgisi evidence/ai-agent/environment.json içindedir.

Tokenlar gerçek Ollama `prompt_eval_count` ve `eval_count` sayaçlarından alınır; bütün deneme ve düzeltme çağrıları toplanır. `evaluation.json` 10 soruluk MCP çalışmasını ve eski görüntülerin okuma tekrarını; `live-comparison.json` canlı G*Power giriş/yakalama/okuma karşılaştırmasını verir. Paylaşılan niyet çözümleme sayaçları canlı deneyde her iki kola da yazılır. Sayaçlar bu modelin çalışma tokenlarıdır; geliştirme asistanının toplam token kullanımını göstermez.

İlk model ölçümü 9/10 idi; dz=20 değerini .2 diye yorumlama hatası kaydedildi. Sayısal kaynak kontrolü bu değeri hesap öncesi reddeder. Serbest son yanıt biçiminde de hatalar gözlendi; hesap sonucunu yeniden modele yazdırmak yerine MCP sonucunu doğrudan Türkçe rapora döndüren akış kullanıldı. Önceki tamamlanmış turlar round1/ ve round2/; bırakılan eski yaklaşım round3-interrupted/ içinde korunur. Son sınır sorusunda etkinin bilerek yirmi olduğu ve yüzde olmadığı ayrıca belirtilir; bu soru netleştirmesi genel model doğruluğu iddiasına dönüştürülmez.

Bu yerel çalışmanın sağlayıcı API faturası yoktur; bu durum sıfır toplam maliyet demek değildir. Donanım amortismanı ve enerji ölçülmedi. GUI süreleri denetimli sürücü gecikmelerini içerir; sonuçlar kontrollü veya rastgeleleştirilmiş bir hız deneyi olarak sunulmaz.

## Doğrulanabilir süreç bilgisi

Kullanılan araç Codex ajan oturumudur. Sağlayıcının model kimliği, toplam usage tokenı ve faturalanan maliyeti bu depoya dışa aktarılmadı; bunlara sayı uydurulmaz. Türkçe demo bir model API'si kullanmaz.

Bağımsız uygulayıcı ayrı bağlamda çalıştı; iki geliştirme/doğrulama turu kayıtlıdır. Birinci tur 116 sözleşme kontrolü, ikinci tur 118 sözleşme ve 3 CLI kontrolüyle sınandı. Gerçek kayıtlar cleanroom/SESSION.md, evidence/cleanroom-handoff.json ve evidence/cleanroom-round1/ içindedir. Sonraki teslim denetiminde ek referanslar, GUI kayıtları ve CLI girdi testleri eklendi; bu, bağımsız uygulayıcının üçüncü turu değildir.

Yaklaşık oturum tokenı ve dolar maliyeti: **bilinmiyor / ölçülmedi**. Bu alanların tamamlanması için Codex kullanım dışa aktarımı gerekir. Repo içindeki karakter tabanlı demo tahminleri gerçek geliştirme oturumunun token hesabı yerine kullanılmaz.

Farklı yapacağımız: oturum başında model/usage kaydını açmak, ilk prompt'ları değişmeden arşivlemek, 30 ekran görüntülü GUI vakasını SPEC'ten önce toplamak ve bağımsız uygulayıcıyı yalnız SPEC ile başlatmak. İncelemeyi tamamlamadan başarı oranı veya bonus puanı ilan etmemek.

Önceki model, iterasyon, dolar maliyeti ve token toplamları ham oturum veya sağlayıcı kullanım kayıtlarına bağlı değildi. Doğrulanmış ölçüm olarak kullanılamazlar.

clinical_agent.ts karakter uzunluğundan token tahmini yapar; model API çağrısı yoktur. benchmark_eval.ts GUI için soru başına 3450 token ve 4500 ms varsayar. Yerel motor süresi gerçek GUI/MCP karşılaştırması değildir.

npm run eval:demo bir ayrıştırıcı demosu ve varsayımsal maliyet senaryosudur. Bu eski demonun tasarruf oranları deneysel ölçüm veya bonus kanıtı değildir. Yeni npm run eval ve canlı GUI ölçümünde gerçek model kullanım sayaçları, süreler ve kayıtlar yukarıda belirtilen evidence/ai-agent/ altında ayrıca saklanır.
