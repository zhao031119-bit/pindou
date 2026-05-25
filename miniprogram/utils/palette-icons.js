const PALETTE_ICON_BASE = '/miniprogram/assets/icons/palettes/';

function getPaletteIcon(id) {
  return PALETTE_ICON_BASE + (id || 'mard') + '.png';
}

function makePaletteIconOptions(items, getColors) {
  return (items || []).map((item) => {
    const colors = typeof getColors === 'function' ? getColors(item.id) : item.swatches;
    const swatches = Array.isArray(colors) ? colors.slice(0, 4).map((color) => color.hex || color) : [];
    return Object.assign({}, item, {
      icon: getPaletteIcon(item.id),
      swatches
    });
  });
}

module.exports = {
  getPaletteIcon,
  makePaletteIconOptions
};
