# PairedLab — eşleştirilmiş ortalama t-testi

**Eğitim ve araştırma amaçlı ders projesidir.** G*Power'ın resmi veya onaylı bir sürümü değildir. Orijinal program ve kaynak kodu dağıtılmaz; inceleme kapsamı, atıflar ve paylaşım açıklaması [LEGAL.md](LEGAL.md) içindedir.

YZM301 Teardown Sprint projesi. İncelenen hesap: **t tests → Means: Difference between two dependent means (matched pairs)**. Proje; REA/Ghidra incelemesi, kanıt defteri, kabul kriterleri, TypeScript hesaplama katmanı, bağımsız temiz oda uygulaması, CLI ve stdio MCP sunucusunu içerir.

## Teslim özeti

**Teslim katmanları:** CLI, MCP ve Ollama üzerinden Türkçe soruyu yorumlayıp gerçek MCP aracını çağıran AI ajanı vardır. [AI ajanı kurulumu ve ölçüm yöntemi](AI_AGENT.md). Puan ve gizli test kapısı öğretim elemanının değerlendirmesine bağlıdır. Açık teslim maddeleri [SUBMISSION.md](SUBMISSION.md) içinde belirtilir.

**Sürümler:** G*Power 3.1.9.7 Windows; REA 6.5.0; Ghidra 12.1.2; JDK 21; Node.js 22.23.2; PairedLab paket sürümü 1.0.0.

**İncelenen GPowerNT.exe SHA-256:** `c63e6a133eb6372932f810c08cc33dc35a06d1ddb658f897bd6c34a754efc812` (2.287.616 bayt). Binary paylaşılmaz; [kimlik kaydı](evidence/rea-artifact.json).

**60 saniyelik CLI demo:** [MP4 video](demo/cli-demo.mp4) · [kayıt ve yeniden üretim](demo/README.md). Gerçek komut çıktılarının terminal kaydı görselleştirmesidir; masaüstü ekran çekimi değildir.

**Atıf:** Faul, Erdfelder, Lang ve Buchner (2007), [doi:10.3758/BF03193146](https://doi.org/10.3758/BF03193146); Faul, Erdfelder, Buchner ve Lang (2009), [doi:10.3758/BRM.41.4.1149](https://doi.org/10.3758/BRM.41.4.1149). Orijinal G*Power yazarlarına ait haklar saklıdır.

### Klinik örnek

Aynı hastaların tedavi öncesi ve sonrası tansiyonu ölçülür. Örnek varsayım: farkların ortalaması 10, farkların standart sapması 20 ise dz=10/20=0.5. Çift yön, alpha=.05, hedef güç=.95 için sonuç **54 hasta/eşleşmiş çift** olur. Bu 108 ayrı hasta değildir; 54 hastadan ikişer ölçüm alınır. Araç ham veriden p-değeri hesaplamaz; güç ve örneklem planlar.

## Altı maddenin durumu

| Gereksinim | Gerçek teslim ve kanıt |
|---|---|
| 1. REA + Ghidra ile sök | REA 6.5.0 / Ghidra 12.1.2 çalıştırıldı. Binary kimliği, PowerTPairedMean sınıfı, dispatch adayları ve TDist-Cdf çekirdek bölgesi adreslerle kaydedildi. Dolaylı çağrı çözümünün kapsamı LEDGER.md içinde açıkça belirtilir. |
| 2. Kanıt defteri | LEDGER.md: iddia → ham kayıt/adres → SPEC kabul kriteri. |
| 3. SPEC | SPEC.md: gerçek GUI vakalarıyla bağlantılı kabul kriterleri ve çalışma sınırları. |
| 4. Temiz oda yeniden yazım | spec-only/ uygulayıcısı yeni bağlamda yalnız SPEC okudu; gerçek ilk prompt ve oturum kayıtlı. cleanroom/ ayrıca SPEC ve vektörlerle geliştirilmiş önceki bağımsız uygulamadır. Ayrım ve özetler CLEANROOM.md içinde. |
| 5. Diferansiyel test | Genişletilmiş 32 gerçek GUI vakası (31 ekran görüntülü): 31 eşleşme, 1 açık büyük-N sınır farkı. Ayrıca 600 statsmodels referansı, 106 SciPy referansı ve iki kılavuz örneği. |
| 6. CLI ve bonuslar | CLI ve bağımsız CLI'ler; gerçek stdio MCP; yerel Qwen ile Türkçe LLM ajanı. 10 soruluk ölçüm, gerçek kullanım sayaçları ve çağrı kayıtları AI_AGENT.md içinde. Önceki kurallı demo ayrı komutlarla korunur. |

## Kurulum ve kullanım

Node.js 22 ile doğrulandı.

```sh
npm ci
npm run build
npm run cleanroom:build
npm run spec-only:build
npm test

# CLI
npm run cli -- --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95
npm run cli -- --test t-paired --mode post-hoc --tails 2 --d 0.5 --alpha 0.05 --n 54

# Bağımsız temiz oda CLI'si
npm run cleanroom:cli -- --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95

# Yalnız SPEC ile geliştirilen uygulamanın CLI'si
npm run spec-only:cli -- --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95

npm run mcp
ollama serve
# Ayrı terminalde (qwen3.5:9b modelinin kurulu olması gerekir):
npm run agent -- "Aynı hastalarda önce ve sonra tansiyon için çift yönlü eşleştirilmiş t-testi: dz=0.5, alfa=0.05, %95 güç için kaç hasta gerekir?"
npm run eval
```

Standart sonuç:

```json
{"n_total":54,"actual_power":0.9502,"critical":2.0057,"df":53,"ncp":3.6742}
```

CLI ve MCP, `src/engine/` altındaki ortak hesaplama katmanını kullanır. `cleanroom/` bağımsız yeniden yazımı ve kendi CLI'sini içerir. İki uygulama aynı kabul verileriyle karşılaştırılır.

`spec-only/` yalnız SPEC okuyarak başlatılmış ek bağımsız uygulamadır; uygulayıcısı referans dosyalarını görmemiştir. Üst oturum bu uygulamayı geliştirme sonrasında tutulmuş GUI ve statsmodels verileriyle sınar. [Gerçek ilk prompt](spec-only/FIRST_PROMPT.md).

## Test sonuçları

- Genişletilmiş GUI: **31/32 (%96.875)**; [CSV](oracle/gpower-expanded.csv), [JSON](oracle/gpower-expanded.json), [ekran görüntüleri](oracle/screenshots/), [fark raporu](evidence/expanded-gui-comparison.json). 31 vaka ekran görüntülüdür; GUI-01 yalnız metindir. Beklenen giriş retleri eşleşme sayısına dahildir; GUI-10 dahil değildir.
- Ölçek doğrulaması: **600 statsmodels vektörü**; N/df tam, diğer alanlar dört ondalıkta eşit. [Veri](oracle/statsmodels-vectors.csv), [üretici](scripts/generate-statsmodels.py), [rapor](evidence/statsmodels-comparison.json). Bunlar G*Power GUI kaydı değildir. Kesirli N yukarı yuvarlanır, N ve N-1 güçleriyle minimum eşik ayrıca denetlenir.
- Resmi kılavuz §19.3'ün iki örneği: [test](tests/manual.test.ts), [rapor](evidence/manual-comparison.json).
- Yalnız-SPEC uygulaması: 32 GUI + 600 statsmodels girdisi üzerinden 632 sözleşme kontrolü ve 3 gerçek CLI kontrolü; [rapor](evidence/spec-only-comparison.json). Beklenen retler ve bilinen büyük-N sınırı sayıda bulunur; tüm girdilerde G*Power eşdeğerliği iddia edilmez.
- CLI girdi doğrulaması: kesirli N, geçersiz sayı metni ve güç ≤ alpha dahil 10 hata vakası; [test](tests/cli_validation.test.ts).
- Gerçek Türkçe LLM + MCP: **10/10** doğru aile, parametre ve sayısal sonuç. Aynı soruların canlı G*Power ekranını okuyan modelinde N doğruluğu 7/10; tam sayısal doğruluk 0/10. Ölçülen token toplamı **11.767 / 17.363**; yöntem ve süre sınırları [AI_AGENT.md](AI_AGENT.md) ve [sonuç tablosunda](evidence/ai-agent/RESULTS.md). Desteklenmeyen aile ve eksik parametrelerde iki ek canlı kontrolde hesap yerine açıklama istendi.

Önceki temiz oda devrine ait dondurulmuş 12 vakalık küme ayrıca korunur:

- `npm run test:gui`: 12 gerçek GUI kaydının 11'i eşleşir; GUI-10 yerel arama sınırını aşar. N/df kesin; diğer alanlar GUI'nin dört ondalığa yuvarlanmış değeriyle kesin eşittir. Arayüz kaydının SHA-256 özeti ve CLI de denetlenir. Ham farklar evidence/gui-differential-results.json içindedir.
- SciPy: 106/106 toleranslı ve dört ondalıkta kesin eşleşme. N=2 satırı matematiksel iç fonksiyon üzerinden, ayrıca post-hoc genel API reddiyle test edilir; diğer 105 satır genel API'den geçer.
- MCP: gerçek stdio sunucusu ile CLI arasında 8/8 aynı sonuç.
- `npm run test:cleanroom`: bağımsız motor, ana motor ve onaylı veriler arasında 118/118 sözleşme kontrolü; ayrıca üç bağımsız CLI kontrolü. Bu sayı beklenen retleri de içerir; %100 G*Power eşdeğerliği demek değildir.
- `npm run eval`: gerçek yerel LLM + MCP ölçümü ve kayıtlı ekran görüntülerinin okunması. Canlı GUI karşılaştırması ayrıca AI_AGENT.md içinde belgelenir. `npm run eval:demo` önceki kurallı örnektir; onun maliyetleri varsayımdır, gerçek ölçüm değildir.

Tam eşdeğerlik denetimi: `npm run test:gui:strict`. Bilinen GUI-10 farkı sürdüğü için exit=1 verir. Normal test paketinin yeşil olması bütün G*Power girdilerinin eşdeğer olduğu anlamına gelmez.

## Gerçek programda bulunan sınırlar ve düzeltmeler

Post-hoc N=2 reddedilir; a-priori büyük etkide N=2 üretebilir. Post-hoc dz=.00001 ve .000005 kabul edilir. A-priori dz=.000005 reddedilir; .00001 ve 20 kabul edilir, 100 reddedilir. Bu mod ayrımları belgeler ve giriş kontrollerine işlendi.

Sayısal integrasyon çözünürlüğü küçük N ve büyük etki durumlarını da kapsayacak şekilde ayarlanır. GUI-12 ve bütün SciPy referansları dört ondalıkta eşleşir; standart örnekte N=54 elde edilir.

**Bilinen fark:** G*Power a-priori dz=.00001, alpha=.05, hedef=.95 için N=129940148212 üretir. İki yerel motor da 1.000.000 çift arama sınırında açıklayıcı hata verir. Bu vaka başarılı eşleşme sayılmaz.

## Kanıt ve süreç belgeleri

### MCP araç sözleşmesi

Taşıma stdio; başlatma `npm run mcp`. Araç adı: `calculate_paired_power`. Hesaplar ortak `src/engine/` katmanından gelir.

| Girdi | Tür | Kural |
|---|---|---|
| mode | string | `a-priori` veya `post-hoc`; zorunlu |
| tails | number | 1 veya 2; zorunlu |
| dz | number | Pozitif sonlu etki; a-priori için [0.00001,20]; zorunlu |
| alpha | number | (0,1); zorunlu |
| power | number | A-priori için zorunlu; alpha < power < 1 |
| n | integer | Post-hoc için zorunlu; [3,2147483646] çift |

Başarı cevabı MCP `content` listesindeki `type: text` öğesinde JSON taşır: `n_total` (çift sayısı, integer), `actual_power` (number), `critical` (number), `df` (integer), `ncp` (number). Sayısal alanlar dört ondalığa yuvarlanır. Hata cevabı `isError: true` ve `content[].text` içinde `{"error":"açıklama"}` içerir. CLI hatası sıfırdan farklı çıkış koduyla JSON verir. A-priori yerel arama sınırı 1.000.000 çifttir. [Gerçek CLI/MCP denklik testi](tests/mcp_equivalence.test.ts).

### Kanıt bağlantıları

- [LEDGER.md](LEDGER.md): binary adresleri, REA ve GUI kayıtları.
- [SPEC.md](SPEC.md): kabul kriterleri.
- [CLEANROOM.md](CLEANROOM.md) ve [uygulayıcı oturumu](cleanroom/SESSION.md): gerçek temiz oda süreci.
- [VERIFICATION.md](VERIFICATION.md): son doğrulama.
- [evidence/README.md](evidence/README.md): ham kayıtların kullanımı.
- [HALLUCINATIONS.md](HALLUCINATIONS.md): yanlış çıkarımlar ve yakalayan kanıtlar.
- [AGENT_COST.md](AGENT_COST.md): maliyet varsayımlarının sınırları.

`node scripts/build-gui-vectors.mjs` saklanan arayüz kayıtlarından GUI vektörlerini üretir; GUI'yi yeniden çalıştırmaz. REA sorguları scripts/rea-evidence.mjs içindedir. GPowerNT.exe depoya eklenmez. Eğitim amacı ve atıflar: [LEGAL.md](LEGAL.md).

Genişletilmiş CSV/JSON için `node scripts/build-expanded-gui.mjs`; statsmodels kümesi için `python scripts/generate-statsmodels.py` kullanılır. Python bu ek veri üretiminde kullanılır; uygulamanın çalışma zamanı bağımlılığı değildir.

REA sağlık denetimi: [ham rapor](evidence/rea-doctor-submission.json), [rapor sayfası](evidence/rea-health.html). Ghidra, hedef binary ve mevcut Antigravity kaydı için healthy=true. Bu, Codex kaydının kurulu olduğunu veya tüm isteğe bağlı sağlayıcıların hazır olduğunu göstermez. Ajan cevabının ekran görüntüsü henüz eklenmedi; ham rapor bunun yerine konuşma ekran görüntüsü diye sunulmaz.
