// ==============================================================================
// Sonora — Vercel Serverless Function for YouTube API Endpoints
// ==============================================================================
import { createYouTubeMiddleware } from '../server/middleware.js';

const middleware = createYouTubeMiddleware();

export default function handler(req, res) {
  return middleware(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  });
}
