// ==============================================================================
// Sonora — Music Discovery & Search Service
// ==============================================================================
// Connects Sonora to genuine YouTube video discovery without requiring a
// YouTube Data API key. Uses pluggable providers (Piped & Invidious public
// endpoints with automatic mirror failover), and supports the official API key
// when present in .env.
// Does NOT scrape private endpoints, does NOT bypass bot protections, and
// does NOT extract audio streams. All playback occurs via YouTube's official
// embedded IFrame Player.
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import {
  decodeHtmlEntities,
  PipedSearchProvider,
  InvidiousSearchProvider,
  OfficialYouTubeApiProvider,
  CompositeSearchProvider,
} from './searchProviders.js';

// Read .env file directly if process.env.YOUTUBE_API_KEY is not already populated
function loadEnv() {
  if (process.env.YOUTUBE_API_KEY) return;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Ignore .env read error
  }
}

loadEnv();

// Query cache with 15-minute TTL to optimize external requests and respect rate limits
const queryCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

export const CATEGORY_DEFINITIONS = [
  { id: 'trending', title: 'Trending Now', query: 'trending music songs official video', subtitle: 'Hottest music videos trending right now' },
  { id: 'bollywood', title: 'Top Bollywood Hits', query: 'top bollywood songs hits official music video', subtitle: 'Popular Hindi cinema music and chartbusters' },
  { id: 'south-indian', title: 'Top South Indian Hits', query: 'top south indian hits songs official video', subtitle: 'Mega hits from Tamil, Telugu, Malayalam & Kannada' },
  { id: 'hindi', title: 'Popular Hindi Songs', query: 'popular hindi songs hits official video', subtitle: 'Modern Hindi melodies and rhythms' },
  { id: 'tamil', title: 'Popular Tamil Songs', query: 'popular tamil songs hits official music video', subtitle: 'Kollywood melodies and upbeat tracks' },
  { id: 'telugu', title: 'Popular Telugu Songs', query: 'popular telugu songs hits official music video', subtitle: 'Tollywood anthems and soulful tunes' },
  { id: 'malayalam', title: 'Popular Malayalam Songs', query: 'popular malayalam songs hits official music video', subtitle: 'Soulful sounds from God\'s Own Country' },
  { id: 'kannada', title: 'Popular Kannada Songs', query: 'popular kannada songs hits official music video', subtitle: 'Sandalwood beats and melodies' },
  { id: 'punjabi', title: 'Punjabi Hits', query: 'punjabi hits songs official music video', subtitle: 'High-energy bhangra and urban Punjabi tracks' },
  { id: 'romantic', title: 'Romantic Vibes', query: 'romantic love songs official music video', subtitle: 'Heartfelt ballads and love anthems' },
  { id: 'party', title: 'Party & Dance', query: 'party dance songs club hits official music video', subtitle: 'High-octane club beats to get you moving' },
  { id: 'chill', title: 'Chill & Relax', query: 'chill relax acoustic lo-fi songs official', subtitle: 'Mellow melodies and calming tones for focus' },
  { id: 'latest', title: 'Latest Music Discoveries', query: 'latest songs discoveries official music video', subtitle: 'Fresh releases and breakthrough artists' },
];

export { decodeHtmlEntities };

/**
 * Checks if YouTube API key is available
 */
export function getApiKey() {
  loadEnv();
  return process.env.YOUTUBE_API_KEY || '';
}

export function isOfficialApiKeyConfigured() {
  const key = getApiKey();
  return Boolean(key && key.trim() !== '' && !key.includes('your_youtube_data_api_v3_key_here'));
}

export function isYouTubeConfigured() {
  // Sonora is always configured for YouTube discovery via our public no-key search providers
  return true;
}

// Instantiate search providers
export const officialProvider = new OfficialYouTubeApiProvider(getApiKey);
export const pipedProvider = new PipedSearchProvider([
  'https://api.piped.private.coffee',
  'https://pipedapi.ducks.party',
]);
export const invidiousProvider = new InvidiousSearchProvider([
  'https://yt.chocolatemoo53.com',
  'https://yewtu.be',
  'https://invidious.projectsegfau.lt',
]);

// Composite provider: official API first if key configured, then Piped with failover to Invidious
export const compositeSearchProvider = new CompositeSearchProvider([
  officialProvider,
  pipedProvider,
  invidiousProvider,
]);

/**
 * Validates and sanitizes a search query string
 */
export function sanitizeQuery(query) {
  if (typeof query !== 'string') return '';
  return query.trim().slice(0, 100);
}

/**
 * Executes a search query via the composite search provider
 */
export async function searchYouTube(query, maxResults = 12, genreLabel = 'Music') {
  const cleanQuery = sanitizeQuery(query);
  if (!cleanQuery) {
    return { tracks: [], totalResults: 0, configured: true, mode: compositeSearchProvider.getMode() };
  }

  const limit = Math.max(1, Math.min(Number(maxResults) || 12, 25));
  const cacheKey = `search:${cleanQuery.toLowerCase()}:${limit}`;

  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const result = await compositeSearchProvider.search(cleanQuery, limit, genreLabel);

  const finalResult = {
    tracks: result.tracks,
    totalResults: result.totalResults,
    configured: true,
    mode: result.mode,
    activeProvider: result.activeProvider,
  };

  queryCache.set(cacheKey, { data: finalResult, timestamp: Date.now() });
  return finalResult;
}

/**
 * Fetches tracks for a predefined music category
 */
export async function getCategoryTracks(categoryId, maxResults = 12) {
  const cat = CATEGORY_DEFINITIONS.find((c) => c.id === categoryId);
  if (!cat) {
    throw new Error(`Category "${categoryId}" not found.`);
  }

  return searchYouTube(cat.query, maxResults, cat.title);
}

export function getServiceStatus() {
  return {
    configured: true,
    mode: compositeSearchProvider.getMode(),
    activeProvider: compositeSearchProvider.getActiveProviderName(),
    isOfficialKeyPresent: isOfficialApiKeyConfigured(),
    cacheEntries: queryCache.size,
    availableCategories: CATEGORY_DEFINITIONS.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
    })),
  };
}

export function clearCache() {
  queryCache.clear();
}

export function getCacheStats() {
  return {
    entries: queryCache.size,
  };
}
