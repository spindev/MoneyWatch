import { ForecastPoint, Holding, PurchaseLot, SaleSimulationResult, SimulatedSaleLot } from '../types';

export function calculateTotalValue(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
}

export function calculateTotalCost(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.shares * h.avgBuyPrice, 0);
}

export function calculateTotalGain(holdings: Holding[]): number {
  return calculateTotalValue(holdings) - calculateTotalCost(holdings);
}

export function calculateTotalGainPercent(holdings: Holding[]): number {
  const cost = calculateTotalCost(holdings);
  if (cost === 0) return 0;
  return ((calculateTotalValue(holdings) - cost) / cost) * 100;
}

export function calculateHoldingGain(holding: Holding): number {
  return (holding.currentPrice - holding.avgBuyPrice) * holding.shares;
}

export function calculateHoldingGainPercent(holding: Holding): number {
  if (holding.avgBuyPrice === 0) return 0;
  return ((holding.currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;
}

export function calculatePriceGainPercent(currentPrice: number, buyPrice: number): number {
  if (buyPrice === 0) return 0;
  return ((currentPrice - buyPrice) / buyPrice) * 100;
}

export function formatCurrency(value: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/** Format a share count using German locale (comma as decimal separator) */
export function formatShares(shares: number): string {
  return shares.toLocaleString('de-DE', { maximumFractionDigits: 6 });
}

/**
 * Parse a German-formatted number string where periods are thousands separators
 * and a comma is the decimal separator (e.g. "1.234,56" → 1234.56).
 */
export function parseGermanNumber(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'));
}

/** Returns today's date as a 'YYYY-MM-DD' string (UTC). */
export function todayIsoString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns true when `shares` is not a whole number (e.g. 10.35 → true). */
export function isFractional(shares: number): boolean {
  return Math.abs(shares - Math.round(shares)) > 1e-9;
}

/**
 * Simulate a FIFO sale of `sharesToSell` shares at `salePrice`.
 * Processes the oldest buy lots first (caller must pass lots sorted oldest-first).
 */
export function simulateFifoSale(
  lots: PurchaseLot[],
  salePrice: number,
  sharesToSell: number,
): SaleSimulationResult {
  const totalAvailable = lots.reduce((s, l) => s + l.shares, 0);
  const sufficientShares = sharesToSell <= totalAvailable + 1e-9;
  const actualSell = Math.min(sharesToSell, totalAvailable);

  const soldLots: SimulatedSaleLot[] = [];
  let remaining = actualSell;

  for (const lot of lots) {
    if (remaining <= 1e-9) break;
    const sellFromLot = Math.min(lot.shares, remaining);
    const cost = sellFromLot * lot.buyPrice;
    const proceeds = sellFromLot * salePrice;
    const gain = proceeds - cost;
    const leftover = lot.shares - sellFromLot;
    const leavesPartialRemainder = leftover > 1e-9 && isFractional(leftover);
    soldLots.push({
      date: lot.date,
      shares: sellFromLot,
      buyPrice: lot.buyPrice,
      salePrice,
      cost,
      proceeds,
      gain,
      gainPct: lot.buyPrice > 0 ? ((salePrice - lot.buyPrice) / lot.buyPrice) * 100 : 0,
      leavesPartialRemainder,
    });
    remaining = Math.max(0, remaining - lot.shares);
  }

  const totalShares = soldLots.reduce((s, l) => s + l.shares, 0);
  const totalCost = soldLots.reduce((s, l) => s + l.cost, 0);
  const totalProceeds = soldLots.reduce((s, l) => s + l.proceeds, 0);
  const totalGain = totalProceeds - totalCost;
  const remainingShares = Math.max(0, totalAvailable - totalShares);
  const remainingValue = remainingShares * salePrice;

  return {
    soldLots,
    totalShares,
    totalCost,
    totalProceeds,
    totalGain,
    remainingShares,
    remainingValue,
    sufficientShares,
  };
}

/**
 * Calculate the number of shares (using FIFO order) required to realise exactly
 * `targetGain` euros of profit at `salePrice`.
 */
export function sharesForTargetGain(
  lots: PurchaseLot[],
  salePrice: number,
  targetGain: number,
): number {
  if (targetGain <= 0) return 0;

  let accumulated = 0;
  let totalShares = 0;

  for (const lot of lots) {
    if (accumulated >= targetGain) break;

    const gainPerShare = salePrice - lot.buyPrice;
    const fullLotGain = gainPerShare * lot.shares;

    if (gainPerShare > 0 && accumulated + fullLotGain >= targetGain) {
      const partialShares = (targetGain - accumulated) / gainPerShare;
      totalShares += partialShares;
      return totalShares;
    }

    accumulated += fullLotGain;
    totalShares += lot.shares;
  }

  return totalShares;
}

/**
 * Build yearly forecast data points from today forward for `years` years.
 * Annual return rates are provided as percentages (e.g. 3 for 3%).
 */
export function buildForecast(
  currentValue: number,
  totalCost: number,
  monthlySavings: number,
  years: number,
  pessimisticRate = 3,
  realisticRate = 7,
  optimisticRate = 10,
): ForecastPoint[] {
  const monthlyRate = (annual: number) => (1 + annual / 100) ** (1 / 12) - 1;
  const rPess = monthlyRate(pessimisticRate);
  const rReal = monthlyRate(realisticRate);
  const rOpt  = monthlyRate(optimisticRate);

  const startYear = new Date().getFullYear();
  const points: ForecastPoint[] = [];

  points.push({
    date: String(startYear),
    totalInvested: totalCost,
    pessimistic: currentValue,
    realistic: currentValue,
    optimistic: currentValue,
  });

  let vPess = currentValue;
  let vReal = currentValue;
  let vOpt  = currentValue;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      vPess = (vPess + monthlySavings) * (1 + rPess);
      vReal = (vReal + monthlySavings) * (1 + rReal);
      vOpt  = (vOpt  + monthlySavings) * (1 + rOpt);
    }
    points.push({
      date: String(startYear + y),
      totalInvested: totalCost + monthlySavings * 12 * y,
      pessimistic: vPess,
      realistic:   vReal,
      optimistic:  vOpt,
    });
  }

  return points;
}
