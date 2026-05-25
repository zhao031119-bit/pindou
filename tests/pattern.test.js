const assert = require('assert');
const { mapAverageGridToPalette, remapProject, createProject, estimateStats } = require('../miniprogram/utils/pattern');

const grid = [
  { x: 0, y: 0, r: 255, g: 255, b: 255, hex: '#FFFFFF' },
  { x: 1, y: 0, r: 255, g: 255, b: 255, hex: '#FFFFFF' },
  { x: 0, y: 1, r: 0, g: 0, b: 0, hex: '#000000' },
  { x: 1, y: 1, r: 0, g: 0, b: 0, hex: '#000000' }
];

const mapped = mapAverageGridToPalette(grid, 'mard');
assert.strictEqual(mapped.cells.length, 4);
assert.ok(mapped.colorStats.length >= 1, 'should produce at least one color stat');

const project = createProject({
  type: 'generated',
  width: 2,
  height: 2,
  beadSize: '5mm',
  paletteId: 'mard',
  averageGrid: grid,
  cells: mapped.cells,
  colorStats: mapped.colorStats
});
assert.strictEqual(project.paletteId, 'mard');
assert.strictEqual(project.width, 2);
assert.strictEqual(project.stats.total, 4);

const remapped = remapProject(project, 'panpan');
assert.strictEqual(remapped.paletteId, 'panpan');
assert.strictEqual(remapped.cells.length, 4);
assert.ok(remapped.cells.every((cell) => cell.paletteId === 'panpan'), 'all cells reassigned to new palette');
assert.strictEqual(remapped.averageGrid, project.averageGrid, 'averageGrid is preserved');
assert.ok(remapped.updatedAt >= project.updatedAt, 'updatedAt advances on remap');

const stats = estimateStats(58, 58, '5mm');
assert.strictEqual(stats.total, 58 * 58);
assert.strictEqual(stats.boardColumns, 2);
assert.strictEqual(stats.boardRows, 2);

console.log('pattern.test.js passed');
