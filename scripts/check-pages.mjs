import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const requiredExts = ['js', 'json', 'wxml', 'wxss'];
let failed = false;

for (const page of appJson.pages) {
  for (const ext of requiredExts) {
    const file = path.join(root, `${page}.${ext}`);
    if (!fs.existsSync(file)) {
      console.error(`missing ${page}.${ext}`);
      failed = true;
    }
  }
}

const registered = new Set(appJson.pages.map((p) => p.replace(/\\/g, '/')));
const pagesDir = path.join(root, 'pages');
if (fs.existsSync(pagesDir)) {
  for (const dirent of fs.readdirSync(pagesDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const name = dirent.name;
    const expected = `pages/${name}/${name}`;
    const hasJs = fs.existsSync(path.join(pagesDir, name, `${name}.js`));
    if (hasJs && !registered.has(expected)) {
      console.error(`unregistered page directory: pages/${name} (not in app.json)`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('all page files exist and are registered');
