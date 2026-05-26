const { normalizeColor } = require('./color');
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

function hasBundledPalette(id) {
  return Array.isArray(STATIC_PALETTES[id]) && STATIC_PALETTES[id].length > 0;
}

function getBundledPaletteOrder() {
  const bundled = PALETTE_ORDER.filter((id) => hasBundledPalette(id));
  return bundled.length ? bundled : [DEFAULT_PALETTE_ID];
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
  const fallbackMeta = PALETTE_META[DEFAULT_PALETTE_ID];
  if (meta.id !== fallbackMeta.id) return createPalette(fallbackMeta);
  return [];
}

const paletteCache = {};

function getPaletteMeta(id) {
  const requested = PALETTE_META[id] || PALETTE_META[DEFAULT_PALETTE_ID];
  const meta = hasBundledPalette(requested.id) ? requested : PALETTE_META[DEFAULT_PALETTE_ID];
  return Object.assign({}, meta, {
    count: hasBundledPalette(meta.id) ? STATIC_PALETTES[meta.id].length : meta.count,
    verified: true
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
  return getBundledPaletteOrder().map((id) => getPaletteMeta(id));
}

function getPaletteName(id) {
  return getPaletteMeta(id).name;
}

module.exports = {
  DEFAULT_PALETTE_ID,
  PALETTE_META,
  listPalettes,
  getPalette,
  getPaletteMeta,
  getPaletteName
};
