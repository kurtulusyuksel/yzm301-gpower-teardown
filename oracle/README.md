# Oracle (Kâhin) Doğrulama Veri Seti

Bu dizin, G*Power 3.1.9.7 arayüzünden ve resmi istatistiksel dağılım kütüphanelerinden (SciPy `scipy.stats.nct`) toplanan referans test vektörlerini içerir.

## Dosyalar
* `vectors.csv`: 106 adet doğrulanmış kâhin vektörü.
  - Sütunlar: `category, mode, tails, dz, alpha, power, n_input, expected_n, actual_power, critical, df, ncp`
* `generate_oracle.py`: Tüm sınır ve klinik senaryoları kapsayan kâhin veri kümesini üreten Python betiği.

## Kapsanan Senaryolar
1. **Standart İki Yönlü A-Priori:** Küçük, orta ve büyük etki büyüklükleri ($d_z \in \{0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0\}$) ve farklı güç hedefleri ($0.80, 0.85, 0.90, 0.95$).
2. **Yönelimli Tek Yönlü A-Priori:** Tek kuyruklu hipotezler için $t_{\text{crit}}$ ve örneklem büyüklükleri.
3. **Post-Hoc Analizleri:** Mevcut $N$ çifti üzerinden gerçekleşen güç hesaplamaları.
4. **Ekstrem Sınır Değerleri:**
   - Çok küçük etki büyüklüğü ($d_z = 0.05 \implies N = 3142$)
   - Çok büyük etki büyüklüğü ($d_z = 2.5 \implies N = 5$)
   - Minimum örneklem ($N = 2, df = 1$)
