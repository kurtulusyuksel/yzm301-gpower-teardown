# Ajan süreç ve maliyet durumu

## Doğrulanabilir süreç bilgisi

Kullanılan araç Codex ajan oturumudur. Sağlayıcının model kimliği, toplam usage tokenı ve faturalanan maliyeti bu depoya dışa aktarılmadı; bunlara sayı uydurulmaz. Türkçe demo bir model API'si kullanmaz.

Bağımsız uygulayıcı ayrı bağlamda çalıştı; iki geliştirme/doğrulama turu kayıtlıdır. Birinci tur 116 sözleşme kontrolü, ikinci tur 118 sözleşme ve 3 CLI kontrolüyle sınandı. Gerçek kayıtlar cleanroom/SESSION.md, evidence/cleanroom-handoff.json ve evidence/cleanroom-round1/ içindedir. Sonraki teslim denetiminde ek referanslar, GUI kayıtları ve CLI girdi testleri eklendi; bu, bağımsız uygulayıcının üçüncü turu değildir.

Yaklaşık oturum tokenı ve dolar maliyeti: **bilinmiyor / ölçülmedi**. Bu alanların tamamlanması için Codex kullanım dışa aktarımı gerekir. Repo içindeki karakter tabanlı demo tahminleri gerçek geliştirme oturumunun token hesabı yerine kullanılmaz.

Farklı yapacağımız: oturum başında model/usage kaydını açmak, ilk prompt'ları değişmeden arşivlemek, 30 ekran görüntülü GUI vakasını SPEC'ten önce toplamak ve bağımsız uygulayıcıyı yalnız SPEC ile başlatmak. İncelemeyi tamamlamadan başarı oranı veya bonus puanı ilan etmemek.

Önceki model, iterasyon, dolar maliyeti ve token toplamları ham oturum veya sağlayıcı kullanım kayıtlarına bağlı değildi. Doğrulanmış ölçüm olarak kullanılamazlar.

clinical_agent.ts karakter uzunluğundan token tahmini yapar; model API çağrısı yoktur. benchmark_eval.ts GUI için soru başına 3450 token ve 4500 ms varsayar. Yerel motor süresi gerçek GUI/MCP karşılaştırması değildir.

npm run eval bir ayrıştırıcı demosu ve varsayımsal maliyet senaryosudur. Tasarruf oranları deneysel ölçüm veya bonus kanıtı değildir. Gerçek ölçüm için aynı soruların GUI/MCP oturum kayıtları, model adı, sağlayıcı usage alanları, süreler ve fiyat tarihi saklanmalıdır.
