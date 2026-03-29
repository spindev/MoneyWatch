import type { Asset } from '../types';

const ASSETS_KEY = 'assetwatch_assets';

export function loadAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(ASSETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Asset[];
  } catch {
    return [];
  }
}

export function saveAssets(assets: Asset[]): void {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
}
