# Yeniden üretilebilir kanıtlar

Hedef: G*Power 3.1.9.7 Windows, SHA-256 c63e6a133eb6372932f810c08cc33dc35a06d1ddb658f897bd6c34a754efc812. Binary bu depoya eklenmez.

## Statik analiz

- rea-artifact.json: gerçek REA artifact kimliği, hash ve boyut.
- rea-analysis.json: REA + Ghidra 12.1.2 analizi; PE32 x86, image base 0x400000, 9116 prosedür ve 2570 tanımlı dize.
- rea-matched-strings.json: paired test adı 0x5cb56c.
- rea-matched-trace.json: dizeyi kullanan 0x4dcf4a adresi ve kapsayan FUN_004dcf10 fonksiyonu. Bu yalnız test tanımlama yoludur; hesap çekirdeği diye sunulmaz.
- rea-nct-strings.json: nctcdf 0x5e37dc, nctinv 0x5e37e4, nctpdf 0x5e37ec dize adresleri. Fonksiyon adı kanıtı değildir.
- rea-limit-strings.json: 0.00001 mesajlarının adresleri. Mod kapsamı GUI testleriyle ayrıca doğrulanır.
- rea-nct-procedures.json: nct metniyle prosedür araması. Yakalanan MFC/import adları sayısal çekirdek olarak yorumlanmaz.
- rea-doctor.json ilk yapılandırılmamış ortam kaydıdır. Sonraki başarılı analizler süreç içi GHIDRA_INSTALL_DIR ve JAVA_HOME ile yapılmıştır; sistem ayarları değiştirilmemiştir.

REA MCP betiği scripts/rea-evidence.mjs içindedir. --collect temel dizeler ve xref; --deep ek sabit salt okunur sorgular toplar. Fonksiyon dosyaları yalnız metaveri projeksiyonudur; decompile ve assembly gövdeleri kaydedilmez. Kanonik REA Evidence ile bu projeksiyonlar ayrı adlandırılır.

## Gerçek GUI kayıtları

GUI-01 yalnız arayüz metni kaydıdır. Diğer GUI vakalarında JSON arayüz ağacı ve jpg ekran görüntüleri birlikte saklanır. JSON içinde girdi/çıktı kontrollerinin Windows ID alanları vardır. Bazı ekran görüntülerinde açık seçim listeleri bulunur; ham değerler JSON kaydındadır.

Kontroller: 1021=dz, 1022=alpha, 1023=hedef güç veya N, 1040=kuyruk, 1001=test, 1002=mod. Çıktı 1050=ncp, 1051=critical, 1052=df; a-priori 1053=N ve 1054=power; post-hoc 1053=power.

`node scripts/build-gui-vectors.mjs` bu ham kayıtlardan oracle/gpower-gui.json dosyasını üretir. Her vektör kendi ham JSON SHA-256 özetini taşır. `npm run test:gui` aynı girdileri yerel CLI ve motora verip beş alanı dört ondalıkta karşılaştırır; gözlenen reddi de doğrular. Ham GUI değerleriyle farklar gui-differential-results.json içine yazılır.

SciPy kaynaklı oracle/vectors.csv ayrı ek doğrulama kümesidir; G*Power ekranından toplandığı iddia edilmez.

## Ek fonksiyon incelemeleri

--paired seçeneği, paired tanım referansının yakınındaki sabit aday adresler için metaveri toplar. Pointer komşuluğu kesin vtable sınırı olarak sunulmaz. PowerTPairedMean RTTI adı 0x60ce90'da; a-priori eşik mesajlarını kullanan aday FUN_004db990; sayısal zincir FUN_004fb440 → FUN_004fa7e0 → FUN_004f9fa0 olarak kaydedilmiştir. Paired sınıfın bütün dispatch yolunu bu zincire bağlamak hâlâ ek çalışma gerektirir.

Başka bilgisayarda REA betiği için GPOWER_BINARY, REA_ENTRYPOINT, GHIDRA_INSTALL_DIR ve JAVA_HOME süreç ortam değişkenleri kullanılabilir. Sistem ayarları değiştirilmez. `python scripts/pe-pointer-evidence.py <binary-path>` yalnız hedef SHA-256 eşleşirse sabit veri-pointer penceresini yeniden çıkarır.

Son durum: rea-doctor-ghidra.json hedefe özel Ghidra kontrolünde healthy=true kaydeder. build-output.txt ve test-output.txt son derleme ve normal test komutlarının UTF-8 ham çıktılarıdır.

## Bağımsız temiz oda ve son sonuçlar

cleanroom-handoff.json izin verilen üç girişin SHA-256 özetlerini, ayrı uygulayıcı bağlamını, ilk/ikinci tur ayrımını ve bağımsız çıktı özetlerini kaydeder. cleanroom-round1/ ilk tur girdileri ve 116 kontrollük sonucu korur. Güncel cleanroom-comparison.json 118 sözleşme ve 3 CLI kontrolü; temiz oda derleme/doğrulama txt dosyaları gerçek komut çıktılarıdır.

Son GUI kümesi 12 kayıt, 11 eşleşme ve GUI-10 için tek arama sınırı farkıdır. GUI-11 a-priori dz üst sınırını, GUI-12 a-priori N=2 kabulünü kaydeder. GUI-12 ile sayısal integrasyon çözünürlüğü düzeltildi; mevcut SciPy kümesi dört ondalıkta 106/106 eşleşir. Statik analiz çıktıları kaynak kod için bağımsız uygulayıcıya aktarılmadı.

.gitattributes, özetleri tutulan SPEC, oracle, evidence ve cleanroom dosyalarında Git satır sonu dönüşümünü kapatır; byte-level kanıt özetleri farklı bilgisayarda korunur.
