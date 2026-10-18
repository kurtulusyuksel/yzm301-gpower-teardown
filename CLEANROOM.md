# Temiz oda geliştirme yöntemi

## Ayrı bağlamlar ve izin verilen girdiler

18 Ekim 2026 tarihinde inceleme ve uygulama görevleri ayrı ajan bağlamlarında yürütüldü. İnceleyen oturum /root; uygulayıcı oturum /root/cleanroom_implementation. Uygulayıcıya inceleme konuşması aktarılmadı (context inheritance: none).

Uygulayıcının görev girdileri yalnız SPEC.md, oracle/gpower-gui.json ve oracle/vectors.csv idi. Orijinal binary, decompile çıktıları, mevcut src/ ve tests/, LEDGER.md, README.md ve evidence/ okumaması talimatlandırıldı. Ayrım aynı dosya sistemi üzerinde ayrı bağlam ve okuma listesiyle sağlandı; işletim sistemi düzeyinde erişim engeli iddia edilmez. Uygulayıcı yalnız izin verilen görev girdilerini ve kendi dosyalarını okuduğunu kaydetti. Node'un bir hatada bildirdiği package module türü, oturum kaydında ayrıca açıklanır; mevcut algoritma görülmedi.

Onaylı giriş özetleri, kaynaklar ve bağlam ayarları [devir kaydında](evidence/cleanroom-handoff.json); uygulayıcının gerçek komutları ve sonuçları [SESSION.md](cleanroom/SESSION.md) içindedir.

## Bağımsız yeniden yazım

[cleanroom/t_paired.ts](cleanroom/t_paired.ts) bağımsız sayısal motor; [cleanroom/cli.ts](cleanroom/cli.ts) ayrı CLI'dir. src/engine/ hesaplama katmanından import yapmaz, test vektörlerini çalışma zamanında okumaz ve sonuçları sabitlemez. Uygulayıcı merkezi normal/ki-kare koşullandırması, uyarlamalı integrasyon ve tamsayı araması kullandı. Ayrıntılar [USAGE.md](cleanroom/USAGE.md) içindedir.

CLI ve MCP, src/engine/ hesaplama katmanını kullanır. Temiz oda uygulaması cleanroom/ altında kendi CLI'siyle çalışır; iki uygulama aynı kabul verileriyle karşılaştırılır.

```sh
npm run cleanroom:build
npm run cleanroom:cli -- --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95
npm run test:cleanroom
```

## Gerçek geri bildirim döngüsü

İlk bağımsız sürüm, ilk on GUI kaydı ve CSV kümesiyle doğrulandı. Daha sonra yalnız gerçek G*Power giriş/çıkışından iki yeni vaka üretildi: GUI-11 etki üst sınırı; GUI-12 a-priori N=2 kabulü. SPEC ve sayısal vektörler güncellendi, uygulayıcıya yalnız bu yeni kabul bilgileri verildi. Mevcut kaynak kodu veya binary aktarılmadı. İlk tur girdileri ve 116 kontrollük karşılaştırma evidence/cleanroom-round1/ altında korunur. İkinci tur uygulaması ve gerçek test sonuçları SESSION.md içinde ayrı kayıtlıdır.

İkinci tur, src/engine/ katmanında küçük N ve büyük etki için integrasyon çözünürlüğünün artırılması gerektiğini de gösterdi. Sayısal çözünürlük formül korunarak iyileştirildi. Bu değişiklik bağımsız uygulayıcıya kod veya algoritma olarak verilmedi.

## Yalnız SPEC ile başlayan ek uygulama

Hocanın ayrıntılı yönergesindeki “yeni oturumda yalnız SPEC” şartı için `/root/spec_only_implementation` ayrı bağlamı başlatıldı. Bu uygulayıcıya yalnız SPEC.md okuma izni verildi; oracle dosyaları, inceleme konuşması, kaynak kodu, kanıt defteri ve Ghidra çıktıları aktarılmadı. Ürün `spec-only/` altındadır. Gerçek ilk talimat [FIRST_PROMPT.md](spec-only/FIRST_PROMPT.md), süreç [SESSION.md](spec-only/SESSION.md), girdi ve çıktı SHA-256 kayıtları [devir dosyası](evidence/spec-only-handoff.json) içindedir.

Bu uygulama tamamlandıktan sonra üst oturum, uygulayıcının görmediği GUI ve statsmodels verileriyle karşılaştırma yapar: [tests/spec_only.test.ts](tests/spec_only.test.ts). Kaynak düzeyinde paylaşım yapılmaz. Bu ayrım da ortak dosya sisteminde bağlam ve okuma listesiyle sağlanır; OS erişim engeli değildir. CLI `npm run spec-only:cli -- ...`, derleme `npm run spec-only:build` ile çalışır. Üretim CLI/MCP kaynakları bu uygulamayla değiştirilmez.

İlk iki turun özgün SPEC'i `evidence/cleanroom-round2/approved-spec.md` içinde korunur. Teslim için Gherkin genişletmesi yapılan güncel SPEC'in özeti yalnız-SPEC devir kaydında ayrıca sabitlenmiştir.

## Ortak çalışma sınırları

Bu belgedeki temiz oda süreç kanıtları cleanroom/ uygulamasını kapsar. GUI-10 iki yerel uygulamanın 1.000.000 çift arama sınırını aşar; tam G*Power eşdeğerliği iddia edilmez. Bağımsız uygulamanın MCP adaptörü yoktur; kendi CLI'si vardır. MCP sunucusu ayrı stdio testleriyle doğrulanır.
