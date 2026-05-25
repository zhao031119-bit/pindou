const assert = require('assert');
const { hexToRgb, rgbToHex, nearestColor } = require('../miniprogram/utils/color');

assert.deepStrictEqual(hexToRgb('#FFFFFF'), { r: 255, g: 255, b: 255 });
assert.strictEqual(rgbToHex(255, 0, 128), '#FF0080');

const palette = [
  { code: 'A', hex: '#000000' },
  { code: 'B', hex: '#FFFFFF' }
];
const match = nearestColor({ r: 250, g: 250, b: 250 }, palette);
assert.strictEqual(match.color.code, 'B');

console.log('color.test.js passed');
