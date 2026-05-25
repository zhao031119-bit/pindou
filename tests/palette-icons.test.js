const assert = require('assert');
const { PALETTE_ORDER } = require('../miniprogram/utils/constants');
const { getPaletteIcon, makePaletteIconOptions } = require('../miniprogram/utils/palette-icons');

PALETTE_ORDER.forEach((id) => {
  const icon = getPaletteIcon(id);
  assert.ok(icon.endsWith(`${id}.png`), `${id} should point to its own png icon`);
  assert.ok(icon.startsWith('/miniprogram/assets/icons/palettes/'), `${id} should use local miniapp asset path`);
});

const options = makePaletteIconOptions([
  { id: 'mard', name: 'MARD家', count: 291 },
  { id: 'artkal197', name: 'Artkal 197', count: 197 }
]);
assert.strictEqual(options[0].icon, getPaletteIcon('mard'));
assert.ok(Array.isArray(options[0].swatches), 'swatches array is always present');

console.log('palette-icons.test.js passed');
