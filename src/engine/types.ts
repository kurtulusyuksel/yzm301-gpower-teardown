export type CalculationMode = 'a-priori' | 'post-hoc';

export type TestFamily = 't-paired';

export interface PairedTTestInput {
  test: TestFamily;
  mode: CalculationMode;
  tails: 1 | 2;
  dz: number; // Cohen's dz (|mean difference| / SD difference)
  alpha: number; // Type I error rate (e.g. 0.05)
  power?: number; // Target power for a-priori (e.g. 0.95)
  n?: number; // Total pairs for post-hoc (integer >= 2)
}

export interface PairedTTestOutput {
  n_total: number;
  actual_power: number;
  critical: number;
  df: number;
  ncp: number;
}

export interface CalculationError {
  error: string;
}
