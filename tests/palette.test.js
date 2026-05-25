const assert = require('assert');
const { listPalettes, getPalette, isPaletteVerified } = require('../miniprogram/utils/palettes');
const { hexToRgb } = require('../miniprogram/utils/color');
const { mapAverageGridToPalette } = require('../miniprogram/utils/pattern');

const palettes = listPalettes();
assert.strictEqual(palettes.length, 10);
assert.strictEqual(getPalette('mard').length, 291);
assert.strictEqual(getPalette('artkal418').length, 418);
assert.strictEqual(isPaletteVerified('mard'), true);
assert.strictEqual(isPaletteVerified('artkal197'), false);

const grid = [
  { x: 0, y: 0, r: 255, g: 255, b: 255, hex: '#FFFFFF' },
  { x: 1, y: 0, r: 0, g: 0, b: 0, hex: '#000000' }
];
const mapped = mapAverageGridToPalette(grid, 'mard');
assert.strictEqual(mapped.cells.length, 2);
assert.ok(mapped.colorStats.length >= 1);

const duplicateCodeColors = getPalette('panpan').filter((color) => color.code === '-').slice(0, 2);
assert.strictEqual(duplicateCodeColors.length, 2);
const duplicateGrid = duplicateCodeColors.map((color, index) => {
  const rgb = hexToRgb(color.hex);
  return Object.assign({ x: index, y: 0, hex: color.hex }, rgb);
});
const duplicateMapped = mapAverageGridToPalette(duplicateGrid, 'panpan');
assert.strictEqual(duplicateMapped.colorStats.length, 2);
assert.notStrictEqual(duplicateMapped.colorStats[0].statKey, duplicateMapped.colorStats[1].statKey);

console.log('palette.test.js passed');
