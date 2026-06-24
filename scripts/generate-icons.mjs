// Script to generate PWA icons from an SVG using sharp
// Run with: node scripts/generate-icons.mjs

import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// Draw the TechRadar icon programmatically on canvas
for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  const r = size * 0.25;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(size, 0, size, size, r);
  ctx.arcTo(size, size, 0, size, r);
  ctx.arcTo(0, size, 0, 0, r);
  ctx.arcTo(0, 0, size, 0, r);
  ctx.closePath();
  ctx.fill();

  // Text "TR" in gold
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#C9A84C');
  gradient.addColorStop(1, '#F5E6A3');
  ctx.fillStyle = gradient;

  const fontSize = Math.round(size * 0.44);
  ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TR', size / 2, size / 2 + size * 0.02);

  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Generated ${outputPath}`);
}

console.log('All icons generated!');
