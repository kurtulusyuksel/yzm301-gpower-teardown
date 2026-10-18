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
- A-priori hedef: N >= 2 üzerinde hedef gücü sağlayan en küçük tamsayı. Bu alt sınır post-hoc giriş sınırından ayrıdır: GUI-12 a-priori N=2 üretir. GUI-02/03/04 standart örnekte eşiği doğrular; orijinal programın arama sırası bu sonuçtan çıkarılamaz.

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
| AC-12 | a-priori, tails=2, dz=100, alpha=0.05, power=0.95 | Etki büyüklüğü aralık hatası; CLI exit=1 | GUI-11 |
| AC-13 | a-priori, tails=2, dz=20, alpha=0.05, power=0.95 | N=2, df=1, power=0.9735, critical=12.7062, ncp=28.2843 | GUI-12; post-hoc alt sınırı a-priori aramaya uygulanmaz |

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

A-priori etki aralığı: 0.00001 <= dz <= 20; GUI-09 eşik altını reddeder, GUI-10 alt eşiği, GUI-12 üst eşiği kabul eder. GUI-11 dz=100 için aralık hatası verir. A-priori N araması 2'den başlar; post-hoc N>=3 kontrolü bu aramaya taşınmaz. Yerel arama üst sınırı 1.000.000 çift ve hedef güç sözleşmesi alpha < power < 1 olarak kalır. GUI-10 orijinal programın bu arama sınırını aştığını kanıtlar; bu nedenle tüm uçlarda eşdeğerlik iddia edilmez.

## Temiz oda ve bonuslar

Temiz oda için süreç ve sınırlamalar CLEANROOM.md içindedir. Süreç kanıtı cleanroom/ uygulamasını kapsar. Türkçe kurallı demo LLM ajanı değildir. Gerçek AI ajanı ve gerçek token maliyet ölçümü bonus hedefidir; kabul edilmiş özellik olarak sunulmaz.

## Gherkin kabul kriterleri — genişletilmiş teslim

Bu bölüm uygulama tamamlandıktan sonra teslim biçimini genişletir. Uygulayıcıya verilen SPEC'in değişmemiş baytları `evidence/cleanroom-round2/approved-spec.md` içinde korunur; devir kaydındaki özgün SHA-256 bu arşive uygulanır.

```gherkin
Feature: Eşleştirilmiş ortalama t-testi sözleşmesi
  Scenario Outline: AC-01, AC-02 ve AC-13 için en küçük örneklem
    Given tails <tails>, dz <dz>, alpha 0.05 ve hedef güç 0.95
    When a-priori hesabı çalıştırılır
    Then n_total <n> ve df <df> olmalı
    And actual_power dört ondalıkta <actual> olmalı
    And critical <critical> ve ncp <ncp> olmalı
    Examples:
      | tails | dz  | n  | df | actual | critical | ncp     |
      | 2     | 0.5 | 54 | 53 | 0.9502 | 2.0057   | 3.6742  |
      | 1     | 0.5 | 45 | 44 | 0.9512 | 1.6802   | 3.3541  |
      | 2     | 20  | 2  | 1  | 0.9735 | 12.7062  | 28.2843 |

  Scenario Outline: AC-03, AC-04 ve AC-06 post-hoc sonuçları
    Given tails 2, dz 0.5 ve alpha 0.05
    When <n> çift için post-hoc hesabı çalıştırılır
    Then actual_power <actual>, df <df>, critical <critical> ve ncp <ncp> olmalı
    Examples:
      | n  | actual | df | critical | ncp    |
      | 54 | 0.9502 | 53 | 2.0057   | 3.6742 |
      | 53 | 0.9465 | 52 | 2.0066   | 3.6401 |
      | 3  | 0.0841 | 2  | 4.3027   | 0.8660 |

  Scenario Outline: AC-07 küçük pozitif etki post-hoc için kabul edilir
    Given tails 2, alpha 0.05 ve dz <dz>
    When 3 çift için post-hoc hesabı çalıştırılır
    Then actual_power 0.0500 ve df 2 olmalı
    Examples:
      | dz       |
      | 0.00001  |
      | 0.000005 |

  Scenario Outline: AC-05, AC-09, AC-10 ve AC-12 geçersiz girdiler
    Given geçerli standart girdide <alan> değeri <deger> yapılır
    When <mod> CLI hesabı çalıştırılır
    Then tek JSON hata nesnesi ve sıfırdan farklı çıkış kodu alınmalı
    Examples:
      | mod      | alan  | deger    |
      | post-hoc | n     | 2        |
      | post-hoc | n     | 3.5      |
      | a-priori | tails | 3        |
      | a-priori | alpha | 1.5      |
      | a-priori | dz    | 0.000005 |
      | a-priori | dz    | 100      |
      | a-priori | power | 0.05     |
      | a-priori | power | 0.04     |

  Scenario: AC-08 CLI ve MCP aynı hesaplama katmanını kullanır
    Given desteklenen aynı giriş CLI ve calculate_paired_power aracına verilir
    When gerçek stdio MCP bağlantısı üzerinden hesap yapılır
    Then n_total, actual_power, critical, df ve ncp alanları eşit olmalı

  Scenario: AC-11 bilinen büyük-N uyumsuzluğu başarı sayılmaz
    Given tails 2, dz 0.00001, alpha 0.05 ve hedef güç 0.95
    When G*Power N 129940148212 üretir
    Then yerel uygulamaların 1000000 çift sınırı hatası uyumsuzluk olarak raporlanmalı
    And bu vaka eşleşme sayısına eklenmemeli
```

Eşit olmayan grup oranı bu aileye uygulanmaz: N eşleşmiş çift sayısıdır; iki bağımsız grup tahsisi yapılmaz. Resmi CONTRACT.md bağlantısının içeriği sağlanmadığından bu dosya, hocanın harici sözleşmesiyle birebir uyum kanıtı değildir.
