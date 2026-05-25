const assert = require('assert');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'v0-app/src/main.jsx',
  'v0-app/src/App.jsx',
  'v0-app/src/styles.css',
  'v0-app/src/data/pages.js',
  'v0-app/src/data/palettes.js',
  'v0-app/src/data/mockProjects.js',
  'v0-app/src/components/AppFrame.jsx',
  'v0-app/src/components/AppHeader.jsx',
  'v0-app/src/components/BottomActionBar.jsx',
  'v0-app/src/components/PaletteLogo.jsx',
  'v0-app/src/components/PixelCard.jsx',
  'v0-app/src/components/PixelPreview.jsx',
  'v0-app/src/pages/Home.jsx',
  'v0-app/src/pages/Upload.jsx',
  'v0-app/src/pages/Size.jsx',
  'v0-app/src/pages/Result.jsx',
  'v0-app/src/pages/Pick.jsx',
  'v0-app/src/pages/Extract.jsx',
  'v0-app/src/pages/Draw.jsx',
  'v0-app/src/pages/Projects.jsx',
  'v0-app/src/pages/Detail.jsx',
  'V0_GUIDE.md'
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(file), `${file} should exist for the v0 workbench`);
}

const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('/v0-app/src/main.jsx'), 'index.html should load the React workbench entry');

const appSource = fs.readFileSync('v0-app/src/App.jsx', 'utf8');
for (const page of ['Home', 'Upload', 'Size', 'Result', 'Pick', 'Extract', 'Draw', 'Projects', 'Detail']) {
  assert.ok(appSource.includes(`${page} from './pages/${page}.jsx'`), `App.jsx should import ${page}`);
}

const guide = fs.readFileSync('V0_GUIDE.md', 'utf8');
for (const miniappPath of ['pages/home/home', 'pages/upload/upload', 'pages/result/result', 'miniprogram/utils']) {
  assert.ok(guide.includes(miniappPath), `V0_GUIDE.md should mention ${miniappPath}`);
}

const css = fs.readFileSync('v0-app/src/styles.css', 'utf8');
assert.ok(css.includes('.phone-shell'), 'styles.css should define the mobile preview shell');
assert.ok(css.includes('image-rendering: pixelated'), 'styles.css should preserve pixel-art rendering');

console.log('v0-workbench.test.js passed');
