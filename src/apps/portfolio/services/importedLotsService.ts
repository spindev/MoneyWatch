import { PurchaseLot, SaleLot } from '../types';

const LOTS_STORAGE_KEY = 'portfoliowatch_imported_lots';
const SALES_STORAGE_KEY = 'portfoliowatch_imported_sales';

export function getImportedLots(): Record<string, PurchaseLot[]> {
  const raw = localStorage.getItem(LOTS_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, PurchaseLot[]>) : {};
}

export function saveImportedLots(lots: Record<string, PurchaseLot[]>): void {
  localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
}

export function getImportedSales(): Record<string, SaleLot[]> {
  const raw = localStorage.getItem(SALES_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, SaleLot[]>) : {};
}

export function saveImportedSales(sales: Record<string, SaleLot[]>): void {
  localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
}
