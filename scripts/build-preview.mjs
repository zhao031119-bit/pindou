import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('../', import.meta.url)));
const distDir = resolve(rootDir, 'dist');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await cp(resolve(rootDir, 'preview'), distDir, { recursive: true });
await mkdir(resolve(distDir, 'miniprogram'), { recursive: true });
await cp(resolve(rootDir, 'miniprogram/assets'), resolve(distDir, 'miniprogram/assets'), {
  recursive: true
});

console.log(`Preview build written to ${distDir}`);
