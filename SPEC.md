# SPEC.md: G*Power Paired t-Test (t-paired) Kabul Kriterleri ve Şartnamesi

Bu belge, YZM301 Teardown Sprint kapsamında G*Power 3.1.9.7 yazılımının **"Difference between two dependent means (matched pairs)"** test ailesinin temiz oda (clean-room) ortamında yeniden yazımı için belirlenen kabul kriterlerini ve sözleşmelerini Gherkin formatında tanımlar.

---

## Özellik (Feature): Eşleştirilmiş Ortalama t-Testi Hesaplama Motoru (t-paired)

Klinik araştırmacılar ve hekimler için tedavi öncesi-sonrası veya eşleştirilmiş çiftler üzerinde istatistiksel güç ve örneklem büyüklüğü hesabı yapılmalıdır.

---

### Senaryo 1: Standart İki Yönlü A Priori Örneklem Büyüklüğü Hesabı (Orta Etki)
```gherkin
Özellik: A Priori Örneklem Büyüklüğü (N) Hesabı
  Senaryo: İki yönlü testte orta etki büyüklüğü ile örneklem arama
    Diyelim ki test tipi "t-paired"
    Ve analiz modu "a-priori"
    Ve hipotez yönü kuyruk sayısı (tails) 2
    Ve etki büyüklüğü (dz) 0.50
    Ve tip I hata payı (alpha) 0.05
    Ve hedeflenen güç (power) 0.95
    Hesaplama motoru çalıştırıldığında
    O zaman toplam eşleşmiş çift sayısı (n_total) 54 olmalı
    Ve gerçekleşen güç (actual_power) 0.9502 olmalı
    Ve kritik t değeri (critical) 2.0057 olmalı
    Ve serbestlik derecesi (df) 53 olmalı
    Ve merkezi olmayanlık parametresi (ncp) 3.6742 olmalı
```

---

### Senaryo 2: Tek Yönlü A Priori Örneklem Büyüklüğü Hesabı
```gherkin
Özellik: Tek Yönlü Yönelimli Hipotez Testi
  Senaryo: İyileşme yönünde tek yönlü hipotezde örneklem hesabı
    Diyelim ki test tipi "t-paired"
    Ve analiz modu "a-priori"
    Ve kuyruk sayısı (tails) 1
    Ve etki büyüklüğü (dz) 0.50
    Ve tip I hata payı (alpha) 0.05
    Ve hedeflenen güç (power) 0.95
    Hesaplama motoru çalıştırıldığında
    O zaman toplam çift sayısı (n_total) 45 olmalı
    Ve gerçekleşen güç (actual_power) 0.9512 olmalı
    Ve kritik t değeri (critical) 1.6802 olmalı
    Ve serbestlik derecesi (df) 44 olmalı
    Ve merkezi olmayanlık parametresi (ncp) 3.3541 olmalı
```

---

### Senaryo 3: Post Hoc Gerçekleşen Güç Hesabı
```gherkin
Özellik: Gerçekleşen Güç (Achieved Power) Hesabı
  Senaryo: Mevcut denek sayısı ve etki büyüklüğü ile ulaşılan gücü bulma
    Diyelim ki test tipi "t-paired"
    Ve analiz modu "post-hoc"
    Ve kuyruk sayısı (tails) 2
    Ve etki büyüklüğü (dz) 0.50
    Ve tip I hata payı (alpha) 0.05
    Ve toplam çift sayısı (n) 54
    Hesaplama motoru çalıştırıldığında
    O zaman gerçekleşen güç (actual_power) 0.9502 olmalı
    Ve kritik t değeri (critical) 2.0057 olmalı
    Ve serbestlik derecesi (df) 53 olmalı
    Ve merkezi olmayanlık parametresi (ncp) 3.6742 olmalı
```

---

### Senaryo 4: Sınır Değeri - Çok Küçük Etki Büyüklüğü (Extreme Boundary)
```gherkin
Özellik: Ekstrem Sınır Değerleri
  Senaryo: dz = 0.05 gibi çok küçük etki büyüklüğünde iterasyon
    Diyelim ki test tipi "t-paired"
    Ve analiz modu "a-priori"
    Ve kuyruk sayısı 2
    Ve etki büyüklüğü (dz) 0.05
    Ve alpha 0.05
    Ve hedef güç 0.80
    Hesaplama motoru çalıştırıldığında
    O zaman arama motoru taşma yapmadan minimal N tamsayısına ulaşmalı
    Ve n_total 3142 olmalı
    Ve actual_power >= 0.80 olmalı
```

---

### Senaryo 5: [REA] Kanıtlı Sınır Değeri Kısıtı (dz <= 0.00001)
```gherkin
Özellik: G*Power Binary Kısıt Denetimi
  Senaryo: Binary'de tespit edilen 0.00001 altındaki etki büyüklüğünün reddi
    Diyelim ki etki büyüklüğü (dz) 0.00001 veya daha küçük girildi
    Hesaplama motoru çalıştırıldığında
    O zaman motor hata fırlatmalı: "Invalid effect size dz. Effect size must be greater than 0.00001."
    Ve CLI sıfırdan farklı çıkış kodu (exit code 1) döndürmeli
```

---

### Senaryo 6: Hatalı Girdi Parametreleri Denetimi
```gherkin
Özellik: Giriş Doğrulama ve Güvenlik
  Senaryo: Geçersiz kuyruk veya alpha değeri girilmesi
    Diyelim ki kuyruk sayısı (tails) 3 veya alpha 1.5 girildi
    Hesaplama motoru çalıştırıldığında
    O zaman JSON hata çıktısı üretilmeli: {"error": "<açıklama>"}
    Ve çıkış kodu 1 olmalı
```

---

### Senaryo 7: CLI ve JSON Çıktı Sözleşmesi
```gherkin
Özellik: CLI Entegrasyon Sözleşmesi
  Senaryo: Standart CLI argümanlarıyla tek satır JSON çıktısı alma
    Diyelim ki komut satırından `gpower-clone --test t-paired --mode a-priori --tails 2 --d 0.5 --alpha 0.05 --power 0.95` çalıştırıldı
    O zaman standart çıktı (stdout) üzerinde tam olarak tek satır JSON basılmalı
    Ve çıkış kodu 0 olmalı
    Ve format: {"n_total":54,"actual_power":0.9502,"critical":2.0057,"df":53,"ncp":3.6742}
```

---

### Senaryo 8: MCP ve Motor Eşdeğerliği (Thin Adapter)
```gherkin
Özellik: DRY ve İnce Adaptör Mimarisi
  Senaryo: MCP katmanının motor mantığını çoğaltmadan aynı çıktıyı üretmesi
    Diyelim ki aynı parametreler hem CLI hem MCP `calculate_paired_power` aracına verildi
    O zaman iki çıktının n_total, actual_power, critical, df ve ncp alanları byte-for-byte özdeş olmalı
```

---

### Senaryo 9: Doğal Dil Klinik AI Ajanı
```gherkin
Özellik: Hekim Diliyle Doğal Dil Arayüzü
  Senaryo: Türkçe klinik soru sorulduğunda motorun çağrılması
    Diyelim ki hekim "Tansiyon ilacı denemesinde öncesi ve sonrası fark için dz=0.5, alfa=0.05, güç=0.95 için kaç hasta gerekir?" diye sordu
    O zaman ajan test ailesini "t-paired" olarak seçmeli
    Ve parametreleri (tails=2, dz=0.5, alpha=0.05, power=0.95) doğru çıkarmalı
    Ve hesaplamayı kendisi uydurmadan (halüsinasyon yapmadan) MCP motorunu çağırarak N=54 olarak hekime sunmalı
    Ve harcanan token sayısı GUI ekran görüntüsü yöntemine göre en az %80 daha düşük olmalı
```
