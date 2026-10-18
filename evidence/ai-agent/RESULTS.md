# Gerçek yerel LLM ölçümü

Model: qwen3.5:9b; 10 kurgusal Türkçe soru.

| Ölçüt | LLM + MCP | LLM + canlı G*Power ekranı |
|---|---:|---:|
| Doğru N | 10/10 | 7/10 |
| Bütün sayısal alanlar doğru | 10/10 | 0/10 |
| Ölçülmüş model tokenı | 11767 | 17363 |
| Toplam ölçülen süre (s) | 57.42 | 410.64 |
| Ortalama süre (s/soru) | 5.74 | 41.06 |

Bu deneyde MCP kolu %32.23 daha az model tokenı kullandı. Orijinal G*Power sonuçları doğruydu; GUI hataları bu modelin küçük yazılı ekranı okumasında oluştu.

İki kol, aynı gerçek LLM niyet kararını paylaşır; karar tokenları ikisine de eklenir. GUI kolu denetimli Computer Use ile orijinal uygulamaya veri girişi, hesaplama ve yeni ekran görüntüsünü okuma içerir. Ekranlara beklenen sonuç veya metin dökümü eklenmedi; görsel model yalnız soruyu ve özgün ekranı aldı.

Süreler eş koşullu veya rastgeleleştirilmiş bir hız deneyi değildir. Başlangıç kurulumu hariç; GUI sürücü gecikmeleri ve bazı geometri/odak toparlanmaları dahildir. Paylaşılan niyet seçimi zamanları önceki MCP çalışmasından alınır. Yerel Qwen kullanım sayaçları ölçülür; ev sahibi asistan altyapısı, enerji ve donanım maliyetleri ölçülmez. GUI çıktı şeması beş sayısal alanı zorunlu tutar; çekimser cevap seçeneği yoktur. Sonuçlar yalnız bu model, bu görüntü çözünürlüğü ve bu on soruyla sınırlıdır.

Ham kanıt: [live-comparison.json](live-comparison.json), [evaluation.json](evaluation.json), [canlı ekranlar ve yakalama kayıtları](live-gui/), [model/MCP çağrıları](runs/).
