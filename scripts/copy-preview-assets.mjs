import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('../', import.meta.url)));
const distDir = resolve(rootDir, 'dist');

await mkdir(resolve(distDir, 'miniprogram'), { recursive: true });
await cp(resolve(rootDir, 'miniprogram/assets'), resolve(distDir, 'miniprogram/assets'), {
  recursive: true
});

console.log(`Preview assets copied to ${distDir}`);
