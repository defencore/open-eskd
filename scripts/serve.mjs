import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.md': 'text/plain; charset=utf-8',
  '.zip': 'application/zip',
};
export function serve(port = Number(process.env.PORT || 8080)) {
  const server = http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405);
        response.end();
        return;
      }
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      );
      const file = path.resolve(
        root,
        '.' + (pathname === '/' ? '/index.html' : pathname),
      );
      if (
        !file.startsWith(root + path.sep) ||
        pathname.split('/').some((segment) => segment.startsWith('.'))
      ) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      const body = await readFile(file);
      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  server.listen(port, '127.0.0.1', () =>
    process.stdout.write(`Open ESKD preview: http://localhost:${port}\n`),
  );
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) serve();
