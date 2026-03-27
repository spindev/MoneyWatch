import type { PensionEntry, PensionDeductions, TaxBreakdown, TaxSettings } from '../types';

// ─── German Tax Constants (2024) ──────────────────────────────────────────────

const WERBUNGSKOSTENPAUSCHALE = 102;
const SONDERAUSGABEN_PAUSCHBETRAG = 36;
const KV_BASISBEITRAGSSATZ = 14.6;
const PV_BEITRAGSSATZ_MIT_KINDER = 3.6;
const PV_BEITRAGSSATZ_OHNE_KINDER = 4.2;
const ABGELTUNGSTEUER_SATZ = 25;
const SOLI_SATZ = 5.5;
export const SPARERPAUSCHBETRAG = 1_000;

function roundToCents(value: number): number {
  return Math.floor(value * 100) / 100;
}

function getBesteuerungsanteil(startYear: number): number {
  if (startYear <= 2005) return 0.50;
  if (startYear >= 2040) return 1.00;
  if (startYear <= 2020) return 0.50 + (startYear - 2005) * 0.02;
  return 0.80 + (startYear - 2020) * 0.01;
}

function calcPensionDeductions(
  entry: PensionEntry,
  taxSettings: TaxSettings,
): PensionDeductions {
  if (!taxSettings.statutorilyInsured) {
    return {
      kvMonthly: 0,
      pvMonthly: 0,
      taxableAnnual: calcTaxableAmount(entry),
    };
  }

  const pvRate =
    taxSettings.hasChildren
      ? PV_BEITRAGSSATZ_MIT_KINDER
      : PV_BEITRAGSSATZ_OHNE_KINDER;

  let kvMonthly = 0;
  let pvMonthly = 0;

  switch (entry.type) {
    case 'gesetzlich': {
      const halfZusatz = taxSettings.kvZusatzbeitrag / 2;
      const kvRate = KV_BASISBEITRAGSSATZ / 2 + halfZusatz;
      kvMonthly = (entry.monthlyGross * kvRate) / 100;
      pvMonthly = (entry.monthlyGross * pvRate) / 100;
      break;
    }
    case 'betrieblich': {
      const kvRate = KV_BASISBEITRAGSSATZ + taxSettings.kvZusatzbeitrag;
      kvMonthly = (entry.monthlyGross * kvRate) / 100;
      pvMonthly = (entry.monthlyGross * pvRate) / 100;
      break;
    }
    case 'ruerup':
    case 'riester':
    case 'privat':
    case 'etf':
    default:
      kvMonthly = 0;
      pvMonthly = 0;
      break;
  }

  return {
    kvMonthly,
    pvMonthly,
    taxableAnnual: calcTaxableAmount(entry),
  };
}

function calcTaxableAmount(entry: PensionEntry): number {
  const annualGross = entry.monthlyGross * 12;

  switch (entry.type) {
    case 'gesetzlich': {
      const anteil = getBesteuerungsanteil(entry.startYear);
      return annualGross * anteil;
    }
    case 'ruerup':
    case 'betrieblich':
    case 'riester':
      return annualGross;
    case 'privat':
      return annualGross * 0.18;
    case 'etf':
      return 0;
    default:
      return annualGross;
  }
}

function calcEinkommensteuer(zvE: number): number {
  if (zvE <= 0) return 0;

  const ZONE1_START = 11_604;
  const ZONE1_END = 17_005;
  const ZONE2_END = 66_760;
  const ZONE3_END = 277_825;

  if (zvE <= ZONE1_START) return 0;

  if (zvE <= ZONE1_END) {
    const y = (zvE - ZONE1_START) / 10_000;
    return Math.floor((922.98 * y + 1_400) * y);
  }

  if (zvE <= ZONE2_END) {
    const z = (zvE - ZONE1_END) / 10_000;
    return Math.floor((181.19 * z + 2_397) * z + 938.24);
  }

  if (zvE <= ZONE3_END) {
    return Math.floor(0.42 * zvE - 9_972.98);
  }

  return Math.floor(0.45 * zvE - 18_307.73);
}

export function calcTaxBreakdown(
  pensions: PensionEntry[],
  taxSettings: TaxSettings,
): TaxBreakdown {
  if (pensions.length === 0) {
    return {
      totalGrossMonthly: 0,
      totalGrossAnnual: 0,
      totalKvMonthly: 0,
      totalPvMonthly: 0,
      totalSocialMonthly: 0,
      taxableAnnual: 0,
      incomeTaxAnnual: 0,
      incomeTaxMonthly: 0,
      kapitalertragsteuerAnnual: 0,
      kapitalertragsteuerMonthly: 0,
      etfAnnualGross: 0,
      kapitalertragsteuerBase: 0,
      soliAnnual: 0,
      soliMonthly: 0,
      kirchensteuerAnnual: 0,
      kirchensteuerMonthly: 0,
      totalDeductionsMonthly: 0,
      netMonthly: 0,
      netAnnual: 0,
      effectiveTaxRate: 0,
    };
  }

  const deductions = pensions.map((p) => calcPensionDeductions(p, taxSettings));

  const totalGrossMonthly = pensions.reduce((s, p) => s + p.monthlyGross, 0);
  const totalGrossAnnual = totalGrossMonthly * 12;
  const totalKvMonthly = deductions.reduce((s, d) => s + d.kvMonthly, 0);
  const totalPvMonthly = deductions.reduce((s, d) => s + d.pvMonthly, 0);
  const totalSocialMonthly = totalKvMonthly + totalPvMonthly;

  const rawTaxableAnnual = deductions.reduce((s, d) => s + d.taxableAnnual, 0);

  const zvE = Math.max(
    0,
    rawTaxableAnnual - WERBUNGSKOSTENPAUSCHALE - SONDERAUSGABEN_PAUSCHBETRAG,
  );

  const incomeTaxAnnual = calcEinkommensteuer(zvE);
  const incomeTaxMonthly = incomeTaxAnnual / 12;

  const etfAnnualGross = pensions
    .filter((p) => p.type === 'etf')
    .reduce((s, p) => s + p.monthlyGross * 12, 0);
  const kapitalertragsteuerBase = Math.max(0, etfAnnualGross - SPARERPAUSCHBETRAG);
  const kapitalertragsteuerAnnual = roundToCents(
    (kapitalertragsteuerBase * ABGELTUNGSTEUER_SATZ) / 100,
  );
  const kapitalertragsteuerMonthly = kapitalertragsteuerAnnual / 12;
  const soliAnnual = roundToCents(kapitalertragsteuerAnnual * SOLI_SATZ / 100);
  const soliMonthly = soliAnnual / 12;

  const kirchensteuerAnnual = taxSettings.kirchensteuer
    ? roundToCents(incomeTaxAnnual * (taxSettings.kirchensteuerRate / 100))
    : 0;
  const kirchensteuerMonthly = kirchensteuerAnnual / 12;

  const totalDeductionsMonthly =
    totalSocialMonthly +
    incomeTaxMonthly +
    kapitalertragsteuerMonthly +
    soliMonthly +
    kirchensteuerMonthly;

  const netMonthly = totalGrossMonthly - totalDeductionsMonthly;
  const netAnnual = netMonthly * 12;

  const effectiveTaxRate =
    totalGrossAnnual > 0
      ? ((totalDeductionsMonthly * 12) / totalGrossAnnual) * 100
      : 0;

  return {
    totalGrossMonthly,
    totalGrossAnnual,
    totalKvMonthly,
    totalPvMonthly,
    totalSocialMonthly,
    taxableAnnual: zvE,
    incomeTaxAnnual,
    incomeTaxMonthly,
    kapitalertragsteuerAnnual,
    kapitalertragsteuerMonthly,
    etfAnnualGross,
    kapitalertragsteuerBase,
    soliAnnual,
    soliMonthly,
    kirchensteuerAnnual,
    kirchensteuerMonthly,
    totalDeductionsMonthly,
    netMonthly,
    netAnnual,
    effectiveTaxRate,
  };
}
