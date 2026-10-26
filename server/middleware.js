// ==============================================================================
// Sonora — Server Middleware for YouTube API Endpoints
// ==============================================================================
// Mounts HTTP routes at /api/youtube/* for Vite dev server & production server.
// Ensures credentials never leak to clients.
// ==============================================================================

import {
  searchYouTube,
  getCategoryTracks,
  getServiceStatus,
  CATEGORY_DEFINITIONS,
  isYouTubeConfigured,
} from './youtubeService.js';

export function createYouTubeMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (!pathname.startsWith('/api/youtube')) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
      // 1. Status Check
      if (pathname === '/api/youtube/status') {
        const status = getServiceStatus();
        res.writeHead(200);
        res.end(JSON.stringify(status));
        return;
      }

      // 2. Categories List
      if (pathname === '/api/youtube/categories') {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            categories: CATEGORY_DEFINITIONS,
            configured: isYouTubeConfigured(),
          })
        );
        return;
      }

      // 3. Search Endpoint
      if (pathname === '/api/youtube/search') {
        const query = url.searchParams.get('q') || '';
        const maxResults = parseInt(url.searchParams.get('maxResults') || '12', 10);

        if (!query.trim()) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Search query parameter "q" is required.', tracks: [] }));
          return;
        }

        const result = await searchYouTube(query, maxResults);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // 4. Category Tracks Endpoint
      if (pathname === '/api/youtube/category') {
        const categoryId = url.searchParams.get('category') || url.searchParams.get('id') || '';
        const maxResults = parseInt(url.searchParams.get('maxResults') || '12', 10);

        if (!categoryId.trim()) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Category parameter is required.', tracks: [] }));
          return;
        }

        const result = await getCategoryTracks(categoryId, maxResults);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // Unmatched /api/youtube route
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Unknown YouTube API endpoint' }));
    } catch (err) {
      let code = 'INTERNAL_ERROR';
      let message = 'An unexpected server error occurred';

      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          code = parsed.code || code;
          message = parsed.message || message;
        } catch {
          message = err.message;
        }
      }

      let statusCode = 500;
      if (code.includes('QUOTA') || code.includes('RATE_LIMITED')) {
        statusCode = 429;
      } else if (code.includes('TIMEOUT')) {
        statusCode = 504;
      } else if (code.includes('UNAVAILABLE')) {
        statusCode = 503;
      }

      res.writeHead(statusCode);
      res.end(JSON.stringify({ error: message, code, tracks: [], configured: true }));
    }
  };
}
