import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname, resolve } from 'path';

const OUTPUT_DIR = resolve(process.env.OUTPUT_DIR || './output');
const FILE_SERVER_PORT = parseInt(process.env.FILE_SERVER_PORT || '3001');

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.html': 'text/html',
  '.md': 'text/markdown',
  '.json': 'application/json',
};

export function startFileServer(): void {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method Not Allowed');
      return;
    }

    const url = new URL(req.url || '/', `http://localhost:${FILE_SERVER_PORT}`);
    const pathname = url.pathname;

    // Health check
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Serve files from /files/*
    if (pathname.startsWith('/files/')) {
      const relativePath = pathname.slice(7); // Remove '/files/'
      const filePath = resolve(OUTPUT_DIR, relativePath);

      // Security: prevent path traversal
      if (!filePath.startsWith(OUTPUT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      try {
        // Check if file exists
        const fileStat = await stat(filePath);

        if (!fileStat.isFile()) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }

        // Read and serve file
        const content = await readFile(filePath);
        const ext = extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': content.length,
          'Cache-Control': 'public, max-age=86400', // 24 hours
        });
        res.end(content);

      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          console.error('[FileServer] Error:', error);
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      }
      return;
    }

    // Default: 404
    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(FILE_SERVER_PORT, () => {
    console.log(`[FileServer] Listening on port ${FILE_SERVER_PORT}`);
    console.log(`[FileServer] Serving files from ${OUTPUT_DIR}`);
  });

  server.on('error', (error) => {
    console.error('[FileServer] Error:', error);
  });
}
