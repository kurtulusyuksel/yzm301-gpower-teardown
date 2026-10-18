# Son doğrulama — 18 Ekim 2026

Ana CLI kaynağı ve JSON alanları korundu. Giriş kontrolleri gerçek GUI bulgularına göre düzeltildi. Sayısal formül değişmedi; küçük N/büyük etkide sabit integrasyon ızgarası yeterli olmadığı için çözünürlük artırıldı. Standart N=54 sonucu korunuyor.

| Kontrol | Sonuç | Ham kayıt |
|---|---|---|
| npm run build | Başarılı | evidence/build-output.txt |
| npm run cleanroom:build | Strict TypeScript derlemesi başarılı | evidence/cleanroom-build-output.txt |
| SciPy referansları | 106/106; dört ondalıkta da 106/106 | evidence/test-output.txt |
| Gerçek G*Power GUI | 11/12 (%91.67), 1 bilinen arama sınırı farkı | evidence/gui-differential-results.json |
| Gerçek MCP / CLI | 8/8 | evidence/test-output.txt |
| Bağımsız temiz oda / ana motor / veriler | 118/118 sözleşme kontrolü + 3 CLI kontrolü | evidence/cleanroom-comparison.json |
| Uygulayıcının kendi doğrulaması | 105 CSV, 8 GUI sayısal sonuç, 5 beklenen ret | evidence/cleanroom-validation-output.txt |
| Klinik demo | 10/10; LLM değildir | evidence/clinical-demo-output.txt |
| Hedefe özel REA/Ghidra sağlık | healthy=true | evidence/rea-doctor-ghidra.json |

## Gerçek LLM ajanı ek teslimi

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| Ollama qwen3.5:9b → gerçek stdio MCP | 10/10 aile, parametre ve sayısal sonuç | evidence/ai-agent/evaluation.json |
| Aynı kararlarla canlı G*Power GUI + görsel LLM | N 7/10; bütün alanlar 0/10. Orijinal GUI sonuçları doğru; model ekran okuma hataları ayrıca kayıtlı | evidence/ai-agent/live-comparison.json |
| Ölçülmüş yerel model tokenı | MCP 11767; GUI 17363. Karakter tahmini değildir | evidence/ai-agent/RESULTS.md |
| Canlı kapsam/eksik girdi kontrolleri | 2/2 açıklama istendi; hesap aracı çağrılmadı | evidence/ai-agent/live-negative-checks.json |
| Ajan protokolü | 9 senaryo; model test çifti + gerçek MCP, canlı model başarı puanı değildir | evidence/ai-agent/protocol-test-output.txt |
| Kanıt bütünlüğü | 10 gerçek GUI girdisi/sonucu, ekran SHA-256, MCP yanıtı, token ve başarı toplamları doğrulandı | tests/agent_evidence.test.ts |

Tam hesaplama regresyonu evidence/ai-agent/regression-test-output.txt içinde başarılıdır; son ek protokol kontrolleri ayrı kaydedilir. İlk model hataları ve tamamlanmayan denemeler silinmedi. Canlı GUI sürücü süresi gözetim/toparlanma gecikmelerini içerir; hız sonuçları kontrollü deney değildir. AI_AGENT.md kapsamı ve yöntemi açıklar.

## Ayrıntılı yönerge sonrası ek doğrulama

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| Genişletilmiş gerçek G*Power GUI | 31/32 eşleşme (%96.875); 31 ekran görüntülü vaka | oracle/gpower-expanded.csv; evidence/expanded-gui-comparison.json |
| statsmodels ölçek kümesi | 600 vektör; iki uygulamada dört ondalıkta tam eşleşme | evidence/statsmodels-comparison.json |
| Kılavuz §19.3 | 2 örnek; iki uygulamada başarılı | evidence/manual-comparison.json |
| Yalnız SPEC oturumu | 17 kendi kabul kontrolü; üst oturumda 632 dış sözleşme ve 3 CLI kontrolü başarılı | spec-only/SESSION.md; evidence/spec-only-comparison.json |
| CLI geçersiz girdiler | 10/10 JSON hata ve exit=1 | tests/cli_validation.test.ts |
| Video | FFprobe ile 60.000 saniye | demo/cli-demo.mp4; demo/commands.json |
| REA + Ghidra + Antigravity kaydı | Seçili kapsamda healthy=true | evidence/rea-doctor-submission.json |

Yeni testlerin komut kaydı evidence/submission-test-output.txt içindedir. Genişletilmiş GUI oranı beklenen giriş retlerini içerir; GUI-10 uyumsuzluğu başarılı sayılmaz. Hocanın gizli %90 N kapısı bu yerel oranla kanıtlanmış değildir. Açık teslim maddeleri SUBMISSION.md içindedir.

N=2 SciPy satırı iç matematik testidir; post-hoc genel API bu girdiyi reddeder. A-priori ise GUI-12 gibi büyük etkide N=2 döndürebilir.

GUI-10: orijinal N=129940148212; iki yerel uygulama 1.000.000 çift arama sınırı nedeniyle hata verir. Bu vaka başarılı eşleşme sayılmaz. `npm run test:gui:strict` tam eşdeğerliği istediği için bu bilinen farkta exit=1 verir. Normal testler beklenen çalışma sınırını da denetler; yeşil sonuç %100 G*Power eşdeğerliği anlamına gelmez.

Temiz oda: ayrı bağlamdaki uygulayıcı yalnız onaylı SPEC ve sayısal verileri okudu. Kaynak ve girdi özetleri evidence/cleanroom-handoff.json; birinci tur arşivi evidence/cleanroom-round1/; gerçek uygulayıcı kaydı cleanroom/SESSION.md içindedir. Ayrım paylaşılan dosya sisteminde okuma talimatlarıyla sağlandı; OS düzeyinde izolasyon iddia edilmez. Temiz oda süreç kanıtları cleanroom/ uygulamasını kapsar.
