import { createListStorage } from '../../../lib/storage';
import type { Asset } from '../types';

const svc = createListStorage<Asset>('assetwatch_assets');
export const loadAssets = svc.load;
export const saveAssets = svc.save;
