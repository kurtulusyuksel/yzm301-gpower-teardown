# Referans veri kaynakları

## Gerçek G*Power GUI verisi

`gpower-gui.json`: G*Power 3.1.9.7 üzerinde gerçekten çalıştırılmış 12 vaka. Arayüz JSON kayıtları ve ekran görüntüleri evidence/ altında; GUI-01 yalnız arayüz metnidir. Her vektör kaynak JSON SHA-256 özetini taşır.

Üretim: `node scripts/build-gui-vectors.mjs`. Mevcut ham kayıtları dönüştürür, yeni GUI oturumu yürütmez. Test: `npm run test:gui`. 11/12 eşleşme; GUI-10 yerel büyük-N arama sınırı farkıdır ve başarılı sayılmaz. Ham farklar evidence/gui-differential-results.json içindedir.

## SciPy ek referansı

`vectors.csv`: 106 satır. `generate_oracle.py`, SciPy t.ppf ve nct.cdf kullanır. Küme G*Power ekranından alınmış diye sunulmaz. Üretim: `python oracle/generate_oracle.py`; CSV üzerine yazılır.

N ve df kesin eşit; diğer alanlarda 0.001 tolerans ve ayrıca dört ondalıkta kesin eşitlik raporlanır. Son ana motor denetimi her ikisinde 106/106'dır. N=2 satırı iç matematik testidir; post-hoc genel API bu girdiyi reddeder. Diğer 105 satır genel API ile sınanır.

## Bağımsız yeniden yazım

Temiz oda uygulayıcısı yalnız SPEC ve sayısal veri dosyalarını aldı. Ana motorla 118 sözleşme kontrolü tests/cleanroom_equivalence.test.ts içindedir; sonuç evidence/cleanroom-comparison.json. İlk on GUI vakasının onaylı eski sürümü evidence/cleanroom-round1/ içinde arşivlidir. Güncel onaylı giriş özetleri evidence/cleanroom-handoff.json içindedir.
# Genişletilmiş ders teslimi

- `gpower-expanded.csv` ve `.json`: 32 gerçek G*Power GUI vakası; 31'i `screenshots/` altında ekran görüntülü. GUI-01 önceki yalnız metin kaydıdır. 31/32 eşleşme; GUI-10 bilinen büyük-N farkıdır. Hata/ret vakaları ayrıca belirtilir.
- `statsmodels-vectors.csv`: 600 ek kütüphane referansı; G*Power ekranından üretilmiş gibi sunulmaz. Üretici `scripts/generate-statsmodels.py`; statsmodels 0.14.2, SciPy 1.18.1, Python 3.12.12 ile kaydedildi. Ortamın NumPy uyumluluk uyarıları `evidence/statsmodels-environment.txt` içinde korunur; üretim ve sayısal doğrulama tamamlandı.
- Kılavuz örneklerinin kaynak ve sonuçları `tests/manual.test.ts` ve `evidence/manual-comparison.json` içindedir.
- Önceki `gpower-gui.json` ve `vectors.csv` bağımsız uygulayıcının sabitlenmiş girdileridir; genişletilmiş küme için değiştirilmezler.
