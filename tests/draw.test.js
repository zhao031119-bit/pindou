const assert = require('assert');

let pageConfig = null;

function makeCanvasContext() {
  const noop = () => {};
  return {
    setFillStyle: noop,
    fillRect: noop,
    setStrokeStyle: noop,
    strokeRect: noop,
    setFontSize: noop,
    fillText: noop,
    draw: (reserve, callback) => {
      if (callback) callback();
    }
  };
}

global.Page = (config) => {
  pageConfig = config;
};

global.wx = {
  getSystemInfoSync() {
    return { windowWidth: 375 };
  },
  createCanvasContext() {
    return makeCanvasContext();
  },
  showModal() {},
  showToast() {}
};

require('../pages/draw/draw');

function createPage() {
  const page = Object.assign({}, pageConfig, {
    data: JSON.parse(JSON.stringify(pageConfig.data)),
    setData(update, callback) {
      this.data = Object.assign({}, this.data, update);
      if (callback) callback();
    }
  });
  page.onLoad({});
  return page;
}

const page = createPage();
let project = page.buildProject();
assert.strictEqual(project.colorStats.length, 0);
assert.ok(project.cells.every((cell) => cell.empty));

page.applyToolAt({
  x: page.offsetX + page.baseCell / 2,
  y: page.offsetY + page.baseCell / 2
});
project = page.buildProject();
assert.strictEqual(project.colorStats.length, 1);
assert.strictEqual(project.colorStats[0].count, 1);

page.onCanvasTouchEnd();
page.setData({ tool: 'eraser' });
page.applyToolAt({
  x: page.offsetX + page.baseCell / 2,
  y: page.offsetY + page.baseCell / 2
});
project = page.buildProject();
assert.strictEqual(project.colorStats.length, 0);
assert.ok(project.cells[0].empty);

console.log('draw.test.js passed');
