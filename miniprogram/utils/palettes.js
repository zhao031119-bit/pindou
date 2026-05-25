const { rgbToHex, hexToRgb, rgbToLab, normalizeColor } = require('./color');
const { PALETTE_ORDER, DEFAULT_PALETTE_ID } = require('./constants');
let STATIC_PALETTES = {};

try {
  STATIC_PALETTES = require('../data/palette-data');
} catch (error) {
  STATIC_PALETTES = {};
}

const PALETTE_META = {
  mard: { id: 'mard', name: 'MARD家', count: 291, prefix: 'M', seed: 11 },
  panpan: { id: 'panpan', name: '盼盼家', count: 289, prefix: 'P', seed: 23 },
  common: { id: 'common', name: '通用', count: 291, prefix: 'T', seed: 31 },
  coco: { id: 'coco', name: 'COCO', count: 291, prefix: 'C', seed: 43 },
  manman: { id: 'manman', name: '漫漫家', count: 278, prefix: 'MM', seed: 59 },
  mixiaowo: { id: 'mixiaowo', name: '咪小窝', count: 290, prefix: 'X', seed: 71 },
  artkal197: { id: 'artkal197', name: '优肯197色', count: 197, prefix: 'Y', seed: 83 },
  xiaowu: { id: 'xiaowu', name: '小舞家', count: 291, prefix: 'W', seed: 97 },
  huangdoudou: { id: 'huangdoudou', name: '黄豆豆', count: 291, prefix: 'H', seed: 109 },
  artkal418: { id: 'artkal418', name: '优肯418色', count: 418, prefix: 'YK', seed: 127 }
};

const BASE_COLORS = [
  '#FFFFFF', '#F7F3ED', '#EDE2D1', '#D9C1A3', '#B9916D', '#8B684C', '#5A3C2D', '#2B2B2B',
  '#F92B40', '#D40E1F', '#A9113F', '#711033', '#F893BF', '#E575C7', '#B5038F', '#7A2A8B',
  '#F8ED33', '#F5C69B', '#FDA42E', '#F47E36', '#DD521C', '#9F5928', '#6E501D',
  '#E8FFE7', '#B6DBAF', '#64E0A4', '#26B78E', '#1A6E3D', '#305335', '#022C22',
  '#E6FAFF', '#9EE0F8', '#44CDFB', '#188690', '#0F52BD', '#2F1E8E', '#07004A',
  '#F2EEFF', '#D6BAF5', '#9F85CF', '#6F4285', '#4B233A',
  '#F4F4F4', '#D8D4D3', '#B4B4B4', '#878787', '#5D6163', '#303236'
];

function pseudoRandom(seed) {
  let value = seed % 2147483647;
  return function next() {
    value = (value * 48271) % 2147483647;
    return value / 2147483647;
  };
}

function mixChannel(a, b, ratio, jitter) {
  return Math.round(a * (1 - ratio) + b * ratio + jitter);
}

function makeCode(prefix, index) {
  const number = String(index + 1).padStart(3, '0');
  return prefix + number;
}

function createPalette(meta) {
  if (STATIC_PALETTES[meta.id] && STATIC_PALETTES[meta.id].length) {
    return STATIC_PALETTES[meta.id].map((item) => normalizeColor({
      id: meta.id + '-' + item.code,
      paletteId: meta.id,
      code: item.code,
      name: meta.name + ' ' + item.code,
      hex: item.hex
    }));
  }
  const next = pseudoRandom(meta.seed);
  const colors = [];
  for (let i = 0; i < meta.count; i += 1) {
    const base = hexToRgb(BASE_COLORS[i % BASE_COLORS.length]);
    const target = hexToRgb(BASE_COLORS[(i * 7 + meta.seed) % BASE_COLORS.length]);
    const ratio = (i % 9) / 10 + 0.05;
    const jitter = () => (next() - 0.5) * 18;
    const rgb = {
      r: mixChannel(base.r, target.r, ratio, jitter()),
      g: mixChannel(base.g, target.g, ratio, jitter()),
      b: mixChannel(base.b, target.b, ratio, jitter())
    };
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    colors.push(normalizeColor({
      id: meta.id + '-' + makeCode(meta.prefix, i),
      paletteId: meta.id,
      code: makeCode(meta.prefix, i),
      name: meta.name + ' ' + makeCode(meta.prefix, i),
      hex,
      rgb,
      lab: rgbToLab(rgb.r, rgb.g, rgb.b)
    }));
  }
  return colors;
}

const paletteCache = {};

function getPaletteMeta(id) {
  const meta = PALETTE_META[id] || PALETTE_META[DEFAULT_PALETTE_ID];
  return Object.assign({}, meta, {
    verified: !!(STATIC_PALETTES[meta.id] && STATIC_PALETTES[meta.id].length)
  });
}

function getPalette(id) {
  const resolved = getPaletteMeta(id).id;
  if (!paletteCache[resolved]) {
    paletteCache[resolved] = createPalette(PALETTE_META[resolved]);
  }
  return paletteCache[resolved];
}

function listPalettes() {
  return PALETTE_ORDER.map((id) => getPaletteMeta(id));
}

function getPaletteName(id) {
  return getPaletteMeta(id).name;
}

function isPaletteVerified(id) {
  return getPaletteMeta(id).verified;
}

module.exports = {
  DEFAULT_PALETTE_ID,
  PALETTE_META,
  listPalettes,
  getPalette,
  getPaletteMeta,
  getPaletteName,
  isPaletteVerified
};
