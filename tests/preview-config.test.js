const assert = require('assert');
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

assert.ok(pkg.scripts.dev.includes('vite'), 'dev script should use Vite for v0 preview');
assert.ok(pkg.scripts.build.includes('vite build'), 'build script should use Vite build');
assert.ok(pkg.scripts.preview.includes('vite preview'), 'preview script should use Vite preview');
assert.ok(pkg.devDependencies && pkg.devDependencies.vite, 'vite should be listed in devDependencies');
assert.ok(fs.existsSync('index.html'), 'Vite should have a root index.html entry');

console.log('preview-config.test.js passed');
