import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  decodeHtmlEntities,
  BaseSearchProvider,
  PipedSearchProvider,
  InvidiousSearchProvider,
  OfficialYouTubeApiProvider,
  CompositeSearchProvider,
} from '../../server/searchProviders.js';
import {
  sanitizeQuery,
  searchYouTube,
  getCategoryTracks,
  getServiceStatus,
  clearCache,
  getCacheStats,
  CATEGORY_DEFINITIONS,
} from '../../server/youtubeService.js';

describe('Search Providers & No-Key Discovery Pipeline', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  describe('decodeHtmlEntities', () => {
    it('decodes XML and HTML entities correctly', () => {
      expect(decodeHtmlEntities('Rock &amp; Roll')).toBe('Rock & Roll');
      expect(decodeHtmlEntities('&lt;tag&gt;')).toBe('<tag>');
      expect(decodeHtmlEntities('&quot;Hello&quot;')).toBe('"Hello"');
      expect(decodeHtmlEntities('Don&#39;t Stop')).toBe("Don't Stop");
      expect(decodeHtmlEntities('It&#x27;s Ok')).toBe("It's Ok");
      expect(decodeHtmlEntities('A &#38; B')).toBe('A & B');
      expect(decodeHtmlEntities('')).toBe('');
      expect(decodeHtmlEntities(null as any)).toBe('');
    });
  });

  describe('BaseSearchProvider', () => {
    it('throws error when search() is not overridden', async () => {
      const provider = new BaseSearchProvider('Base');
      expect(provider.name).toBe('Base');
      expect(provider.isAvailable()).toBe(true);
      await expect(provider.search('test')).rejects.toThrow('search() not implemented in Base');
    });
  });

  describe('PipedSearchProvider', () => {
    it('successfully parses Piped JSON response and maps to Sonora Track model', async () => {
      const mockPipedResponse = {
        items: [
          {
            url: '/watch?v=BddP6PYo2gs',
            type: 'stream',
            title: 'Kesariya &amp; Brahmastra',
            uploaderName: 'Sony Music &amp; Entertainment',
            duration: 173,
            thumbnail: 'https://proxy.piped.private.coffee/vi/BddP6PYo2gs/hq720.jpg',
          },
          {
            url: '/watch?v=KUN5Uf9mObQ',
            type: 'stream',
            title: 'Arabic Kuthu',
            uploaderName: 'Sun TV',
            duration: 280,
          },
        ],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPipedResponse,
      });
      global.fetch = mockFetch;

      const provider = new PipedSearchProvider(['https://api.piped.test'], 3000);
      const result = await provider.search('Kesariya', 5, 'Bollywood');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.tracks).toHaveLength(2);
      expect(result.provider).toBe('Piped');

      const track1 = result.tracks[0];
      expect(track1.id).toBe('yt-BddP6PYo2gs');
      expect(track1.provider).toBe('youtube');
      expect(track1.videoId).toBe('BddP6PYo2gs');
      expect(track1.title).toBe('Kesariya & Brahmastra'); // HTML entity decoded
      expect(track1.artist).toBe('Sony Music & Entertainment'); // HTML entity decoded
      expect(track1.duration).toBe(173);
      expect(track1.coverUrl).toBe('https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg');
      expect(track1.genre).toBe('Bollywood');
      expect(track1.isLocal).toBe(false);
    });

    it('fails over to secondary mirror when first mirror returns 500 error', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                url: '/watch?v=79IEesucPo8',
                type: 'stream',
                title: 'Naatu Naatu',
                uploaderName: 'Lahari Music',
                duration: 215,
              },
            ],
          }),
        });
      global.fetch = mockFetch;

      const provider = new PipedSearchProvider(
        ['https://failing-mirror.test', 'https://working-mirror.test'],
        3000
      );
      const result = await provider.search('Naatu Naatu', 5);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0].videoId).toBe('79IEesucPo8');
    });

    it('throws when all mirrors fail', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
      global.fetch = mockFetch;

      const provider = new PipedSearchProvider(['https://mirror1.test', 'https://mirror2.test'], 1000);
      await expect(provider.search('test')).rejects.toThrow();
    });
  });

  describe('InvidiousSearchProvider', () => {
    it('successfully parses Invidious JSON array response and maps to Sonora Track model', async () => {
      const mockInvidiousResponse = [
        {
          type: 'video',
          videoId: 'mH_LFkWxpI0',
          title: 'Lover &#8211; Diljit Dosanjh',
          author: 'Diljit Dosanjh',
          lengthSeconds: 195,
        },
      ];

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockInvidiousResponse,
      });
      global.fetch = mockFetch;

      const provider = new InvidiousSearchProvider(['https://yt.invidious.test'], 3000);
      const result = await provider.search('Diljit Lover', 5, 'Punjabi');

      expect(result.tracks).toHaveLength(1);
      expect(result.provider).toBe('Invidious');

      const track = result.tracks[0];
      expect(track.id).toBe('yt-mH_LFkWxpI0');
      expect(track.videoId).toBe('mH_LFkWxpI0');
      expect(track.artist).toBe('Diljit Dosanjh');
      expect(track.duration).toBe(195);
      expect(track.coverUrl).toBe('https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg');
    });

    it('fails over to secondary mirror when primary times out', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [
            {
              videoId: 'vid123',
              title: 'Fallback Song',
              author: 'Artist',
              lengthSeconds: 120,
            },
          ],
        });
      global.fetch = mockFetch;

      const provider = new InvidiousSearchProvider(
        ['https://timeout.test', 'https://backup.test'],
        1000
      );
      const result = await provider.search('query', 5);

      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0].videoId).toBe('vid123');
    });
  });

  describe('OfficialYouTubeApiProvider', () => {
    it('isAvailable returns false if key is missing or dummy placeholder', () => {
      const p1 = new OfficialYouTubeApiProvider(() => '');
      expect(p1.isAvailable()).toBe(false);

      const p2 = new OfficialYouTubeApiProvider(() => 'your_youtube_data_api_v3_key_here');
      expect(p2.isAvailable()).toBe(false);

      const p3 = new OfficialYouTubeApiProvider(() => 'AIzaSyAValidRealKey12345');
      expect(p3.isAvailable()).toBe(true);
    });

    it('throws error if search is invoked when key is not configured', async () => {
      const provider = new OfficialYouTubeApiProvider(() => '');
      await expect(provider.search('test')).rejects.toThrow('YouTube Data API key is not configured');
    });
  });

  describe('CompositeSearchProvider', () => {
    it('uses primary provider (Piped) and falls back to Invidious if Piped fails', async () => {
      const failingPiped = new BaseSearchProvider('Piped');
      failingPiped.search = vi.fn().mockRejectedValue(new Error('Piped rate limited'));

      const workingInvidious = new BaseSearchProvider('Invidious');
      workingInvidious.search = vi.fn().mockResolvedValue({
        tracks: [
          {
            id: 'yt-invidious-1',
            provider: 'youtube',
            videoId: 'invidious-1',
            title: 'Invidious Track',
            artist: 'Invidious Artist',
            duration: 200,
            coverUrl: 'https://i.ytimg.com/vi/invidious-1/hqdefault.jpg',
            genre: 'Music',
            isLocal: false,
          },
        ],
        totalResults: 1,
        provider: 'Invidious',
      });

      const composite = new CompositeSearchProvider([failingPiped, workingInvidious]);
      const result = await composite.search('query', 5);

      expect(failingPiped.search).toHaveBeenCalled();
      expect(workingInvidious.search).toHaveBeenCalled();
      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0].videoId).toBe('invidious-1');
      expect(result.activeProvider).toBe('Invidious');
      expect(result.mode).toBe('public-no-key');
    });

    it('throws structured error if all providers in chain fail', async () => {
      const failing1 = new BaseSearchProvider('P1');
      failing1.search = vi.fn().mockRejectedValue(new Error('Network error'));

      const failing2 = new BaseSearchProvider('P2');
      failing2.search = vi.fn().mockRejectedValue(new Error('Service 503'));

      const composite = new CompositeSearchProvider([failing1, failing2]);
      await expect(composite.search('query', 5)).rejects.toThrow();
    });
  });

  describe('Service Layer: youtubeService.js', () => {
    it('sanitizes input query strings and limits length', () => {
      expect(sanitizeQuery('  Kesariya   ')).toBe('Kesariya');
      expect(sanitizeQuery('')).toBe('');
      expect(sanitizeQuery(null as any)).toBe('');
      const longQuery = 'a'.repeat(200);
      expect(sanitizeQuery(longQuery)).toHaveLength(100);
    });

    it('returns empty result cleanly for blank queries', async () => {
      const res = await searchYouTube('    ');
      expect(res.tracks).toEqual([]);
      expect(res.totalResults).toBe(0);
      expect(res.configured).toBe(true);
    });

    it('caches query results and honors in-memory cache', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            {
              url: '/watch?v=cached123',
              title: 'Cached Song',
              uploaderName: 'Cached Artist',
              duration: 180,
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      const r1 = await searchYouTube('unique-cache-test-query', 5);
      expect(r1.tracks).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(getCacheStats().entries).toBeGreaterThanOrEqual(1);

      // Second identical search must hit cache and NOT invoke fetch again
      const r2 = await searchYouTube('unique-cache-test-query', 5);
      expect(r2.tracks).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1!
    });

    it('maps all 13 discovery categories properly', async () => {
      expect(CATEGORY_DEFINITIONS).toHaveLength(13);
      const catIds = CATEGORY_DEFINITIONS.map((c) => c.id);
      expect(catIds).toContain('trending');
      expect(catIds).toContain('bollywood');
      expect(catIds).toContain('south-indian');
      expect(catIds).toContain('punjabi');
      expect(catIds).toContain('chill');

      const status = getServiceStatus();
      expect(status.configured).toBe(true);
      expect(status.availableCategories).toHaveLength(13);
    });

    it('throws error when requesting a nonexistent category', async () => {
      await expect(getCategoryTracks('non-existent-cat')).rejects.toThrow(
        'Category "non-existent-cat" not found.'
      );
    });
  });
});
