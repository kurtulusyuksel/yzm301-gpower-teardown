> Bu dosya oturum talimatı taslağıdır; oturumun gerçekleştiğine ilişkin günlük değildir.

# Oturum 2: Temiz Oda Yeniden Yazım İlk Prompt'u

```markdown
Temiz oda (clean-room) mühendisliği kurallarına uygun olarak, elinizde YALNIZCA SPEC.md ve LEDGER.md belgeleri bulunmaktadır. Orijinal GPower.exe kaynak kodunu veya decompile çıktılarını görmeden sıfırdan bir hesaplama motoru inşa edeceksiniz.

Geliştirme Kriterleri:
1. Dil: TypeScript / Node.js
2. Test Ailesi: t-paired (Means: Difference between two dependent means / matched pairs)
3. Modlar: a-priori (minimal N çifti bulma) ve post-hoc (gerçekleşen güç hesabı)
4. Matematiksel Doğruluk: Noncentral Student's t dağılımını (nctcdf) yüksek hassasiyetli sayısal integrasyonla gerçekleyin.
5. CLI Sözleşmesi: Tek satır JSON çıktısı (`{"n_total":..., "actual_power":..., "critical":..., "df":..., "ncp":...}`) veya hata durumunda `{"error":"..."}` ve exit code 1.
6. Katmanlar:
   - Temel CLI (85 puan)
   - İnce adaptör MCP Sunucusu (+15 puan)
   - Türkçe klinik soruları yanıtlayan AI Ajanı (+10 puan)
7. Diferansiyel Test: Kâhin (Oracle) verileri üzerinde %100 tam eşleşme sağlayın.
```
