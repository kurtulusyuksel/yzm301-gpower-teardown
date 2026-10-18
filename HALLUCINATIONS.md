# Yanlış çıkarımlar ve yakalayan kanıtlar

Bu günlük yalnızca bu denetimde yeniden üretilebilen hataları kaydeder. Önceki sürümdeki ajan konuşmaları ve düzeltme geçmişi ham oturum kayıtları bulunmadığından tarihsel olay olarak sunulmaz.

| Yanlış iddia | Gerçek kanıt | Düzeltme / test |
|---|---|---|
| 106 vektör G*Power ekranından alındı | generate_oracle.py SciPy kullanıyor; 106 satıra bağlı ekran kaydı yok | SciPy kümesi ayrı; gerçek GUI kayıtları oracle/gpower-gui.json içinde |
| Bütün alanlar dört ondalıkta %100 eşit | İlk sürümde kesin eşitlik 105/106 idi; sayısal çözünürlük düzeltmesinden sonra 106/106 | İki ölçü ayrı raporlanıyor |
| Post-hoc N=2 kabul edilir | GUI-05 N=2 reddi; GUI-06 N=3 kabulü | Alt sınır 3 olarak düzeltildi; gpower_gui.test.ts |
| dz <= 0.00001 bütün modlarda reddedilir | GUI-07/08: post-hoc N=3 ile dz=0.00001 ve 0.000005 kabulü | Post-hoc küçük pozitif etki kabul edilir; a-priori yerel sınırı ayrı belgelenir |
| A-priori tam 0.00001 reddedilir | GUI-10 tam eşikte N=129940148212 üretir; GUI-09 bunun altını reddeder | Eşik kontrolü < olarak düzeltildi; büyük N yerel arama sınırı uyumsuzluğu olarak kaydedildi |
| nctcdf/nctinv/nctpdf kesin fonksiyon sembolleridir | REA bu adları dize olarak buluyor; prosedür araması matematik fonksiyonlarını bu adlarla göstermiyor | Dize kanıtı ile fonksiyon kimliği ayrıldı |
| Minimal N sonucu artan sırada aramayı kanıtlar | GUI-02/03 N=54 gücü 0.950212; GUI-04 N=53 gücü 0.9465273 | Bu örnekte eşik doğrulanır; orijinal arama algoritması iddia edilmez |
| MCP testi gerçek sunucuya bağlanır | Eski test doğrudan motoru çağırıyordu | Yeni test stdio istemcisiyle sunucuya bağlanıyor |
| Token/süre tasarrufu ölçülmüştür | GUI maliyeti sabit varsayım; demo tokenları karakter tahmini | AGENT_COST.md ve demo başlıkları düzeltildi |

Son gerçek geri bildirim: İlk bağımsız sürüm a-priori alt sınırını da 3 almıştı. GUI-12, büyük etkide N=2 gerektiğini gösterdi; yalnız SPEC ve sayısal sonuç aktarılıp bağımsız sürüm düzeltildi. Aynı vaka eski ana motorun sabit integrasyon ızgarasında .9746/.9735240 güç farkını yakaladı; sayısal çözünürlük düzeltilip tüm referanslar yeniden çalıştırıldı. GUI-11 ayrıca a-priori etki üst sınırı 20'yi ortaya çıkardı. Bunlar varsayımsal geçmiş anlatıları değil, saklanan yeni GUI kayıtları ve iki gerçek uygulayıcı turuyla izlenebilir bulgulardır.
