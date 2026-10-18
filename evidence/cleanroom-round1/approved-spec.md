# SPEC — Eşleştirilmiş ortalama t-testi

Sürüm: 18 Ekim 2026. Hedef: G*Power 3.1.9.7, t tests → Means: Difference between two dependent means (matched pairs).

## Kapsam ve anlam

Aynı hastanın tedavi öncesi ve sonrası tansiyonu karşılaştırılır. N hasta/eşleşmiş çift sayısıdır; iki ölçüm alınması N'yi ikiye katlamaz. Bu araç ham tansiyon verisinden p-değeri hesaplayan bir t-testi uygulaması değildir; planlama için gerekli örneklem ve mevcut örneklemin gücünü hesaplar. Kullanıcı farkların ortalaması ve standart sapmasından dz sağlar.

İşlevsel sözleşme istatistiksel yeniden yazımdır. Orijinal programın kaynak kodunu veya tam iç algoritmasını tarif ettiğimiz iddia edilmez. Kanıt kimlikleri LEDGER.md içindedir.

## Sayısal sözleşme

- df = N - 1; delta = dz * sqrt(N).
- Tek yön: critical = t_quantile(1-alpha, df); power = 1 - nct_cdf(critical, df, delta).
- Çift yön: critical = t_quantile(1-alpha/2, df); power = 1 - nct_cdf(critical, df, delta) + nct_cdf(-critical, df, delta).
- N ve df tamsayı; diğer JSON alanları dört ondalığa yuvarlanır. GUI karşılaştırması da GUI'nin ham değerini dört ondalığa yuvarlar. SciPy ek doğrulaması ayrıca 0.001 tolerans kullanır.
- A-priori hedef: hedef gücü sağlayan en küçük tamsayı N. GUI-02/03/04 bu eşiği standart örnekte doğrular; orijinal programın arama sırası bu sonuçtan çıkarılamaz.

## Kabul senaryoları

| Kimlik | Girdi | Kabul kriteri | Kanıt / test |
|---|---|---|---|
| AC-01 | a-priori, tails=2, dz=0.5, alpha=0.05, power=0.95 | N=54, df=53, power=0.9502, critical=2.0057, ncp=3.6742 | GUI-02; gpower_gui.test.ts |
| AC-02 | a-priori, tails=1, dz=0.5, alpha=0.05, power=0.95 | N=45, df=44, power=0.9512, critical=1.6802, ncp=3.3541 | GUI-01 (arayüz metni kaydı); gpower_gui.test.ts |
| AC-03 | post-hoc, tails=2, dz=0.5, alpha=0.05, n=54 | AC-01 ile aynı sayısal alanlar | GUI-03; gpower_gui.test.ts |
| AC-04 | post-hoc, tails=2, dz=0.5, alpha=0.05, n=53 | power=0.9465 < 0.95, df=52, critical=2.0066, ncp=3.6401 | GUI-04; gpower_gui.test.ts |
| AC-05 | post-hoc, tails=2, dz=0.5, alpha=0.05, n=2 | JSON hata; CLI çıkış kodu 1 | GUI-05; gpower_gui.test.ts |
| AC-06 | post-hoc, tails=2, dz=0.5, alpha=0.05, n=3 | df=2, power=0.0841, critical=4.3027, ncp=0.8660 | GUI-06; gpower_gui.test.ts |
| AC-07 | post-hoc, tails=2, alpha=0.05, n=3, dz=0.00001 veya 0.000005 | Kabul; power=0.0500, df=2; alt sınır bu moda genellenmez | GUI-07/08; gpower_gui.test.ts |
| AC-08 | Aynı desteklenen girdiler CLI ve MCP aracına verilir | Ayrıştırılmış beş JSON sonuç alanı eşittir | mcp_equivalence.test.ts; gerçek stdio sunucusu |
| AC-09 | tails=3 veya alpha=1.5 | JSON hata ve sıfırdan farklı CLI çıkışı | Yerel API sözleşmesi; G*Power gözlemi diye etiketlenmez |
| AC-10 | a-priori, tails=2, dz=0.000005, alpha=0.05, power=0.95 | Etki büyüklüğü hatası; CLI çıkış kodu 1 | GUI-09; gpower_gui.test.ts |
| AC-11 | a-priori, tails=2, dz=0.00001, alpha=0.05, power=0.95 | G*Power N=129940148212 üretir; yerel motor arama sınırı hatası verir | GUI-10; bilinen uyumsuzluk, eşleşme sayılmaz |

```gherkin
Feature: Önce ve sonra tansiyon için örneklem planlama
  Scenario: Standart çift yönlü hesap
    Given dz=0.5, alpha=0.05, tails=2 ve hedef güç=0.95
    When a-priori CLI hesabı çalıştırılır
    Then toplam hasta sayısı 54 ve df 53 olmalı
    And gerçekleşen güç dört ondalıkta 0.9502 olmalı
    And 53 hastanın gücü 0.95 altında kalmalı
```

## Giriş ve arayüz sözleşmesi

CLI: `gpower-clone --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95`.
Başarı stdout üzerinde tek satır JSON ve exit=0; hata JSON ve exit=1. MCP aracı `calculate_paired_power`; hesap mantığı tek ortak motorda tutulur.

Post-hoc sözleşmesi: pozitif sonlu dz; N tamsayı ve [3, 2147483646] aralığında. Alt sınır ve üst sınır metni GUI-05'te gözlenmiştir; üst sınırdaki sayısal doğruluk bu küçük test kümesiyle kanıtlanmaz. Alpha (0,1), tails {1,2}.

A-priori etki sınırı: dz >= 0.00001; GUI-09 eşik altını reddeder, GUI-10 tam eşiği kabul eder. Yerel arama üst sınırı 1.000.000 çift ve hedef güç sözleşmesi alpha < power < 1 olarak kalır. GUI-10 orijinal programın bu arama sınırını aştığını kanıtlar; bu nedenle tüm uçlarda eşdeğerlik iddia edilmez.

## Temiz oda ve bonuslar

Temiz oda için süreç ve sınırlamalar CLEANROOM.md içindedir. Tarihsel bağımsız oturum kaydı yoktur. Mevcut Türkçe kurallı demo LLM ajanı değildir. Gerçek AI ajanı ve gerçek token maliyet ölçümü bonus hedefidir; kabul edilmiş özellik olarak sunulmaz.
