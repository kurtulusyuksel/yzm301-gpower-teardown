import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculatePairedTTest } from '../src/engine/t_paired.js';
import { PairedTTestInput } from '../src/engine/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OracleRow {
  category: string;
  mode: 'a-priori' | 'post-hoc';
  tails: 1 | 2;
  dz: number;
  alpha: number;
  power?: number;
  n_input?: number;
  expected_n: number;
  actual_power: number;
  critical: number;
  df: number;
  ncp: number;
}

function parseCsv(content: string): OracleRow[] {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const rows: OracleRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 12) continue;

    rows.append ? null : rows.push({
      category: cols[0],
      mode: cols[1] as any,
      tails: parseInt(cols[2], 10) as 1 | 2,
      dz: parseFloat(cols[3]),
      alpha: parseFloat(cols[4]),
      power: cols[5] ? parseFloat(cols[5]) : undefined,
      n_input: cols[6] ? parseInt(cols[6], 10) : undefined,
      expected_n: parseInt(cols[7], 10),
      actual_power: parseFloat(cols[8]),
      critical: parseFloat(cols[9]),
      df: parseInt(cols[10], 10),
      ncp: parseFloat(cols[11])
    });
  }

  return rows;
}

async function runDifferentialTests() {
  console.log("=========================================================================");
  console.log("  YZM301 TEARDOWN SPRINT: DİFERANSİYEL TEST (ORACLE vs RE-IMPLEMENTATION) ");
  console.log("=========================================================================\n");

  const csvPath = path.join(__dirname, '..', 'oracle', 'vectors.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const vectors = parseCsv(csvContent);

  console.log(`Toplam Yüklenen Kâhin Vektör Sayısı: ${vectors.length}\n`);

  let exactNMatches = 0;
  let dfMatches = 0;
  let powerCloseMatches = 0;
  let criticalCloseMatches = 0;
  let ncpCloseMatches = 0;

  const mismatches: any[] = [];

  for (let idx = 0; idx < vectors.length; idx++) {
    const vec = vectors[idx];
    const input: PairedTTestInput = {
      test: 't-paired',
      mode: vec.mode,
      tails: vec.tails,
      dz: vec.dz,
      alpha: vec.alpha,
      power: vec.power,
      n: vec.n_input
    };

    const result = calculatePairedTTest(input);

    const nMatch = result.n_total === vec.expected_n;
    const dfMatch = result.df === vec.df;
    const powerDiff = Math.abs(result.actual_power - vec.actual_power);
    const critDiff = Math.abs(result.critical - vec.critical);
    const ncpDiff = Math.abs(result.ncp - vec.ncp);

    if (nMatch) exactNMatches++;
    if (dfMatch) dfMatches++;
    if (powerDiff <= 0.001) powerCloseMatches++;
    if (critDiff <= 0.001) criticalCloseMatches++;
    if (ncpDiff <= 0.001) ncpCloseMatches++;

    if (!nMatch || powerDiff > 0.001) {
      mismatches.push({
        index: idx + 1,
        mode: vec.mode,
        tails: vec.tails,
        dz: vec.dz,
        expectedN: vec.expected_n,
        actualN: result.n_total,
        expectedPower: vec.actual_power,
        actualPower: result.actual_power,
        expectedCrit: vec.critical,
        actualCrit: result.critical
      });
    }
  }

  const matchRate = (exactNMatches / vectors.length) * 100;

  console.log("-------------------------------------------------------------------------");
  console.log(`Sonuç İstatistiği:`);
  console.log(`• N Değeri Tam Eşleşme Oranı : ${exactNMatches}/${vectors.length} (%${matchRate.toFixed(2)})`);
  console.log(`• Serbestlik Derecesi (df)    : ${dfMatches}/${vectors.length} (%${((dfMatches / vectors.length) * 100).toFixed(2)})`);
  console.log(`• Güç (Power <= 0.001 fark)  : ${powerCloseMatches}/${vectors.length} (%${((powerCloseMatches / vectors.length) * 100).toFixed(2)})`);
  console.log(`• Kritik t (<= 0.001 fark)    : ${criticalCloseMatches}/${vectors.length} (%${((criticalCloseMatches / vectors.length) * 100).toFixed(2)})`);
  console.log(`• NCP (<= 0.001 fark)         : ${ncpCloseMatches}/${vectors.length} (%${((ncpCloseMatches / vectors.length) * 100).toFixed(2)})`);
  console.log("-------------------------------------------------------------------------");

  if (mismatches.length > 0) {
    console.warn(`⚠️ ${mismatches.length} vektörde uyuşmazlık tespit edildi:`);
    console.table(mismatches);
  } else {
    console.log("🎉 BÜTÜN VEKTÖRLER (%100) G*POWER KÂHİNİ İLE TAM EŞLEŞTİ!");
  }

  console.log("=========================================================================\n");

  if (matchRate < 90.0) {
    console.error(`❌ KAPI ŞARTI SAĞLANAMADI: Uyum oranı %90'ın altında (%${matchRate.toFixed(2)})!`);
    process.exit(1);
  } else {
    console.log(`✅ KAPI ŞARTI BAŞARIYLA GEÇİLDİ (%${matchRate.toFixed(2)} >= %90.0)!\n`);
  }
}

runDifferentialTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
