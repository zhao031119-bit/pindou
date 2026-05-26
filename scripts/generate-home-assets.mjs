import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const WIDTH = 512;
const HEIGHT = 384;
const SCALE = 4;
const ORIGIN_X = 16;
const ORIGIN_Y = 12;

const OUT_DIR = path.resolve('miniprogram/assets/home');

const colors = {
  paper: '#fffdf8',
  cream: '#f3ead7',
  line: '#d9cdb3',
  shadow: '#bfb199',
  shadowDark: '#8a7c67',
  ink: '#3f342c',
  clay: '#c56a4c',
  berry: '#d04f3f',
  berryDark: '#a83828',
  mint: '#7fb29a',
  leaf: '#5e9376',
  butter: '#e8b649',
  sky: '#8fb6d9',
  pale: '#fff4df',
  white: '#ffffff',
  softShadow: [42, 31, 23, 38]
};

function parseColor(input) {
  if (Array.isArray(input)) return input;
  const hex = colors[input] || input;
  if (Array.isArray(hex)) return hex;
  const value = hex.replace('#', '');
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255
  ];
}

function createCanvas() {
  return new Uint8Array(WIDTH * HEIGHT * 4);
}

function putPixel(canvas, x, y, rgba) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const offset = (y * WIDTH + x) * 4;
  canvas[offset] = rgba[0];
  canvas[offset + 1] = rgba[1];
  canvas[offset + 2] = rgba[2];
  canvas[offset + 3] = rgba[3];
}

function rectPx(canvas, x, y, w, h, color) {
  const rgba = parseColor(color);
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(WIDTH, Math.round(x + w));
  const y1 = Math.min(HEIGHT, Math.round(y + h));
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      putPixel(canvas, px, py, rgba);
    }
  }
}

function rect(canvas, x, y, w, h, color) {
  rectPx(
    canvas,
    ORIGIN_X + x * SCALE,
    ORIGIN_Y + y * SCALE,
    w * SCALE,
    h * SCALE,
    color
  );
}

function circle(canvas, cx, cy, radius, color) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        rect(canvas, x, y, 1, 1, color);
      }
    }
  }
}

function bead(canvas, x, y, color) {
  rect(canvas, x, y, 5, 5, color);
  rect(canvas, x + 1, y + 1, 2, 2, 'pale');
  rect(canvas, x + 3, y + 4, 2, 1, 'shadowDark');
}

function grid(canvas, x, y, w, h, step = 6) {
  rect(canvas, x, y, w, h, 'cream');
  for (let gx = x + step; gx < x + w; gx += step) {
    rect(canvas, gx, y, 1, h, 'line');
  }
  for (let gy = y + step; gy < y + h; gy += step) {
    rect(canvas, x, gy, w, 1, 'line');
  }
}

function paper(canvas, x, y, w, h) {
  rect(canvas, x + 4, y + 4, w, h, 'softShadow');
  rect(canvas, x + 2, y + 2, w, h, 'shadow');
  rect(canvas, x, y, w, h, 'paper');
  rect(canvas, x + 6, y + 8, w - 12, h - 18, 'cream');
  rect(canvas, x + 17, y - 4, 26, 6, 'cream');
  rect(canvas, x, y + h, Math.floor(w * 0.72), 4, 'cream');
}

function drawPatternAsset() {
  const canvas = createCanvas();
  paper(canvas, 25, 4, 70, 78);
  grid(canvas, 33, 14, 54, 54);

  bead(canvas, 50, 27, 'leaf');
  bead(canvas, 56, 21, 'leaf');
  bead(canvas, 62, 27, 'berry');
  bead(canvas, 56, 33, 'berry');
  bead(canvas, 62, 33, 'berry');
  bead(canvas, 68, 33, 'mint');
  bead(canvas, 56, 39, 'berry');
  bead(canvas, 62, 39, 'berryDark');
  bead(canvas, 68, 39, 'mint');

  bead(canvas, 45, 48, 'mint');
  bead(canvas, 51, 48, 'mint');
  bead(canvas, 57, 48, 'butter');
  bead(canvas, 63, 48, 'butter');
  bead(canvas, 69, 48, 'clay');
  bead(canvas, 51, 54, 'mint');
  bead(canvas, 57, 54, 'butter');
  bead(canvas, 63, 54, 'clay');

  rect(canvas, 72, 68, 15, 4, 'line');
  rect(canvas, 96, 29, 16, 16, 'clay');
  rect(canvas, 102, 48, 14, 14, 'butter');
  rect(canvas, 96, 66, 18, 18, 'mint');
  return canvas;
}

function drawPickAsset() {
  const canvas = createCanvas();
  rect(canvas, 27, 16, 62, 48, 'softShadow');
  rect(canvas, 23, 12, 62, 48, 'paper');
  grid(canvas, 30, 18, 48, 34);

  circle(canvas, 57, 37, 20, 'ink');
  circle(canvas, 57, 37, 16, 'paper');
  circle(canvas, 57, 37, 13, 'sky');
  rect(canvas, 73, 52, 27, 8, 'ink');
  rect(canvas, 94, 58, 13, 8, 'ink');
  rect(canvas, 76, 53, 22, 4, 'shadowDark');

  bead(canvas, 49, 30, 'berry');
  bead(canvas, 55, 30, 'mint');
  bead(canvas, 61, 30, 'butter');
  bead(canvas, 52, 37, 'butter');
  bead(canvas, 58, 37, 'clay');

  rect(canvas, 86, 15, 18, 18, 'berry');
  rect(canvas, 96, 34, 18, 18, 'butter');
  rect(canvas, 17, 34, 10, 10, 'mint');
  return canvas;
}

function drawExtractAsset() {
  const canvas = createCanvas();
  paper(canvas, 24, 4, 66, 70);
  rect(canvas, 31, 14, 12, 12, 'berry');
  rect(canvas, 48, 16, 30, 4, 'line');
  rect(canvas, 48, 23, 22, 3, 'line');

  rect(canvas, 31, 32, 12, 12, 'mint');
  rect(canvas, 48, 34, 30, 4, 'line');
  rect(canvas, 48, 41, 25, 3, 'line');

  rect(canvas, 31, 50, 12, 12, 'butter');
  rect(canvas, 48, 52, 30, 4, 'line');
  rect(canvas, 48, 59, 17, 3, 'line');

  rect(canvas, 80, 17, 18, 18, 'berry');
  rect(canvas, 90, 31, 18, 18, 'butter');
  rect(canvas, 78, 45, 18, 18, 'mint');
  rect(canvas, 88, 64, 15, 5, 'shadow');
  return canvas;
}

function drawDrawAsset() {
  const canvas = createCanvas();
  rect(canvas, 22, 16, 61, 52, 'softShadow');
  rect(canvas, 18, 12, 61, 52, 'paper');
  grid(canvas, 25, 19, 47, 36);

  bead(canvas, 34, 28, 'berry');
  bead(canvas, 40, 28, 'berry');
  bead(canvas, 46, 34, 'mint');
  bead(canvas, 52, 34, 'butter');
  bead(canvas, 40, 40, 'mint');
  bead(canvas, 46, 40, 'butter');

  rect(canvas, 69, 36, 34, 9, 'butter');
  rect(canvas, 96, 32, 8, 17, 'clay');
  rect(canvas, 63, 39, 8, 9, 'ink');
  rect(canvas, 58, 42, 6, 6, 'paper');
  rect(canvas, 83, 48, 9, 4, 'line');
  rect(canvas, 92, 52, 9, 4, 'line');
  return canvas;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  typeBuffer.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return output;
}

function encodePng(canvas) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((WIDTH * 4 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const rowOffset = y * (WIDTH * 4 + 1);
    raw[rowOffset] = 0;
    Buffer.from(canvas.buffer, y * WIDTH * 4, WIDTH * 4).copy(raw, rowOffset + 1);
  }

  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND')
  ]);
}

const assets = {
  'card-generate.png': drawPatternAsset,
  'card-pick.png': drawPickAsset,
  'card-extract.png': drawExtractAsset,
  'card-draw.png': drawDrawAsset
};

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [name, draw] of Object.entries(assets)) {
  fs.writeFileSync(path.join(OUT_DIR, name), encodePng(draw()));
}

console.log(`Generated ${Object.keys(assets).length} homepage assets in ${OUT_DIR}`);
