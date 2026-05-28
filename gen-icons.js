import fs from 'fs';
import { createCanvas } from 'canvas';

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(size/4)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', size/2, size/2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

try {
  createIcon(192, 'public/pwa-192x192.png');
  createIcon(512, 'public/pwa-512x512.png');
  createIcon(180, 'public/apple-touch-icon.png');
} catch (e) {
  console.error("Canvas might not be installed, using a fallback approach or skipping icon generation.", e.message);
}
