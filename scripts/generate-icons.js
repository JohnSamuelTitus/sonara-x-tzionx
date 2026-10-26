import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height, getPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// High-quality rasterizer for Sonara Brand Icon
function renderSonaraIcon(isMaskable) {
  // Colors
  const bg = [10, 8, 9, 255]; // #0A0809
  const ring1 = [61, 46, 55, 255]; // #3D2E37
  const ringGold = [212, 175, 55, Math.round(255 * 0.45)]; // #D4AF37
  const vermilion = [217, 56, 30, 255]; // #D9381E
  const gold = [212, 175, 55, 255]; // #D4AF37

  return (x, y, w, h) => {
    // Coordinate normalized to 0..48
    // If maskable, scale by 0.75 and center
    const scale = isMaskable ? 0.75 : 0.92;
    const center = 24;

    const nx = ((x / w) - 0.5) * (48 / scale) + center;
    const ny = ((y / h) - 0.5) * (48 / scale) + center;

    // Corner radius for non-maskable icons
    if (!isMaskable) {
      const rx = (x / w) * 48;
      const ry = (y / h) * 48;
      const rCorner = 12;
      const inX = rx >= rCorner && rx <= 48 - rCorner;
      const inY = ry >= rCorner && ry <= 48 - rCorner;
      if (!inX && !inY) {
        const cx = rx < rCorner ? rCorner : 48 - rCorner;
        const cy = ry < rCorner ? rCorner : 48 - rCorner;
        const dist = Math.hypot(rx - cx, ry - cy);
        if (dist > rCorner) {
          // Transparent outside rounded corner
          return [0, 0, 0, 0];
        }
      }
    }

    // Default to obsidian background
    let r = bg[0], g = bg[1], b = bg[2], a = bg[3];

    // Radial distance from center (24, 24)
    const distToCenter = Math.hypot(nx - center, ny - center);

    // Outer vinyl ring (r = 21, stroke = 1.5)
    if (distToCenter >= 20.2 && distToCenter <= 21.8) {
      const t = 1 - Math.abs(distToCenter - 21) / 0.8;
      r = Math.round(r * (1 - t) + ring1[0] * t);
      g = Math.round(g * (1 - t) + ring1[1] * t);
      b = Math.round(b * (1 - t) + ring1[2] * t);
    }

    // Inner gold ring (r = 19, stroke = 1.2)
    if (distToCenter >= 18.4 && distToCenter <= 19.6) {
      const alpha = ringGold[3] / 255;
      r = Math.round(r * (1 - alpha) + ringGold[0] * alpha);
      g = Math.round(g * (1 - alpha) + ringGold[1] * alpha);
      b = Math.round(b * (1 - alpha) + ringGold[2] * alpha);
    }

    // Equalizer bars definition: [x, y, w, h, rx, color]
    const bars = [
      [11, 20, 4, 8, 2, vermilion],
      [17, 14, 4, 20, 2, gold],
      [23, 9, 4, 30, 2, vermilion],
      [29, 15, 4, 18, 2, gold],
      [35, 21, 4, 6, 2, vermilion],
    ];

    for (const [bx, by, bw, bh, br, col] of bars) {
      if (nx >= bx && nx <= bx + bw && ny >= by && ny <= by + bh) {
        // Rounded caps
        const inMidX = nx >= bx + br && nx <= bx + bw - br;
        const inMidY = ny >= by + br && ny <= by + bh - br;
        if (!inMidX && !inMidY) {
          const cx = nx < bx + br ? bx + br : bx + bw - br;
          const cy = ny < by + br ? by + br : by + bh - br;
          if (Math.hypot(nx - cx, ny - cy) > br) {
            continue;
          }
        }
        return col;
      }
    }

    return [r, g, b, a];
  };
}

// Generate SVG files
const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#0A0809"/>
  <!-- Concentric Vinyl Rings -->
  <circle cx="256" cy="256" r="224" stroke="#3D2E37" stroke-width="16"/>
  <circle cx="256" cy="256" r="202" stroke="#D4AF37" stroke-width="12" stroke-opacity="0.45"/>
  <circle cx="256" cy="256" r="172" stroke="#3D2E37" stroke-width="6" stroke-opacity="0.3"/>
  <circle cx="256" cy="256" r="142" stroke="#3D2E37" stroke-width="4" stroke-opacity="0.2"/>
  <!-- Cinema Sound Reel Equalizer Bars -->
  <rect x="117" y="213" width="43" height="86" rx="21.5" fill="#D9381E"/>
  <rect x="181" y="149" width="43" height="214" rx="21.5" fill="#D4AF37"/>
  <rect x="245" y="96" width="43" height="320" rx="21.5" fill="#D9381E"/>
  <rect x="309" y="160" width="43" height="192" rx="21.5" fill="#D4AF37"/>
  <rect x="373" y="224" width="43" height="64" rx="21.5" fill="#D9381E"/>
</svg>`;

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <!-- Full bleed background for adaptive masks -->
  <rect width="512" height="512" fill="#0A0809"/>
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <circle cx="256" cy="256" r="224" stroke="#3D2E37" stroke-width="16"/>
    <circle cx="256" cy="256" r="202" stroke="#D4AF37" stroke-width="12" stroke-opacity="0.45"/>
    <circle cx="256" cy="256" r="172" stroke="#3D2E37" stroke-width="6" stroke-opacity="0.3"/>
    <circle cx="256" cy="256" r="142" stroke="#3D2E37" stroke-width="4" stroke-opacity="0.2"/>
    <rect x="117" y="213" width="43" height="86" rx="21.5" fill="#D9381E"/>
    <rect x="181" y="149" width="43" height="214" rx="21.5" fill="#D4AF37"/>
    <rect x="245" y="96" width="43" height="320" rx="21.5" fill="#D9381E"/>
    <rect x="309" y="160" width="43" height="192" rx="21.5" fill="#D4AF37"/>
    <rect x="373" y="224" width="43" height="64" rx="21.5" fill="#D9381E"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), masterSvg);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableSvg);

// Generate PNG icons
const standardRaster = renderSonaraIcon(false);
const maskableRaster = renderSonaraIcon(true);

console.log('Generating PWA icons...');

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192, standardRaster));
console.log('✓ icon-192.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512, standardRaster));
console.log('✓ icon-512.png');

fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), createPng(192, 192, maskableRaster));
console.log('✓ icon-maskable-192.png');

fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), createPng(512, 512, maskableRaster));
console.log('✓ icon-maskable-512.png');

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPng(180, 180, standardRaster));
console.log('✓ apple-touch-icon.png');

console.log('All PWA icons generated successfully!');
