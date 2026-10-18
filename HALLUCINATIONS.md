# HALLUCINATIONS.md: Halüsinasyon ve Yanılgı Günlüğü

Bu belge, yapay zeka ajanının tersine mühendislik ve geliştirme sürecinde yanlış çıkardığı, varsaydığı veya halüsinasyon gördüğü noktaları, bunların nasıl fark edildiğini ve hangi testler tarafından yakalandığını belgeler.

---

### Halüsinasyon 1: İki Bağımsız Grup Yanılgısı ($n_1$ ve $n_2$ Ayrımı)
* **Ajanın İddiası:**  
  Ajan, standart t-testi mantığıyla her zaman iki grup ($n_1$ ve $n_2$) olması gerektiğini ve toplam örneklem büyüklüğünün $n_1 + n_2$ olarak raporlanması gerektiğini öne sürdü. CLI çıktısına `{"n1": 54, "n2": 54, "n_total": 108}` koymayı önerdi.
* **Nasıl Fark Edildi?**  
  Eşleştirilmiş (paired / dependent) t-testinde her denekten iki ölçüm (önce ve sonra) alınır. Dolayısıyla denek sayısı $N$'dir ve serbestlik derecesi $df = N - 1$'dir. G*Power arayüzünde de yalnızca tek bir "Total sample size" parametresi bulunmaktadır. $n_1$ ve $n_2$ ayrımı bağımsız iki grup (independent two-sample) t-testine aittir.
* **Hangi Test Yakaladı?**  
  `tests/differential.test.ts` içindeki ilk referans vektör testi. Ajanın önerdiği formülle $df = 2N - 2 = 106$ hesaplanırken, G*Power kâhininde $df = 53$ olduğu doğrulanarak model düzeltildi.

---

### Halüsinasyon 2: İki Yönlü Testte Sol Kuyruk Olasılığının İhmal Edilmesi
* **Ajanın İddiası:**  
  Ajan, pozitif merkezi olmayanlık parametresinde ($\delta > 0$) sol kuyruk olasılığının ($F(-t_{\text{crit}}; df, \delta)$) sıfıra çok yakın olduğunu ve hesaplama yükünden kaçınmak için gücün sadece $1 - F(t_{\text{crit}}; df, \delta)$ formülüyle bulunabileceğini iddia etti.
* **Nasıl Fark Edildi?**  
  Etki büyüklüğünün ve örneklemin küçük olduğu sınır değerlerinde ($d_z = 0.2, N = 10$) sol kuyruk olasılığının 0.0004 düzeyinde katkı yaptığı ve bu terim eklenmediğinde G*Power'ın ekrandaki 4 basamaklı çıktısıyla 0.0004'lük bir diferansiyel fark oluştuğu görüldü.
* **Hangi Test Yakaladı?**  
  `oracle/vectors.csv` içindeki küçük etki büyüklüğü sınır vektörü testi (`boundary_small_dz`). İki kuyruğun birden hesaplanması formüle entegre edilerek uyuşmazlık %0'a indirildi.

---

### Halüsinasyon 3: Reel Sayı Çözücü vs Ayrık Tamsayı Arama (Ceil vs Round)
* **Ajanın İddiası:**  
  Ajan, R'daki `pwr.t.test` veya SciPy fsolve gibi kök bulucuların reel sayı döndürdüğünü ($N = 53.41$) ve en yakın tamsayıya yuvarlamanın (`Math.round`) yeterli olacağını savundu.
* **Nasıl Fark Edildi?**  
  Eğer $N = 53.41$ en yakın tamsayıya yuvarlanıp $N = 53$ alınırsa, gerçekleşen güç %94.88'de kalmakta ve araştırmacının talep ettiği minimum %95 güç şartı ihlal edilmektedir. G*Power kuralı: Hedeflenen gücü kesinlikle garanti eden en küçük tamsayı seçilmelidir ($N = 54$, gerçekleşen güç = %95.02).
* **Hangi Test Yakaladı?**  
  `tests/differential.test.ts` A-priori tamsayı N eşleşme testi. Tamsayı arama algoritması `Math.ceil` / artan tamsayı döngüsü kuralına göre güncellendi.
