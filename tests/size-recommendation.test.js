const assert = require('assert');
const { analyzeImageData, buildSizeRecommendations } = require('../miniprogram/utils/size-recommendation');
const { CM_TO_CSS_PX } = require('../miniprogram/utils/constants');

function makeSolidImage(width, height, r, g, b) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return data;
}

function makeCheckerImage(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const on = (x + y) % 2 === 0;
      data[i] = on ? 0 : 255;
      data[i + 1] = on ? 0 : 255;
      data[i + 2] = on ? 0 : 255;
      data[i + 3] = 255;
    }
  }
  return data;
}

const solid = analyzeImageData(makeSolidImage(32, 32, 255, 255, 255), 32, 32);
const detailed = analyzeImageData(makeCheckerImage(32, 32), 32, 32);
assert.ok(solid.detailScore < detailed.detailScore);

const solidRec = buildSizeRecommendations(solid, 1, '5mm');
const detailRec = buildSizeRecommendations(detailed, 1, '5mm');
const solidTarget = solidRec.options.find((item) => item.active);
const detailTarget = detailRec.options.find((item) => item.active);
assert.ok(solidTarget.width <= detailTarget.width);
assert.strictEqual(CM_TO_CSS_PX, 37.8);

console.log('size-recommendation.test.js passed');
