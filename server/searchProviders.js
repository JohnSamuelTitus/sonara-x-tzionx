// ==============================================================================
// Sonora — Replaceable Search Provider Interface & Implementations
// ==============================================================================
// Architecture supporting pluggable search providers without vendor lock-in.
// Provides:
// 1. PipedSearchProvider (Public documented REST API with mirror failover)
// 2. InvidiousSearchProvider (Public documented REST API fallback)
// 3. OfficialYouTubeApiProvider (Google Data API v3 when key configured)
// 4. CompositeSearchProvider (Smart orchestrator with fallback & resilience)
// ==============================================================================

/**
 * Decodes standard HTML entities commonly returned in titles
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

/**
 * Base Search Provider Interface
 * Every search provider must implement:
 * - name: string
 * - search(query: string, limit: number, genreLabel?: string): Promise<{ tracks: any[]; totalResults: number }>
 * - isAvailable(): Promise<boolean> | boolean
 */
export class BaseSearchProvider {
  constructor(name) {
    this.name = name;
  }

  async search(_query, _limit = 12, _genreLabel = 'Music') {
    throw new Error(`search() not implemented in ${this.name}`);
  }

  isAvailable() {
    return true;
  }
}

/**
 * 1. Piped Search Provider
 * Documented public REST endpoint: /search?q={query}&filter=videos
 * Does not scrape HTML, bypass protections, or violate YouTube streaming TOS.
 * Only retrieves public video metadata and returns video IDs for official embedded playback.
 */
export class PipedSearchProvider extends BaseSearchProvider {
  constructor(mirrors = [
    'https://api.piped.private.coffee',
    'https://pipedapi.ducks.party',
  ], timeoutMs = 6000) {
    super('Piped');
    this.mirrors = mirrors;
    this.timeoutMs = timeoutMs;
  }

  async search(query, limit = 12, genreLabel = 'Music') {
    let lastError = null;

    for (const mirror of this.mirrors) {
      try {
        const searchUrl = new URL(`${mirror}/search`);
        searchUrl.searchParams.set('q', query);
        searchUrl.searchParams.set('filter', 'videos');

        const response = await fetch(searchUrl.toString(), {
          signal: AbortSignal.timeout(this.timeoutMs),
          headers: {
            Accept: 'application/json',
            'User-Agent': 'SonoraMusicDiscovery/1.0',
          },
        });

        if (response.status === 429) {
          lastError = new Error(JSON.stringify({ code: 'RATE_LIMITED', message: 'Public search rate limited. Trying alternate provider...' }));
          continue;
        }

        if (!response.ok) {
          lastError = new Error(`Mirror ${mirror} responded with HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];

        const tracks = items
          .filter((item) => {
            const url = item.url || '';
            return url.includes('v=') || (item.type === 'stream' && url.length > 5);
          })
          .slice(0, limit)
          .map((item) => {
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
              : (item.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80');

            return {
              id: `yt-${videoId}`,
              provider: 'youtube',
              videoId,
              title,
              artist,
              album: 'YouTube Music',
              duration: typeof item.duration === 'number' ? item.duration : 0,
              coverUrl,
              genre: genreLabel,
              licenseInfo: 'YouTube Standard License / YouTube IFrame Player',
              isLocal: false,
            };
          });

        return {
          tracks,
          totalResults: tracks.length,
          provider: this.name,
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('All Piped mirrors failed');
  }
}

/**
 * 2. Invidious Search Provider
 * Documented public REST endpoint: /api/v1/search?q={query}&type=video
 * Fallback provider when Piped is unavailable.
 */
export class InvidiousSearchProvider extends BaseSearchProvider {
  constructor(mirrors = [
    'https://yt.chocolatemoo53.com',
    'https://yewtu.be',
    'https://invidious.projectsegfau.lt',
  ], timeoutMs = 6000) {
    super('Invidious');
    this.mirrors = mirrors;
    this.timeoutMs = timeoutMs;
  }

  async search(query, limit = 12, genreLabel = 'Music') {
    let lastError = null;

    for (const mirror of this.mirrors) {
      try {
        const searchUrl = new URL(`${mirror}/api/v1/search`);
        searchUrl.searchParams.set('q', query);
        searchUrl.searchParams.set('type', 'video');

        const response = await fetch(searchUrl.toString(), {
          signal: AbortSignal.timeout(this.timeoutMs),
          headers: {
            Accept: 'application/json',
            'User-Agent': 'SonoraMusicDiscovery/1.0',
          },
        });

        if (response.status === 429) {
          lastError = new Error(JSON.stringify({ code: 'RATE_LIMITED', message: 'Invidious rate limit encountered' }));
          continue;
        }

        if (!response.ok) {
          lastError = new Error(`Mirror ${mirror} responded with HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.items || []);

        const tracks = items
          .filter((item) => Boolean(item.videoId || (item.type === 'video' && item.videoId)))
          .slice(0, limit)
          .map((item) => {
            const videoId = item.videoId;
            const title = decodeHtmlEntities(item.title || 'Untitled Track');
            const artist = decodeHtmlEntities(item.author || 'Unknown Artist');
            const coverUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            return {
              id: `yt-${videoId}`,
              provider: 'youtube',
              videoId,
              title,
              artist,
              album: 'YouTube Music',
              duration: typeof item.lengthSeconds === 'number' ? item.lengthSeconds : 0,
              coverUrl,
              genre: genreLabel,
              licenseInfo: 'YouTube Standard License / YouTube IFrame Player',
              isLocal: false,
            };
          });

        return {
          tracks,
          totalResults: tracks.length,
          provider: this.name,
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('All Invidious mirrors failed');
  }
}

/**
 * 3. Official YouTube Data API Provider
 * Used when a valid YOUTUBE_API_KEY is supplied.
 */
export class OfficialYouTubeApiProvider extends BaseSearchProvider {
  constructor(getApiKeyFn) {
    super('OfficialYouTubeDataAPI');
    this.getApiKey = getApiKeyFn;
  }

  isAvailable() {
    const key = this.getApiKey();
    return Boolean(key && key.trim() !== '' && !key.includes('your_youtube_data_api_v3_key_here'));
  }

  async search(query, limit = 12, genreLabel = 'Music') {
    const apiKey = this.getApiKey();
    if (!this.isAvailable()) {
      throw new Error('YouTube Data API key is not configured');
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', String(limit));
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoCategoryId', '10');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody?.error?.message || `YouTube API returned status ${response.status}`;
      const code = response.status === 403 ? 'QUOTA_EXCEEDED_OR_FORBIDDEN' : 'API_ERROR';
      throw new Error(JSON.stringify({ code, message }));
    }

    const data = await response.json();
    const tracks = (data.items || [])
      .filter((item) => item.id && item.id.videoId)
      .map((item) => {
        const videoId = item.id.videoId;
        const snippet = item.snippet || {};
        const title = decodeHtmlEntities(snippet.title || 'Untitled Track');
        const artist = decodeHtmlEntities(snippet.channelTitle || 'Unknown Artist');
        const coverUrl =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        return {
          id: `yt-${videoId}`,
          provider: 'youtube',
          videoId,
          title,
          artist,
          album: 'YouTube Music',
          duration: 0,
          coverUrl,
          genre: genreLabel,
          licenseInfo: 'YouTube Standard License / YouTube IFrame Player',
          isLocal: false,
        };
      });

    return {
      tracks,
      totalResults: data.pageInfo?.totalResults || tracks.length,
      provider: this.name,
    };
  }
}

/**
 * 4. Composite Search Provider
 * Orchestrates providers with graceful fallback and resilience.
 * - If Official API key is configured, uses Official API.
 * - Otherwise (or on quota error), falls back to Piped.
 * - If Piped fails, falls back to Invidious.
 */
export class CompositeSearchProvider extends BaseSearchProvider {
  constructor(providers) {
    super('Composite');
    this.providers = providers;
    this.activeProviderName = 'Piped';
  }

  getMode() {
    const official = this.providers.find((p) => p instanceof OfficialYouTubeApiProvider);
    if (official && official.isAvailable()) {
      return 'official-api';
    }
    return 'public-no-key';
  }

  getActiveProviderName() {
    return this.activeProviderName;
  }

  async search(query, limit = 12, genreLabel = 'Music') {
    const errors = [];

    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        continue;
      }

      try {
        const result = await provider.search(query, limit, genreLabel);
        this.activeProviderName = provider.name;
        return {
          ...result,
          mode: this.getMode(),
          activeProvider: provider.name,
        };
      } catch (err) {
        errors.push({ provider: provider.name, error: err instanceof Error ? err.message : String(err) });
      }
    }

    // All available providers failed
    const hasRateLimit = errors.some((e) => e.error.includes('RATE_LIMITED') || e.error.includes('QUOTA'));
    const code = hasRateLimit ? 'RATE_LIMITED' : 'PROVIDER_UNAVAILABLE';
    const message = hasRateLimit
      ? 'Search providers are currently rate limited. Please try again in a few moments.'
      : 'All public search providers are temporarily unreachable. Please check your internet connection.';

    throw new Error(JSON.stringify({ code, message, details: errors }));
  }
}
