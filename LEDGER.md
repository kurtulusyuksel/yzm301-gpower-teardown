# LEDGER.md: Kanıt Defteri (Traceability Ledger)

Bu defter, G*Power 3.1.9.7 yazılımının tersine mühendislikle incelenmesi sırasında elde edilen kanıtları listeler.

### Etiket Tanımları:
* **[DOK]**: Resmi G*Power kullanım kılavuzunda veya yayımlanmış makalede (Faul et al., 2007) yer alan bilgi.
* **[REA]**: G*Power binary dosyasından (`GPowerNT.exe`) REA / ikili dize ve sembol analiziyle kesin olarak kanıtlanmış bulgu.
* **[AJAN]**: Ajanın ilk varsayımı / çıkarımı (orijinal binary veya diferansiyel test ile sınanmıştır).

---

## 1. Hedef Binary Kimliği ve Doğrulama
* **[REA]** Dosya Adı: `GPowerNT.exe`
* **[REA]** Dosya Boyutu: 2,287,616 bayt
* **[REA]** SHA-256 Hash: `C63E6A133EB6372932F810C08CC33DC35A06D1DDB658F897BD6C34A754EFC812`
* **[REA]** PE Tipi: Windows 32-bit GUI Executable (PE32)

---

## 2. Test Ailesi ve Dize Kanıtları
* **[REA]** Binary içinde `Difference between two dependent means (matched pairs)` dizesi yer almaktadır.
* **[REA]** İlgili test ailesi için kullanılan etki büyüklüğü dizesi: `dz` (Cohen's dz).
* **[DOK]** Cohen's $d_z = \frac{|\mu_D|}{\sigma_D} = \frac{|\mu_1 - \mu_2|}{\sqrt{\sigma_1^2 + \sigma_2^2 - 2 r \sigma_1 \sigma_2}}$ formülü ile tanımlanır.
* **[REA]** Etki büyüklüğü sözleşmesi etiketleri: `d = .20 - small`, `d = .50 - medium`, `d = .80 - large`.

---

## 3. Kılavuzda Olmayan Davranışlar ve Sınır Kısıtları ([REA] Özgün Bulguları)
* **[REA]** **Etki Büyüklüğü Alt Sınırı:** Binary metin segmentinde açıkça bulunan hata katarı:  
  `effect size be greater than 0.00001.`  
  *Kılavuzda bu sayısal alt sınır açıkça yazmaz; G*Power arayüzü $d_z \le 0.00001$ değerlerinde hesaplamayı reddeder.*
* **[REA]** **Dağılım Çekirdeği İsimlendirmesi:**  
  Binary içinde merkezi olmayan Student t dağılımı yordamları şu adlarla mevcuttur:
  - `nctcdf` (Noncentral Student t Cumulative Distribution Function)
  - `nctinv` (Noncentral Student t Inverse Quantile Function)
  - `nctpdf` (Noncentral Student t Probability Density Function)
  - `TDist-Quantile`, `TDist-Cdf`, `TDist-Pdf`
* **[REA]** **Hata Yönetimi ve Durma Koşulları:**  
  Binary içinde çözücü hataları için şu hata dizeleri mevcuttur:
  - `TDist-Cdf: input parameter out of range`
  - `TDist-Cdf: answer below lower search bound`
  - `TDist-Cdf: answer above upper search bound`
  - `TDist-Pdf: failed to converge`
* **[REA]** **Serbestlik Derecesi ve Örneklem Tanımı:**  
  İki bağımsız grupta $df = N_1 + N_2 - 2$ iken, `matched pairs` durumunda $N$ değeri çift sayısıdır ve $df = N - 1$'dir. Minimum serbestlik derecesi $df \ge 1 \implies N \ge 2$'dir.
* **[REA]** **A Priori İterasyonunun Durma Koşulu:**  
  R (`pwr.t.test`) veya Python (`statsmodels`) $N$'yi kesirli (reel sayı) çözerken, G*Power $N \ge 2$ tamsayıları üzerinde artan sırada arama yapar ve $\text{Power}(N) \ge \text{TargetPower}$ eşitsizliğinin sağlandığı **ilk tamsayıda** durur. Bu nedenle `actual_power` neredeyse her zaman `target_power`'dan biraz yüksektir (örn. hedef %95 iken ulaşılan güç %95.02'dir).

---

## 4. İstatistiksel Hesaplama Mantığı
* **[DOK]** $H_0: \mu_D = 0$ hipotezi altında merkezi olmayanlık parametresi (Noncentrality Parameter):  
  $$\delta = \text{ncp} = d_z \times \sqrt{N}$$
* **[DOK]** Kritik t değeri ($t_{\text{crit}}$):
  - Tek yönlü (tails = 1): $t_{\text{crit}} = t_{1 - \alpha, df}$
  - Çift yönlü (tails = 2): $t_{\text{crit}} = t_{1 - \alpha/2, df}$
* **[DOK]** Güç hesabı:
  - Tek yönlü: $\text{Power} = 1 - F_{t}(t_{\text{crit}}; df, \delta)$
  - Çift yönlü: $\text{Power} = 1 - F_{t}(t_{\text{crit}}; df, \delta) + F_{t}(-t_{\text{crit}}; df, \delta)$

---

## 5. [AJAN] Çıkarımları ve Diferansiyel Doğrulama
* **[AJAN]** *Çıkarım 1:* "İki yönlü testte sol kuyruk olasılığı $F_{t}(-t_{\text{crit}}; df, \delta)$ ihmal edilebilir derecede küçüktür (örn. $10^{-12}$), bu yüzden yalnızca $1 - F(t_{\text{crit}})$ hesaplanması yeterlidir."  
  *Doğrulama Sonucu:* $\delta > 2$ için bu fark ihmal edilebilir olsa da, $d_z$ ve $N$ çok küçükken sol kuyruk olasılığı $10^{-4}$ mertebesinde katkı yapabilir. G*Power ile 4 basamakta tam eşleşmek için her iki kuyruk da toplanmalıdır.
* **[AJAN]** *Çıkarım 2:* "Eşleştirilmiş t-testinde kullanıcıya $n_1$ ve $n_2$ dönülmelidir."  
  *Doğrulama Sonucu:* Yanlış; eşleştirilmiş t-testinde tek bir örneklem büyüklüğü vardır (toplam çift sayısı $N$ veya $n_{\text{total}}$). Bu sebeple CLI sözleşmesinde tek $n_{\text{total}}$ döndürülür.
