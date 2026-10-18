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

N=2 SciPy satırı iç matematik testidir; post-hoc genel API bu girdiyi reddeder. A-priori ise GUI-12 gibi büyük etkide N=2 döndürebilir.

GUI-10: orijinal N=129940148212; iki yerel uygulama 1.000.000 çift arama sınırı nedeniyle hata verir. Bu vaka başarılı eşleşme sayılmaz. `npm run test:gui:strict` tam eşdeğerliği istediği için bu bilinen farkta exit=1 verir. Normal testler beklenen çalışma sınırını da denetler; yeşil sonuç %100 G*Power eşdeğerliği anlamına gelmez.

Temiz oda: ayrı bağlamdaki uygulayıcı yalnız onaylı SPEC ve sayısal verileri okudu. Kaynak ve girdi özetleri evidence/cleanroom-handoff.json; birinci tur arşivi evidence/cleanroom-round1/; gerçek uygulayıcı kaydı cleanroom/SESSION.md içindedir. Ayrım paylaşılan dosya sisteminde okuma talimatlarıyla sağlandı; OS düzeyinde izolasyon iddia edilmez. Temiz oda süreç kanıtları cleanroom/ uygulamasını kapsar.
