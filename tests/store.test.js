const assert = require('assert');

const memory = {};
let failSet = false;

global.wx = {
  getStorageSync(key) {
    return memory[key];
  },
  setStorageSync(key, value) {
    if (failSet) throw new Error('storage full');
    memory[key] = value;
  },
  removeStorageSync(key) {
    delete memory[key];
  }
};

const { listProjects, getProject, saveProject, deleteProject } = require('../miniprogram/utils/store');

const sampleProject = {
  id: 'p1',
  name: 'test',
  width: 2,
  height: 2,
  cells: [
    { x: 0, y: 0, hex: '#FF0000', empty: false },
    { x: 1, y: 0, hex: '#00FF00', empty: false },
    { x: 0, y: 1, hex: '#0000FF', empty: false },
    { x: 1, y: 1, hex: '#FFFFFF', empty: true }
  ]
};

const saved = saveProject(sampleProject);
assert.ok(saved, 'saveProject should succeed');
assert.strictEqual(listProjects().length, 1);

const summary = listProjects()[0];
assert.ok(summary.thumbnail, 'summary should embed thumbnail');
assert.ok(Array.isArray(summary.thumbnail.previewCells), 'thumbnail has previewCells');
assert.strictEqual(summary.cells, undefined, 'summary should not carry cells');

const full = getProject('p1');
assert.ok(full, 'getProject returns full project');
assert.strictEqual(full.cells.length, 4, 'full project has cells');

failSet = true;
const failed = saveProject({ id: 'p2', name: 'failed', width: 1, height: 1 });
assert.strictEqual(failed, null);
assert.strictEqual(listProjects().length, 1);
failSet = false;

saveProject({ id: 'p3', name: 'second', width: 1, height: 1, cells: [] });
assert.strictEqual(listProjects().length, 2);

deleteProject('p1');
assert.strictEqual(listProjects().length, 1);
assert.strictEqual(getProject('p1'), null, 'deleted project should not be retrievable');
assert.strictEqual(listProjects()[0].id, 'p3');

deleteProject('nonexistent');
assert.strictEqual(listProjects().length, 1, 'deleting nonexistent id is a no-op');

memory.bead_projects_v1 = [
  {
    id: 'legacy-1',
    name: 'legacy',
    width: 1,
    height: 1,
    cells: [{ x: 0, y: 0, hex: '#FFFFFF', empty: true }]
  }
];
assert.strictEqual(listProjects().length, 2, 'legacy projects remain visible after v2 index exists');
saveProject({ id: 'p4', name: 'third', width: 1, height: 1, cells: [] });
assert.ok(listProjects().some((project) => project.id === 'legacy-1'), 'saving v2 project keeps legacy summaries visible');
assert.ok(getProject('legacy-1'), 'legacy project is still retrievable');
deleteProject('legacy-1');
assert.strictEqual(getProject('legacy-1'), null, 'legacy project can be deleted after v2 index exists');
assert.ok(!listProjects().some((project) => project.id === 'legacy-1'));

console.log('store.test.js passed');
