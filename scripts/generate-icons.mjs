/**
 * Generates PNG app icons for the PWA from the source SVG (public/favicon.svg).
 *
 * Run via: npm run generate-icons
 *
 * Output files written to public/:
 *   pwa-192x192.png      – standard PWA icon
 *   pwa-512x512.png      – large PWA icon + maskable icon
 *   apple-touch-icon.png – iOS Home Screen icon (180×180)
 *   favicon-32x32.png    – browser tab favicon fallback
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public', 'favicon.svg');
const svgContent = readFileSync(svgPath, 'utf-8');

const icons = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon-32x32.png' },
];

for (const { size, name } of icons) {
  const svgResized = svgContent.replace(
    'viewBox="0 0 32 32"',
    `viewBox="0 0 32 32" width="${size}" height="${size}"`,
  );
  await sharp(Buffer.from(svgResized))
    .resize(size, size)
    .png()
    .toFile(resolve(root, 'public', name));
  console.log(`✓ ${name} (${size}×${size})`);
}
