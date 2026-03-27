// ─── Pension Types ────────────────────────────────────────────────────────────

export type PensionType = 'gesetzlich' | 'ruerup' | 'betrieblich' | 'riester' | 'privat' | 'etf';

export const PENSION_TYPE_LABELS: Record<PensionType, string> = {
  gesetzlich: 'Gesetzliche Rente',
  ruerup: 'Rürup-Rente (Basis-Rente)',
  betrieblich: 'Betriebliche Altersvorsorge',
  riester: 'Riester-Rente',
  privat: 'Private Rente',
  etf: 'ETF-Sparplan',
};

export const PENSION_TYPE_COLORS: Record<PensionType, string> = {
  gesetzlich: '#3b82f6',
  ruerup: '#8b5cf6',
  betrieblich: '#10b981',
  riester: '#f59e0b',
  privat: '#ec4899',
  etf: '#06b6d4',
};

export interface PensionEntry {
  id: string;
  name: string;
  type: PensionType;
  /** Monthly gross pension in € */
  monthlyGross: number;
  /** Year the pension started (used for Besteuerungsanteil of gesetzliche Rente) */
  startYear: number;
  notes?: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

export interface TaxSettings {
  /** Tax year for calculations */
  taxYear: number;
  /** Whether pensioner has children (affects PV rate) */
  hasChildren: boolean;
  /** Whether pensioner is statutorily health-insured (gesetzlich versichert) */
  statutorilyInsured: boolean;
  /** Additional health insurance contribution (Zusatzbeitrag) in % e.g. 1.7 */
  kvZusatzbeitrag: number;
  /** Whether to calculate church tax */
  kirchensteuer: boolean;
  /** Church tax rate in % (8 or 9) */
  kirchensteuerRate: number;
}

export interface Settings {
  theme: Theme;
  tax: TaxSettings;
  /** Planned retirement date (ISO date string, e.g. '2028-01-01') */
  retirementDate: string;
}

// ─── Calculation Results ───────────────────────────────────────────────────────

export interface PensionDeductions {
  /** Monthly KV deduction (health insurance) */
  kvMonthly: number;
  /** Monthly PV deduction (care insurance) */
  pvMonthly: number;
  /** Taxable annual amount for this pension */
  taxableAnnual: number;
}

export interface TaxBreakdown {
  totalGrossMonthly: number;
  totalGrossAnnual: number;
  totalKvMonthly: number;
  totalPvMonthly: number;
  totalSocialMonthly: number;
  taxableAnnual: number;
  incomeTaxAnnual: number;
  incomeTaxMonthly: number;
  etfAnnualGross: number;
  kapitalertragsteuerBase: number;
  kapitalertragsteuerAnnual: number;
  kapitalertragsteuerMonthly: number;
  soliAnnual: number;
  soliMonthly: number;
  kirchensteuerAnnual: number;
  kirchensteuerMonthly: number;
  totalDeductionsMonthly: number;
  netMonthly: number;
  netAnnual: number;
  effectiveTaxRate: number;
}
