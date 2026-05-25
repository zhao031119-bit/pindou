import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path, { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('../', import.meta.url)));
const servingDist = process.argv[2] === 'dist';
const publicDir = servingDist ? resolve(rootDir, 'dist') : rootDir;
const port = Number(process.env.PORT || 5173);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function toFilePath(url) {
  const parsed = new URL(url, `http://localhost:${port}`);
  const pathname = decodeURIComponent(parsed.pathname);
  const relativePath = pathname === '/'
    ? (servingDist ? 'index.html' : 'preview/index.html')
    : pathname.slice(1);
  const filePath = resolve(publicDir, relativePath);
  const publicRoot = publicDir.endsWith(path.sep) ? publicDir : publicDir + path.sep;
  if (filePath !== publicDir && !filePath.startsWith(publicRoot)) return null;
  return filePath;
}

const server = createServer(async (request, response) => {
  const filePath = toFilePath(request.url || '/');
  if (!filePath) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream'
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`PinDou preview running at http://localhost:${port}`);
});
