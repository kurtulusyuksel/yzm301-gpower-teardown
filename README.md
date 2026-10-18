# G*Power — eşleştirilmiş ortalama t-testi

**Eğitim ve araştırma amaçlı ders projesidir.** G*Power'ın resmi veya onaylı bir sürümü değildir. Orijinal program ve kaynak kodu dağıtılmaz; inceleme kapsamı, atıflar ve paylaşım açıklaması [LEGAL.md](LEGAL.md) içindedir.

YZM301 Teardown Sprint projesi. İncelenen hesap: **t tests → Means: Difference between two dependent means (matched pairs)**. Proje; REA/Ghidra incelemesi, kanıt defteri, kabul kriterleri, TypeScript hesaplama katmanı, bağımsız temiz oda uygulaması, CLI ve stdio MCP sunucusunu içerir.

## Önce ve sonra tansiyon örneği

Aynı hastaların tedavi öncesi ve sonrası tansiyonu ölçülür. Örnek varsayım: farkların ortalaması 10, farkların standart sapması 20 ise dz=10/20=0.5. Çift yön, alpha=.05, hedef güç=.95 için sonuç **54 hasta/eşleşmiş çift** olur. Bu 108 ayrı hasta değildir; 54 hastadan ikişer ölçüm alınır. Araç ham veriden p-değeri hesaplamaz; güç ve örneklem planlar.

## Altı maddenin durumu

| Gereksinim | Gerçek teslim ve kanıt |
|---|---|
| 1. REA + Ghidra ile sök | REA 6.5.0 / Ghidra 12.1.2 çalıştırıldı. Binary kimliği, PowerTPairedMean sınıfı, dispatch adayları ve TDist-Cdf çekirdek bölgesi adreslerle kaydedildi. Dolaylı çağrı çözümünün kapsamı LEDGER.md içinde açıkça belirtilir. |
| 2. Kanıt defteri | LEDGER.md: iddia → ham kayıt/adres → SPEC kabul kriteri. |
| 3. SPEC | SPEC.md: gerçek GUI vakalarıyla bağlantılı kabul kriterleri ve çalışma sınırları. |
| 4. Temiz oda yeniden yazım | Ayrı bağlamdaki uygulayıcı yalnız SPEC ve sayısal vektörlerle cleanroom/ altında bağımsız hesaplama katmanı ve CLI geliştirdi. İki doğrulama turu, girdi özetleri ve oturum kaydı CLEANROOM.md içinde. |
| 5. Diferansiyel test | 12 gerçek G*Power GUI vakası: 11 eşleşme, 1 açık büyük-N sınır farkı (%91.67). Ayrıca 106 SciPy referansı ve bağımsız motorla 118 sözleşme kontrolü. |
| 6. CLI ve bonuslar | CLI ve bağımsız temiz oda CLI'si çalışıyor. MCP gerçek stdio bağlantısıyla 8 vakada doğrulandı. Türkçe demo kural tabanlıdır; LLM ajanı bonusu kapsam dışındadır. |

## Kurulum ve kullanım

Node.js 22 ile doğrulandı.

```sh
npm ci
npm run build
npm run cleanroom:build
npm test

# CLI
npm run cli -- --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95
npm run cli -- --test t-paired --mode post-hoc --tails 2 --d 0.5 --alpha 0.05 --n 54

# Bağımsız temiz oda CLI'si
npm run cleanroom:cli -- --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95

npm run mcp
npm run agent -- "dz=0.5, alfa=0.05, %95 güç için kaç hasta gerekir?"
npm run eval
```

Standart sonuç:

```json
{"n_total":54,"actual_power":0.9502,"critical":2.0057,"df":53,"ncp":3.6742}
```

CLI ve MCP, `src/engine/` altındaki ortak hesaplama katmanını kullanır. `cleanroom/` bağımsız yeniden yazımı ve kendi CLI'sini içerir. İki uygulama aynı kabul verileriyle karşılaştırılır.

## Test sonuçları

- `npm run test:gui`: 12 gerçek GUI kaydının 11'i eşleşir; GUI-10 yerel arama sınırını aşar. N/df kesin; diğer alanlar GUI'nin dört ondalığa yuvarlanmış değeriyle kesin eşittir. Arayüz kaydının SHA-256 özeti ve CLI de denetlenir. Ham farklar evidence/gui-differential-results.json içindedir.
- SciPy: 106/106 toleranslı ve dört ondalıkta kesin eşleşme. N=2 satırı matematiksel iç fonksiyon üzerinden, ayrıca post-hoc genel API reddiyle test edilir; diğer 105 satır genel API'den geçer.
- MCP: gerçek stdio sunucusu ile CLI arasında 8/8 aynı sonuç.
- `npm run test:cleanroom`: bağımsız motor, ana motor ve onaylı veriler arasında 118/118 sözleşme kontrolü; ayrıca üç bağımsız CLI kontrolü. Bu sayı beklenen retleri de içerir; %100 G*Power eşdeğerliği demek değildir.
- `npm run eval`: 10/10 kurallı Türkçe demo. Token/GUI maliyetleri tahmin ve varsayımdır; sağlayıcı ölçümü değildir.

Tam eşdeğerlik denetimi: `npm run test:gui:strict`. Bilinen GUI-10 farkı sürdüğü için exit=1 verir. Normal test paketinin yeşil olması bütün G*Power girdilerinin eşdeğer olduğu anlamına gelmez.

## Gerçek programda bulunan sınırlar ve düzeltmeler

Post-hoc N=2 reddedilir; a-priori büyük etkide N=2 üretebilir. Post-hoc dz=.00001 ve .000005 kabul edilir. A-priori dz=.000005 reddedilir; .00001 ve 20 kabul edilir, 100 reddedilir. Bu mod ayrımları belgeler ve giriş kontrollerine işlendi.

Sayısal integrasyon çözünürlüğü küçük N ve büyük etki durumlarını da kapsayacak şekilde ayarlanır. GUI-12 ve bütün SciPy referansları dört ondalıkta eşleşir; standart örnekte N=54 elde edilir.

**Bilinen fark:** G*Power a-priori dz=.00001, alpha=.05, hedef=.95 için N=129940148212 üretir. İki yerel motor da 1.000.000 çift arama sınırında açıklayıcı hata verir. Bu vaka başarılı eşleşme sayılmaz.

## Kanıt ve süreç belgeleri

- [LEDGER.md](LEDGER.md): binary adresleri, REA ve GUI kayıtları.
- [SPEC.md](SPEC.md): kabul kriterleri.
- [CLEANROOM.md](CLEANROOM.md) ve [uygulayıcı oturumu](cleanroom/SESSION.md): gerçek temiz oda süreci.
- [VERIFICATION.md](VERIFICATION.md): son doğrulama.
- [evidence/README.md](evidence/README.md): ham kayıtların kullanımı.
- [HALLUCINATIONS.md](HALLUCINATIONS.md): yanlış çıkarımlar ve yakalayan kanıtlar.
- [AGENT_COST.md](AGENT_COST.md): maliyet varsayımlarının sınırları.

`node scripts/build-gui-vectors.mjs` saklanan arayüz kayıtlarından GUI vektörlerini üretir; GUI'yi yeniden çalıştırmaz. REA sorguları scripts/rea-evidence.mjs içindedir. GPowerNT.exe depoya eklenmez. Eğitim amacı ve atıflar: [LEGAL.md](LEGAL.md).
