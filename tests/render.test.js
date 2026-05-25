const assert = require('assert');
const { makePatternExportLayout, measureLegend } = require('../miniprogram/utils/render');

const baseProject = {
  width: 29,
  height: 29,
  colorStats: [
    { code: 'A1', name: 'White', hex: '#FFFFFF', count: 120 },
    { code: 'B12', name: 'Blue', hex: '#2A80D7', count: 80 },
    { code: 'M101', name: 'Gray', hex: '#888888', count: 12 }
  ]
};

const compactLayout = makePatternExportLayout(baseProject, { mode: 'code' });
assert.ok(compactLayout.cellSize >= 28, '29x29 exports should use large readable cells');
assert.ok(compactLayout.patternWidth > 800, 'export pattern should be large enough to inspect');
assert.ok(compactLayout.exportHeight > compactLayout.patternHeight, 'export includes header and legend space');

const denseLayout = makePatternExportLayout({
  width: 120,
  height: 90,
  colorStats: baseProject.colorStats
}, { mode: 'code' });
assert.ok(denseLayout.cellSize >= 12, 'large patterns should still keep a readable minimum cell size');
assert.ok(denseLayout.exportWidth <= 2600, 'large exports should stay within a practical canvas width');

const legendHeight = measureLegend(baseProject.colorStats, 900);
assert.ok(legendHeight >= 86, 'legend keeps enough height for readable labels');

console.log('render.test.js passed');
