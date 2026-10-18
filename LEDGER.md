# Kanıt defteri — eşleştirilmiş ortalama t-testi

18 Ekim 2026. Ders etiketleri: **[DOK]** kılavuz/makale, **[REA]** adresli binary bulgusu, **[AJAN]** binary'den kanıtlanmamış çıkarım. Ek kaynak türleri: [GUI] program gözlemi; [MAT] matematik modeli; [YEREL] uygulama sözleşmesi. GUI gözlemi veya test başarısı kendiliğinden [REA] kanıtı sayılmaz. Ham çıktılar evidence/ altında; kanonik REA kayıtlarının evidence_id alanları korunur. Fonksiyon metaveri projeksiyonlarında source_evidence_id kullanılır; bunlar tam kanonik çıktı diye sunulmaz.

## Ders etiketleriyle iddia ayrımı

| Etiket | İddia | Kaynak / sınama |
|---|---|---|
| [DOK] | Eşleştirilmiş test farkların dz etkisini ve N çiftini kullanır; df=N-1, delta=dz*sqrt(N) | [Resmi kılavuz](https://www.psychologie.hhu.de/fileadmin/redaktion/Fakultaeten/Mathematisch-Naturwissenschaftliche_Fakultaet/Psychologie/AAP/gpower/GPowerManual.pdf), §19.1 ve §19.5, basılı s.48–49 |
| [DOK] | §19.3 örnekleri N=50 için güç .832114 ve .500352 verir | tests/manual.test.ts; evidence/manual-comparison.json. Kılavuzdaki yuvarlanmış dz yerine belgelenen grup parametrelerinden tam dz kullanılır |
| [REA] | TDist-Cdf hata dizeleri FUN_004fa7e0'da, 0x4fa7e0–0x4faa33 aralığında kullanılır | REA-06 ve çekirdek metaverisi |
| [AJAN] | PowerTPairedMean RTTI pointer düzeni 0x5cac60 çevresinde bir dispatch tablosuna işaret eder | REA-13'te ham pointer kanıtı var; sınıf sınırı ve uçtan uca sanal çağrı yorumu kesin değildir. Girdi/çıktı eşdeğerliği GUI testleriyle sınanır; bunlar iç çağrı yolunu kanıtlamaz |
| [AJAN] | Orijinal program ikili aramayla minimum N bulur | Doğrulanmadı; orijinal algoritma özelliği olarak kabul edilmez. GUI-02/03/04 yalnız sonuç eşiğini sınar |
| [AJAN] | Yerel uygulamanın bütün G*Power girdilerinde eşdeğer olduğu varsayımı | Desteklenmiyor; GUI-10 çürütür. GUI ve statsmodels fark raporları sınanmış kapsamı gösterir |

REA-01…REA-12 aşağıdaki adresli bulgu kimlikleridir. REA-13'teki pointer değerleri gözlemdir; pointer düzeninin sınıf/dispatch yorumu yukarıdaki [AJAN] satırına aittir. G*Power'ın arama sırası ve bütün dolaylı çağrı yolu çözüldü diye sunulmaz.

## Binary ve analiz kimliği

| Kimlik | İddia | Kanıt | Sınır |
|---|---|---|---|
| REA-01 | GPowerNT.exe, 2.287.616 bayt; SHA-256 c63e6a133eb6372932f810c08cc33dc35a06d1ddb658f897bd6c34a754efc812 | [rea-artifact.json](evidence/rea-artifact.json) | Binary depoda yok |
| REA-02 | Ghidra 12.1.2 ile PE32 x86 analizi; taban 0x400000; 9116 prosedür, 2570 tanımlı dize | [rea-analysis.json](evidence/rea-analysis.json) | Yalnız Ghidra'nın tanıdığı envanter; orijinal sembollerin tamamı değildir |
| REA-03 | Paired test adı 0x5cb56c; 0x4dcf4a kaynağından referans; kapsayan fonksiyon FUN_004dcf10 | [rea-matched-strings.json](evidence/rea-matched-strings.json), [rea-matched-trace.json](evidence/rea-matched-trace.json), [metaveri](evidence/rea-paired-descriptor-metadata.json) | Test tanımına giden yol; bu fonksiyona hesap motoru adı verilmez |
| REA-04 | nctcdf / nctinv / nctpdf dizeleri 0x5e37dc / 0x5e37e4 / 0x5e37ec | [rea-nct-strings.json](evidence/rea-nct-strings.json) | Fonksiyon sembolü değildir. [Prosedür araması](evidence/rea-nct-procedures.json) bu adlarda sayısal fonksiyon göstermiyor |
| REA-05 | 0.00001 mesajları 0x5cb220 ve 0x5cb510 adreslerinde var | [rea-limit-strings.json](evidence/rea-limit-strings.json) | Mesajın mod kapsamı ayrıca GUI-07/08/09/10 ile sınandı |
| REA-06 | TDist-Cdf hata dizeleri FUN_004fa7e0 içinde kullanılıyor; fonksiyon 0x4fa7e0–0x4faa33 | [rea-tdist-trace.json](evidence/rea-tdist-trace.json), [çekirdek metaverisi](evidence/rea-kernel-0x4fa7e0-metadata.json) | Hata yönetimi ve CDF çekirdek bölgesi bulunmuştur; tam sayısal algoritma çıkarıldığı iddia edilmez |
| REA-07 | FUN_004fa7e0, FUN_004f9fa0 çağrısı içerir; çağıranlar 0x4b0d50, 0x4fb440, 0x567520 | [çekirdek metaverisi](evidence/rea-kernel-0x4fa7e0-metadata.json) | Paired test ile kesin çağrı yolu ek metaveri üzerinden incelenir |

## Gerçek giriş/çıkış gözlemleri ve kabul kriterleri

Her ham JSON kaydının özeti [oracle/gpower-gui.json](oracle/gpower-gui.json) içindedir. Test: [gpower_gui.test.ts](tests/gpower_gui.test.ts). Ekran görüntüleri aynı GUI numarasıyla evidence/ altındadır; GUI-01 yalnız arayüz metni kaydıdır.

| Kimlik | Gözlem | Ham kanıt | SPEC bağlantısı |
|---|---|---|---|
| GUI-01 | Tek yön, dz=.5, alpha=.05, hedef=.95 → N=45, df=44, güç=.9512400 | [kayıt](evidence/gui-01-one-tail.json) | AC-02 |
| GUI-02 | Çift yön, aynı girdiler → N=54, df=53, güç=.9502120 | [kayıt](evidence/gui-02-two-tail.json), [ekran](evidence/gui-02-0.jpg) | AC-01 |
| GUI-03 | Post-hoc N=54 → güç=.9502120 | [kayıt](evidence/gui-03-posthoc54.json), [ekran](evidence/gui-03-0.jpg) | AC-03 |
| GUI-04 | Post-hoc N=53 → güç=.9465273; hedef .95 sağlanmaz | [kayıt](evidence/gui-04-posthoc53.json), [ekran](evidence/gui-04-0.jpg) | AC-04 |
| GUI-05 | Post-hoc N=2 reddi; hata metni aralığı (3, 2147483646) | [kayıt](evidence/gui-05-min-n-error.json), [ekran](evidence/gui-05-0.jpg) | AC-05 |
| GUI-06 | Post-hoc N=3 kabul; df=2, güç=.0841071 | [kayıt](evidence/gui-06-posthoc3.json), [ekran](evidence/gui-06-0.jpg) | AC-06 |
| GUI-07 | Post-hoc N=3, dz=.00001 kabul; güç=.0500000 | [kayıt](evidence/gui-07-dz-limit.json), [ekran](evidence/gui-07-0.jpg) | AC-07 |
| GUI-08 | Post-hoc N=3, dz=.000005 kabul; güç=.0500000 | [kayıt](evidence/gui-08-dz-below.json), [ekran](evidence/gui-08-0.jpg) | AC-07 |
| GUI-09 | A-priori dz=.000005 reddi; hata özellikle a-priori modunu adlandırır | [kayıt](evidence/gui-09-apriori-dz-error.json), [ekran](evidence/gui-09-0.jpg) | AC-10 |
| GUI-10 | A-priori dz=.00001 kabul; hedef .95 için N=129940148212 | [kayıt](evidence/gui-10-apriori-exact-limit.json), [ekran](evidence/gui-10-0.jpg) | AC-11; bilinen uyumsuzluk |

GUI-02/03/04 standart girdide en küçük N eşiğini destekler; orijinal aramanın artan sırada mı ikili aramayla mı yürüdüğünü kanıtlamaz. GUI-07/08 eski genel dz alt sınırı iddiasını çürütür. GUI-09/10, a-priori alt sınırının tam eşik değerini kabul ettiğini gösterir.

## Matematik modeli ve yerel sınırlar

[MAT] Yeniden yazım df=N-1, delta=dz*sqrt(N), merkezi t kritik değeri ve merkezi olmayan t dağılımının kuyruk olasılıklarını kullanır. Model [SPEC.md](SPEC.md) içinde tanımlanır; [math.ts](src/engine/math.ts) ve [t_paired.ts](src/engine/t_paired.ts) içinde uygulanır. Bu formüllerin binary'den satır satır çıkarıldığı iddia edilmez. SciPy kümesi ek çapraz doğrulamadır.

[YEREL] Sayısal motorun a-priori arama sınırı 1.000.000 çifttir. GUI-10 bu sınırı aşar: orijinal program sonuç üretirken yerel motor açıklayıcı hata verir. Bu vaka tam eşleşme sayılmaz. Ham değer farkları ve eşleşme sayısı [gui-differential-results.json](evidence/gui-differential-results.json) içindedir.

[YEREL] CLI/MCP alan denklik testi gerçek stdio bağlantısı üzerinden yapılır; byte-for-byte serileştirme iddia edilmez. AI demosu kurallıdır; LLM bonusu değildir. Temiz oda geçmişinin sınırları [CLEANROOM.md](CLEANROOM.md) içindedir.

## Ek statik izler

- [REA-08] [PowerT RTTI dizeleri](evidence/rea-power-t-types.json): .?AVPowerTPairedMean@@ adresi 0x60ce90. Bu sınıf adı binary'de gözlenmiştir; tek başına sanal çağrı çözümü değildir.
- [REA-09] [Paired tanım metaverisi](evidence/rea-paired-descriptor-metadata.json) 0x5cacd8 veri adresinden FUN_004dcf10 fonksiyonuna referans gösterir. [256 baytlık pointer penceresi](evidence/paired-pointer-window.json) ilgili adreslerin PE dosya ofsetlerini verir; komşuluk tek başına sınıf sınırı değildir.
- [REA-10] [FUN_004db990 metaverisi](evidence/rea-paired-0x4db990-metadata.json), a-priori öneki 0x5cb24c ve eşik mesajı 0x5cb510 referanslarını aynı fonksiyonda gösterir. Bu statik mesaj gruplaması GUI-09/10 mod ayrımını destekler.
- [REA-11] [FUN_004fb440 metaverisi](evidence/rea-paired-0x4fb440-metadata.json), FUN_004fa7e0 ve sqrt yordamını çağırır. [FUN_004f9fa0 metaverisi](evidence/rea-paired-0x4f9fa0-metadata.json) sayısal alt yordamların çağrılarını gösterir. Elde edilen çağrı zinciri 0x4fb440 → 0x4fa7e0 → 0x4f9fa0 olarak yeniden incelenebilir. Paired sınıfın bütün sanal dispatch yolunun bu zincire kesin bağlandığı henüz kanıtlanmış değildir.

[REA-12] [Hedefe özel sağlık raporu](evidence/rea-doctor-ghidra.json): seçili Ghidra sağlayıcısı ve hedef binary için healthy=true, ghidra available=true. Bu sonuç bütün isteğe bağlı REA sağlayıcılarının kurulu olduğunu iddia etmez. [Derleme çıktısı](evidence/build-output.txt) ve [test çıktısı](evidence/test-output.txt) ham yerel doğrulama kayıtlarıdır.

[REA-13 / PE veri yorumu] PowerTPairedMean adının 0x60ce90 adresinden, 0x60ce88 tür tanımı adayına, 0x5ef6a0 RTTI locator adayına ve 0x5cac60 dispatch tablosu adayına uzanan pointer düzeni [paired-pointer-window.json](evidence/paired-pointer-window.json) içinde sayısal alanlarla kayıtlıdır. Bu yorumla seçilen 0x5cac6c slotu FUN_004dc9d0'ı gösterir. [FUN_004dc9d0 metaverisi](evidence/rea-paired-0x4dc9d0-metadata.json), 0x4dca4d çağrı yerinden FUN_004dc230'a doğrudan çağrıyı doğrular. [FUN_004dc0b0](evidence/rea-paired-0x4dc0b0-metadata.json) ve [FUN_004dbdc0](evidence/rea-paired-0x4dbdc0-metadata.json) sqrt çağrıları içerir. Bu gözlemler paired hesap bölgesini daraltır; dolaylı çağrıların tamamı çözülmediğinden dağılım çekirdeğine uçtan uca dinamik iz iddia edilmez.

## Son GUI ve temiz oda doğrulamaları

Teslim denetimindeki ek GUI-13…GUI-32 vakaları `evidence/gui-expanded/` altında gerçek arayüz metni, yakalama zamanı ve ekran görüntüsü yollarıyla kayıtlıdır. `oracle/gpower-expanded.json` ham kayıt ve ekran görüntülerinin SHA-256 özetlerini taşır; `oracle/gpower-expanded.csv` dersin CSV teslimidir. `tests/expanded_gui.test.ts` her kaydın özetini ve iki uygulamanın bütün sayısal alanlarını denetler. 32 vakanın 31'i ekran görüntülüdür; GUI-01 yalnız metin kaydı olarak korunur. Eşleşme 31/32; GUI-10 başarı sayılmaz. Bu davranış kayıtları [GUI] kanıtıdır; binary fonksiyon ispatı diye [REA] etiketlenmez.

Ek yalnız-SPEC oturumunun girdisi ve gerçek ilk prompt'u `evidence/spec-only-handoff.json` ve `spec-only/FIRST_PROMPT.md` içindedir. 632 dış sözleşme + 3 CLI kontrolü `evidence/spec-only-comparison.json` içinde kayıtlıdır. Yeni uygulayıcı oracle dosyalarını görmedi. Test başarısı uygulayıcı bağlam ayrımının yerine geçmez; ayrım ayrıca oturum ve devir kaydına dayanır.

- GUI-11 / AC-12: [ham kayıt](evidence/gui-11-dz-upper-error.json), [ekran](evidence/gui-11-0.jpg). A-priori dz=100 reddedilir; aralık mesajı (-20,20).
- GUI-12 / AC-13: [ham kayıt](evidence/gui-12-apriori-minimum.json), [ekran](evidence/gui-12-0.jpg). A-priori dz=20 kabul; N=2, df=1, power=.9735240, critical=12.7062047, ncp=28.2842712. Bu, post-hoc N alt sınırının a-priori aramaya taşınamayacağını kanıtlar.
- SAYISAL-01: GUI-12 eski ana motorun dört ondalık güç sonucunda .9746 ürettiğini, orijinal GUI'nin .9735240 verdiğini gösteren karşılaştırmayı tetikledi. Formül korunarak Simpson ızgarasının çözünürlüğü CDF argümanı değişimine göre artırıldı. Düzeltilmiş sonuç .9735; SciPy referansları artık dört ondalıkta 106/106. [Son test çıktısı](evidence/test-output.txt).
- TEMIZ-01: Kullanıcı onayıyla /root/cleanroom_implementation ayrı bağlamda yalnız SPEC ve sayısal vektörleri aldı. [Devir kaydı](evidence/cleanroom-handoff.json), [uygulayıcı oturumu](cleanroom/SESSION.md), [bağımsız kaynak](cleanroom/t_paired.ts), [118 sözleşme + 3 CLI karşılaştırması](evidence/cleanroom-comparison.json). İlk turun 116 kontrolü ve girdileri evidence/cleanroom-round1/ altında arşivli; yeni iki GUI kriteriyle ikinci tur gerçek geri bildirim döngüsü olarak kaydedildi.
- Son GUI oranı 11/12 (%91.67); tek kalan fark GUI-10 arama üst sınırıdır. Bilinen uyumsuzluk başarıya sayılmaz. Mevcut MCP/CLI 8/8; bağımsız uygulama kendi CLI'sini sunar, ana motorun yerine geçirilmez.
