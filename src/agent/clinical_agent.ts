import { calculatePairedTTest } from '../engine/t_paired.js';
import { PairedTTestInput, PairedTTestOutput } from '../engine/types.js';

export interface ClinicalAgentResponse {
  query: string;
  extractedParameters: {
    test: string;
    mode: 'a-priori' | 'post-hoc';
    tails: 1 | 2;
    dz: number;
    alpha: number;
    power?: number;
    n?: number;
  };
  toolCallLog: {
    tool: string;
    arguments: Record<string, any>;
    rawResult: PairedTTestOutput;
    durationMs: number;
  };
  physicianExplanation: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    toolTokens: number;
    totalTokens: number;
  };
}

/**
 * Natural language intent parser for clinical questions in Turkish.
 * Translates clinical questions into precise statistical tool parameters.
 */
export function parseClinicalQuery(query: string): PairedTTestInput {
  const normalized = query
    .toLocaleLowerCase('tr-TR')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip accents for safe regex matching
  const lower = query.toLocaleLowerCase('tr-TR') + ' ' + normalized;

  // Test family detection
  const isPaired =
    lower.includes('once') ||
    lower.includes('sonra') ||
    lower.includes('eslestirilmis') ||
    lower.includes('bagimli') ||
    lower.includes('paired') ||
    lower.includes('ayni hasta') ||
    lower.includes('takip') ||
    lower.includes('tedavi') ||
    lower.includes('fark') ||
    lower.includes('degisim') ||
    lower.includes('cift') ||
    lower.includes('dz');

  if (!isPaired) {
    throw new Error("Soru eşleştirilmiş (paired) t-testi kapsamına girmiyor veya belirsiz.");
  }


  // Mode detection
  const isPostHoc =
    lower.includes('guc nedir') ||
    lower.includes('gucu hesapla') ||
    lower.includes('achieved power') ||
    lower.includes('post hoc') ||
    lower.includes('post-hoc') ||
    lower.includes('gucumuz kac') ||
    lower.includes('elde edilen guc');
  const mode = isPostHoc ? 'post-hoc' : 'a-priori';


  // Tails detection (default 2-tailed unless strictly directional)
  let tails: 1 | 2 = 2;
  if (
    lower.includes('tek yönlü') ||
    lower.includes('tek kuyruklu') ||
    lower.includes('yalnızca düşüş') ||
    lower.includes('yalnızca artış') ||
    lower.includes('one-tailed')
  ) {
    tails = 1;
  }

  // Alpha extraction (default 0.05)
  let alpha = 0.05;
  const alphaMatch = lower.match(/(?:alfa|alpha|anlamlilik|yanilma duzeyi)[\s:=]+([0-9\.,]+)/i);
  if (alphaMatch) {
    alpha = parseFloat(alphaMatch[1].replace(',', '.'));
  }

  // Power extraction for a-priori (default 0.80)
  let power: number | undefined;
  if (mode === 'a-priori') {
    power = 0.80; // default clinical baseline
    const pctBefore = lower.match(/%([0-9\.,]+)\s*(?:guc|power|istatistiksel)/i);
    const kwMatch = lower.match(/(?:guc|power|istatistiksel guc)[\s:=%]+([0-9\.,]+)/i);
    if (pctBefore) {
      power = parseFloat(pctBefore[1].replace(',', '.')) / 100.0;
    } else if (kwMatch) {
      let val = parseFloat(kwMatch[1].replace(',', '.'));
      if (val > 1.0) val = val / 100.0;
      power = val;
    }
  }

  // N extraction for post-hoc
  let n: number | undefined;
  if (mode === 'post-hoc') {
    const numBefore = lower.match(/([0-9]+)\s*(?:hasta|denek|cift|birey)/i);
    const kwMatch = lower.match(/(?:denek|hasta|cift|n|orneklem)[\s:=]+([0-9]+)/i);
    if (numBefore) {
      n = parseInt(numBefore[1], 10);
    } else if (kwMatch) {
      n = parseInt(kwMatch[1], 10);
    } else {
      n = 30;
    }
  }

  // Effect size extraction (dz)
  let dz = 0.50; // medium effect size default
  const dzMatch = lower.match(/(?:etki buyuklugu|cohen|dz|d)[\s:=]+([0-9\.,]+)/i);
  if (dzMatch) {
    dz = parseFloat(dzMatch[1].replace(',', '.'));
  } else if (lower.includes('kucuk etki')) {
    dz = 0.20;
  } else if (lower.includes('orta etki')) {
    dz = 0.50;
  } else if (lower.includes('buyuk etki')) {
    dz = 0.80;
  }


  return {
    test: 't-paired',
    mode,
    tails,
    dz,
    alpha,
    power,
    n
  };
}

/**
 * Clinical AI Agent answering physician inquiries using MCP tool backend.
 */
export async function runClinicalAgent(query: string): Promise<ClinicalAgentResponse> {
  const startTime = Date.now();
  const input = parseClinicalQuery(query);

  // Invoke tool via engine (identical to MCP calculate_paired_power call)
  const calcResult = calculatePairedTTest(input);
  const durationMs = Date.now() - startTime;

  // Generate natural physician explanation in Turkish
  let explanation = '';
  if (input.mode === 'a-priori') {
    explanation =
      `Sayın Araştırmacı,\n` +
      `Klinik çalışmanız için (Öncesi-Sonrası Eşleştirilmiş t-testi, ${input.tails === 2 ? 'Çift Yönlü' : 'Tek Yönlü'}, ` +
      `Etki Büyüklüğü dz = ${input.dz}, Hedef Güç = %${((input.power || 0.8) * 100).toFixed(0)}, ` +
      `Alfa = ${input.alpha}):\n` +
      `• Gerekli Toplam Eşleşmiş Hasta/Çift Sayısı: N = ${calcResult.n_total}\n` +
      `• Gerçekleşen İstatistiksel Güç: %${(calcResult.actual_power * 100).toFixed(2)}\n` +
      `• Serbestlik Derecesi (df): ${calcResult.df}\n` +
      `• Kritik t Değeri: ${calcResult.critical}\n` +
      `• Merkezi Olmayanlık Parametresi (ncp): ${calcResult.ncp}\n` +
      `Hesaplama yerel motorla yapılmıştır. G*Power GUI karşılaştırmaları sınırlı bir test kümesinde belgelenmiştir; tüm girdiler için eşdeğerlik garantisi değildir.`;
  } else {
    explanation =
      `Sayın Araştırmacı,\n` +
      `Mevcut ${input.n} eşleşmiş çift ile yapılan post-hoc analiz sonuçları:\n` +
      `• Elde Edilen İstatistiksel Güç: %${(calcResult.actual_power * 100).toFixed(2)}\n` +
      `• Kritik t: ${calcResult.critical}, df: ${calcResult.df}, ncp: ${calcResult.ncp}\n` +
      `Eğer hedeflenen güç en az %80 ise bu örneklem ${calcResult.actual_power >= 0.80 ? 'yeterlidir' : 'yetersizdir, ek denek gereklidir'}.`;
  }

  // Token usage estimation:
  // Query (~25 tokens), System/Schema (~45 tokens), Tool Args (~25 tokens), Output (~35 tokens)
  const promptTokens = Math.ceil(query.length / 3.5) + 40;
  const toolTokens = 35;
  const completionTokens = Math.ceil(explanation.length / 3.5);

  return {
    query,
    extractedParameters: input,
    toolCallLog: {
      tool: 'calculate_paired_power',
      arguments: input,
      rawResult: calcResult,
      durationMs
    },
    physicianExplanation: explanation,
    tokenUsage: {
      promptTokens,
      completionTokens,
      toolTokens,
      totalTokens: promptTokens + completionTokens + toolTokens
    }
  };
}

import { pathToFileURL } from 'url';

const isDirectRun = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun || process.argv.length > 2) {
  const sampleQuery =
    process.argv[2] ||
    "Hipertansiyon hastalarında yeni bir ilacın sistolik kan basıncına etkisini ölçmek için tedavi öncesi ve sonrası ölçüm yapacağız. " +
    "Orta büyüklükte bir etki (dz=0.5) bekliyoruz. Çift yönlü analizde %95 güç ve 0.05 alfa için kaç hasta almalıyız?";

  runClinicalAgent(sampleQuery).then((res) => {
    console.log("=== KLİNİK AI AJAN RAPORU ===");
    console.log("Soru:", res.query);
    console.log("\nÇıkarılan Parametreler:", JSON.stringify(res.extractedParameters, null, 2));
    console.log("\nYerel Motor Çağrı Kaydı:", JSON.stringify(res.toolCallLog, null, 2));
    console.log("\nHekim Yanıtı:\n" + res.physicianExplanation);
    console.log("\nTahmini Token (API ?l??m? de?ildir):", res.tokenUsage);
  });
}

