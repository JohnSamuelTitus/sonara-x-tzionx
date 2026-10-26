// ==============================================================================
// Sonora — Standalone Node.js Backend Server
// ==============================================================================
// Can be run with: node server/index.js
// Uses Node built-in http module (zero unnecessary external dependencies)
// ==============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createYouTubeMiddleware } from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const PORT = process.env.PORT || 5173;
const youtubeMiddleware = createYouTubeMiddleware();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // 1. Check API routes
  if (req.url && req.url.startsWith('/api/youtube')) {
    return youtubeMiddleware(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    });
  }

  // 2. Static file serving (if built dist directory exists)
  if (fs.existsSync(distDir)) {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html'); // SPA fallback
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // 3. Fallback when running without dist in dev
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>Sonora API Server Running</h1><p>Vite dev server handles frontend assets.</p>');
});

server.listen(PORT, () => {
  console.log(`[Sonora Server] Backend listening on http://localhost:${PORT}`);
});
