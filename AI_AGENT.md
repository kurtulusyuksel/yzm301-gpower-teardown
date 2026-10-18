# Türkçe araştırma ajanı — yerel LLM ve gerçek MCP

`npm run agent -- "Aynı hastalarda önce ve sonra tansiyon karşılaştırması: dz=0.5, çift yönlü, alfa=0.05, hedef güç=0.95. Kaç hasta gerekir?"`

Bu komut, kural tabanlı demodan farklı olarak **gerçek bir yerel dil modeli** çalıştırır. Ollama `qwen3.5:9b`, Türkçe soruyu yorumlar ve MCP sunucusunun ilan ettiği `calculate_paired_power` aracını seçer. Uygulama gerçek stdio bağlantısından çağrıyı yapar. Hesap kodu ajan katmanında bulunmaz. Araç sonucu doğrudan döndürülür: Türkçe yanıt ve kesin sayısal rapor MCP cevabından oluşturulur. Sonucu yeniden yazan ikinci model çağrısı yoktur.

## Kurulum

1. `npm ci` ve `npm run build`.
2. Ollama kurulu olmalı; bir terminalde `ollama serve` çalıştırın. Sunucu varsayılan olarak `http://127.0.0.1:11434` adresinde olmalıdır.
3. `ollama list` ile modeli kontrol edin. Bu projede ölçülen model `qwen3.5:9b`; makinede zaten kurulu model kullanıldı, ağırlıklar repoda paylaşılmaz. Model yoksa ayrıca `ollama pull qwen3.5:9b` gerekir.
4. `npm run agent -- "..."` veya `npm run eval`.

Model seçimi `OLLAMA_MODEL`, sunucu `OLLAMA_HOST` ortam değişkeniyle değiştirilebilir. Model değiştirilirse sonuçlar yeniden ölçülmelidir. API anahtarı gerekmez. Deneyde yalnız kurgusal araştırma soruları kullanılır.

`npm run agent:demo` ve `npm run eval:demo`, önceki kural tabanlı örneği korur. Bunların tahmini tokenları gerçek LLM ölçümüne karıştırılmaz. `npm test` canlı Ollama gerektirmez; ajan protokolünü test çiftleri ve gerçek MCP bağlantısıyla doğrular. Canlı model değerlendirmesi `npm run eval` ile ayrıca yapılır.

Canlı GUI deneyini tekrarlamak için `npm run eval:gui`, `evidence/ai-agent/live-gui/request.json` dosyasına sıradaki soruyu ve LLM'nin seçtiği parametreleri yazar. Denetimli Computer Use sürücüsü G*Power'da bu değerleri uygular, hesaplar ve `<AI-id>-capture.json` ile özgün ekran görüntüsünü kaydeder. Sürücü kaydı; aynı id/parametreler, süre, arayüz metni, ekran yolu ve SHA-256 içermelidir. Deney, bu kayıt gelmeden sonraki soruya geçmez. Kayıtlar varsa yeniden sürme yerine mevcut kayıtları okur; tamamen yeni deney için ayrı bir kayıt dizini/checkout kullanın. Bu komut, kendi başına gizli bir Windows otomasyonu başlatmaz.

## Parametre ve yanıt denetimi

- Yalnız eşleştirilmiş t-testi desteklenir. Eksik parametre, belirsiz tasarım veya desteklenmeyen aile için model `ask_researcher` ile açıklama ister.
- Parametreler LLM tarafından seçilir; uygulama sayısal değerlerin soruda bulunduğunu doğrular. Yalnız yüzde verilen alpha/güç olasılıklarına ölçek dönüşümü uygulanabilir. Bu kontrol klinik niyet çözümlemesinin veya tüm parametre doğruluğunun garantisi değildir.
- Ajanın motoru atlayarak sayı üretmesi, bilinmeyen araç çağırması ve araç hatasını başarı diye sunması kabul edilmez.
- Modelin serbest metni hesap cevabı olarak kullanılmaz. Uygulamanın raporladığı N, güç, df, kritik t ve ncp daima MCP cevabıdır. Türkçe açıklama bu sonuca bağlı bir rapor şablonuyla oluşturulur; doğal dil niyet/parametre seçimi LLM'ye aittir.
- Bütün denemeler, biçim hataları ve reddedilen parametreler de dahil olmak üzere kaydedilir. İstek sayısı sınırlıdır; sonsuz düzeltme döngüsü yoktur.

## Değerlendirme ve ölçüm kanıtları

Son ölçüm: LLM + MCP **10/10** doğru N ve tüm sayısal alanlar; canlı GUI ekranını okuyan aynı model **7/10** doğru N, **0/10** tüm sayısal alanlar. Ölçülen Qwen tokenları MCP **11.767**, GUI **17.363** (%32,23 daha az). Süre toplamları 57,42 s ve 410,64 s; GUI denetim/geometri toparlanması içerdiği için bu değerler kontrollü bir hız kıyaslaması değildir. [Ayrıntılı sonuç tablosu](evidence/ai-agent/RESULTS.md).

Desteklenmeyen bağımsız grup tasarımı ve eksik parametreler için iki ek gerçek model kontrolünde ajan araştırmacıya açıklama sordu; hesap aracı çağrılmadı. [Kayıt](evidence/ai-agent/live-negative-checks.json). Bu iki soru ana 10 soruluk başarı oranına eklenmez.

- [10 soruluk küme](oracle/agent-evaluation.json): beklenen aile, mod, yön, etki, alpha, güç/N ve G*Power referansı. Sorular sentetiktir; model yalnız soruyu görür, beklenen sonuçları görmez.
- [LLM/MCP ölçümü ve ekran tekrarı](evidence/ai-agent/evaluation.json).
- [Canlı GUI karşılaştırması](evidence/ai-agent/live-comparison.json): aynı LLM niyet kararı iki kola uygulanır; GUI kolunda değerler gerçek G*Power'a girilir ve yeni ekran görüntüsü okunur. Denetimli giriş/kayıt sürücüsü `computer-use` kullanır; hazır sayısal sonuç döndürmez.
- [Ham model ve MCP çağrıları](evidence/ai-agent/runs/); [model/donanım kaydı](evidence/ai-agent/environment.json).
- İlk iki ölçüm, düzeltmelerin etkisini gizlememek için `evidence/ai-agent/round1/` ve `round2/` içinde korunur.

Tokenlar Ollama'nın gerçek `prompt_eval_count` ve `eval_count` alanlarından toplanır. Karakterden token tahmini yapılmaz. Paylaşılan niyet çözümlemesi canlı karşılaştırmanın iki koluna da eklenir. GUI giriş/yakalama ve görsel okuma süreleri ayrı tutulur. G*Power başlangıç kurulumu hariçtir; denetimli sürücünün orkestrasyon gecikmesi GUI süresine dahildir. Ev sahibi asistan/araç altyapısının tokenları iki kolda da ölçülmez. Yerel çalışmada sağlayıcı faturası yoktur; donanım ve enerji maliyeti ölçülmemiştir.

Bu, on desteklenen sorudaki bir ölçümdür; genel Türkçe klinik sınıflandırma başarısı veya puan garantisi değildir. Bonusun kabulünü öğretim elemanı değerlendirir.

## Kaynaklar

[Ollama araç çağırma](https://docs.ollama.com/capabilities/tool-calling), [Chat API ve kullanım alanları](https://docs.ollama.com/api/chat), [görüntü girdileri](https://docs.ollama.com/capabilities/vision).
