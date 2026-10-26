// ==============================================================================
// Sonora — Frontend YouTube API Client with Resilient Client-Side Fallback
// ==============================================================================
// 1. Attempts requests to Sonora's backend /api/youtube/* endpoints.
// 2. Automatically falls back to public CORS mirrors (Piped & Invidious) if the
//    backend is unavailable (such as static serverless deployments on Vercel).
// ==============================================================================

import type { Track, MusicCategory } from '../types/music';
import { CATEGORY_DEFINITIONS } from './categoryConstants';

export interface YouTubeSearchResult {
  tracks: Track[];
  totalResults: number;
  configured: boolean;
  message?: string;
  error?: string;
  code?: string;
}

export interface YouTubeStatusResult {
  configured: boolean;
  mode?: 'public-no-key' | 'official-api';
  activeProvider?: string;
  isOfficialKeyPresent?: boolean;
  cacheEntries?: number;
  availableCategories?: Array<{ id: string; title: string; subtitle: string }>;
}

const PIPED_CLIENT_MIRRORS = [
  'https://api.piped.private.coffee',
  'https://pipedapi.ducks.party',
  'https://pipedapi.drgns.space',
];

const INVIDIOUS_CLIENT_MIRRORS = [
  'https://yt.chocolatemoo53.com',
  'https://yewtu.be',
  'https://invidious.projectsegfau.lt',
];

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

async function searchClientSidePiped(query: string, maxResults = 12): Promise<Track[] | null> {
  for (const mirror of PIPED_CLIENT_MIRRORS) {
    try {
      const url = `${mirror}/search?q=${encodeURIComponent(query)}&filter=videos`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      const tracks: Track[] = items
        .filter((item: any) => {
          const u = item?.url || '';
          return u.includes('v=') || (item?.type === 'stream' && u.length > 5);
        })
        .slice(0, maxResults)
        .map((item: any) => {
          let videoId = '';
          if (item.url && item.url.includes('v=')) {
            videoId = item.url.split('v=')[1]?.split('&')[0] || '';
          } else if (item.url) {
            videoId = item.url.replace('/watch?v=', '').replace('/', '');
          }

          const title = decodeHtmlEntities(item.title || 'Untitled Track');
          const artist = decodeHtmlEntities(item.uploaderName || 'Unknown Artist');
          const coverUrl = videoId
            ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            : item.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80';

          return {
            id: `yt-${videoId}`,
            provider: 'youtube' as const,
            videoId,
            title,
            artist,
            album: 'YouTube Cinema',
            duration: typeof item.duration === 'number' ? item.duration : 0,
            coverUrl,
            genre: 'Cinema Stream',
            licenseInfo: 'YouTube Standard License / Official IFrame Player',
            isLocal: false,
          };
        });

      if (tracks.length > 0) return tracks;
    } catch {
      // Continue to next mirror
    }
  }
  return null;
}

async function searchClientSideInvidious(query: string, maxResults = 12): Promise<Track[] | null> {
  for (const mirror of INVIDIOUS_CLIENT_MIRRORS) {
    try {
      const url = `${mirror}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.items || [];
      const tracks: Track[] = items
        .filter((item: any) => Boolean(item?.videoId))
        .slice(0, maxResults)
        .map((item: any) => {
          const videoId = item.videoId;
          const title = decodeHtmlEntities(item.title || 'Untitled Track');
          const artist = decodeHtmlEntities(item.author || 'Unknown Artist');
          const coverUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          return {
            id: `yt-${videoId}`,
            provider: 'youtube' as const,
            videoId,
            title,
            artist,
            album: 'YouTube Cinema',
            duration: typeof item.lengthSeconds === 'number' ? item.lengthSeconds : 0,
            coverUrl,
            genre: 'Cinema Stream',
            licenseInfo: 'YouTube Standard License / Official IFrame Player',
            isLocal: false,
          };
        });

      if (tracks.length > 0) return tracks;
    } catch {
      // Continue to next mirror
    }
  }
  return null;
}

export async function checkYouTubeStatus(): Promise<YouTubeStatusResult> {
  try {
    const res = await fetch('/api/youtube/status', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend API not reachable (e.g. static host)
  }

  // Fallback: Sonora client-side discovery is always available
  return {
    configured: true,
    mode: 'public-no-key',
    activeProvider: 'Public Piped / Invidious Fallback',
    isOfficialKeyPresent: false,
    availableCategories: CATEGORY_DEFINITIONS.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
    })),
  };
}

export async function fetchCategories(): Promise<{ categories: MusicCategory[]; configured: boolean }> {
  try {
    const res = await fetch('/api/youtube/categories', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to static category list
  }

  return {
    categories: CATEGORY_DEFINITIONS.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      query: c.query,
    })),
    configured: true,
  };
}

export async function searchYouTubeTracks(query: string, maxResults = 12): Promise<YouTubeSearchResult> {
  const clean = query.trim();
  if (!clean) {
    return { tracks: [], totalResults: 0, configured: true };
  }

  // 1. Try server endpoint first
  try {
    const res = await fetch(
      `/api/youtube/search?q=${encodeURIComponent(clean)}&maxResults=${encodeURIComponent(maxResults)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return {
          tracks: data.tracks,
          totalResults: data.totalResults || data.tracks.length,
          configured: true,
          message: data.message,
        };
      }
    }
  } catch {
    // Server fetch failed, try direct client fallback
  }

  // 2. Direct client-side discovery fallback (Piped)
  try {
    const pipedTracks = await searchClientSidePiped(clean, maxResults);
    if (pipedTracks && pipedTracks.length > 0) {
      return {
        tracks: pipedTracks,
        totalResults: pipedTracks.length,
        configured: true,
      };
    }
  } catch {
    // Continue to Invidious
  }

  // 3. Direct client-side discovery fallback (Invidious)
  try {
    const invidiousTracks = await searchClientSideInvidious(clean, maxResults);
    if (invidiousTracks && invidiousTracks.length > 0) {
      return {
        tracks: invidiousTracks,
        totalResults: invidiousTracks.length,
        configured: true,
      };
    }
  } catch {
    // Failed all mirrors
  }

  return {
    tracks: [],
    totalResults: 0,
    configured: true,
    error: 'Live cinema search is momentarily unreachable. Please check your network connection or try another title.',
  };
}

export async function fetchCategoryTracks(categoryId: string, maxResults = 12): Promise<YouTubeSearchResult> {
  // 1. Try server endpoint first
  try {
    const res = await fetch(
      `/api/youtube/category?category=${encodeURIComponent(categoryId)}&maxResults=${encodeURIComponent(maxResults)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return {
          tracks: data.tracks,
          totalResults: data.totalResults || data.tracks.length,
          configured: true,
          message: data.message,
        };
      }
    }
  } catch {
    // Server fetch failed, try client-side search fallback
  }

  // 2. Fallback using category query
  const catDef = CATEGORY_DEFINITIONS.find((c) => c.id === categoryId);
  const query = catDef?.query || `${categoryId} music official video`;
  return searchYouTubeTracks(query, maxResults);
}
