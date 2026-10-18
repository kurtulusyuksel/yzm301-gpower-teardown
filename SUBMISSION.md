# Yönergeye göre teslim kontrolü

| Gereksinim | Kanıt / durum |
|---|---|
| Aile 2, eşleştirilmiş ortalama; a-priori ve post-hoc | CLI, SPEC ve G*Power GUI kayıtları |
| REA + Ghidra; hesap bölgesini bulma | LEDGER adresleri ve evidence/ metaverisi. Dolaylı çağrı yolunun tamamı çözülmedi |
| Ders etiketleri | LEDGER: [DOK], [REA], [AJAN]; GUI gözlemleri ayrıca ayrılır |
| Gherkin SPEC | SPEC.md genişletilmiş kabul senaryoları; uygulayıcı girdileri SHA-256 ile arşivlenir |
| En az 30 ekran görüntülü GUI vektörü | oracle/gpower-expanded.csv ve .json: 32 vaka, 31'i ekran görüntülü; GUI-01 yalnız metin kaydıdır. oracle/screenshots/ |
| 500'den fazla statsmodels/pwr vektörü | 600 statsmodels vektörü; oracle/statsmodels-vectors.csv, üretim ve fark raporları |
| Kılavuz örnekleri | Resmi kılavuz §19.3'ten iki örnek; tests/manual.test.ts |
| Sınırlar | Küçük/büyük dz, N sınırları, geçersiz sayılar, hedef güç alpha'ya eşit ve küçük; grup oranı bu aileye uygulanmaz |
| Diferansiyel test | İki yerel uygulama için GUI ve statsmodels; yalnız-SPEC uygulaması ayrıca tutulmuş verilerle sınanır |
| Yalnız SPEC okuyan ayrı oturum | spec-only/; gerçek ilk prompt, SESSION ve evidence/spec-only-handoff.json |
| En az iki yanlış çıkarım | HALLUCINATIONS.md; kanıt ve yakalayan testler |
| Süreç ve maliyet günlüğü | AGENT_COST.md; iki önceki tur ve ek yalnız-SPEC oturumu kayıtlı. Oturum tokenı ve dolar maliyeti ölçülmedi |
| 60 saniyelik CLI videosu | demo/cli-demo.mp4: gerçek komut çıktılarının terminal kaydı görselleştirmesi; masaüstü çekimi değildir |
| README: kurulum, sürüm, hash, atıf, video | README.md |
| MCP bonus belgeleri ve testleri | README araç sözleşmesi; tests/mcp_equivalence.test.ts gerçek stdio denklik testi |
| AI ajanı bonus uygulaması | Yerel Ollama/Qwen ile Türkçe niyet ve parametre seçimi, gerçek MCP çağrısı; 10 soruluk değerlendirme, ham model/araç kayıtları ve ölçülmüş token/süre karşılaştırması AI_AGENT.md içinde. Puanlandırma öğretim elemanına aittir |

## Dış kayıt veya bilgi gerektiren açık maddeler

- **İlk inceleme oturumunun gerçek ilk prompt'u:** prompts/ taslakları bunun yerine geçmez. Ham konuşma dışa aktarımı gerekir. Yalnız-SPEC uygulayıcısının gerçek ilk prompt'u saklıdır.
- **Yaklaşık geliştirme tokenı/maliyet:** sağlayıcı usage kaydı mevcut değil; AGENT_COST.md eksikliği açıkça belirtir.
- **REA kontrolünün ajan cevabı ekran görüntüsü:** gerçek REA doctor raporu ve rapor sayfası ayrıca verilir; bunlar bir ajan konuşması ekran görüntüsü diye sunulmaz.
- **Harici CONTRACT.md:** ödev metninde gerçek bağlantı yoktur. CLI'nin hocanın sözleşmesiyle birebir doğrulanması için bu içerik gerekir.
- **Gizli test kapısı:** yerel eşleşme oranı hocanın gizli N testlerinde %90 garantisi değildir. GUI-10 bilinen büyük-N farkı korunur.

İncelenen binary dağıtılmaz; eğitim amacı ve atıflar LEGAL.md içindedir. Gerçek hasta verisi kullanılmaz.
