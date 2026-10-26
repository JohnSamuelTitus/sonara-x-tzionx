import { describe, it, expect, beforeEach } from 'vitest';
import {
  decodeHtmlEntities,
  CATEGORY_DEFINITIONS,
  clearCache,
  getCacheStats,
} from '../../server/youtubeService.js';

describe('YouTube Backend Service & Data Mapping', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('decodeHtmlEntities', () => {
    it('correctly decodes standard HTML entities in YouTube titles', () => {
      const input = 'Kesariya &amp; Rasiya &quot;Official Video&quot; &#39;Brahmastra&#39; &lt;Audio&gt;';
      const expected = 'Kesariya & Rasiya "Official Video" \'Brahmastra\' <Audio>';
      expect(decodeHtmlEntities(input)).toBe(expected);
    });

    it('handles numeric entities and unescaped strings safely', () => {
      expect(decodeHtmlEntities('Dil &amp; Dhadkan &#39;Love&#39;')).toBe("Dil & Dhadkan 'Love'");
      expect(decodeHtmlEntities('Simple Song Title')).toBe('Simple Song Title');
      expect(decodeHtmlEntities('')).toBe('');
      expect(decodeHtmlEntities(null as any)).toBe('');
    });
  });

  describe('Category Definitions', () => {
    it('contains all 13 required music discovery categories', () => {
      expect(CATEGORY_DEFINITIONS).toHaveLength(13);

      const expectedIds = [
        'trending',
        'bollywood',
        'south-indian',
        'hindi',
        'tamil',
        'telugu',
        'malayalam',
        'kannada',
        'punjabi',
        'romantic',
        'party',
        'chill',
        'latest',
      ];

      const ids = (CATEGORY_DEFINITIONS as any[]).map((c: any) => c.id);
      expect(ids).toEqual(expectedIds);
    });

    it('each category definition has a valid title, search query, and subtitle', () => {
      (CATEGORY_DEFINITIONS as any[]).forEach((cat: any) => {
        expect(cat.id).toBeTruthy();
        expect(cat.title).toBeTruthy();
        expect(cat.query).toBeTruthy();
        expect(cat.subtitle).toBeTruthy();
        expect(typeof cat.id).toBe('string');
        expect(typeof cat.title).toBe('string');
        expect(typeof cat.query).toBe('string');
      });
    });
  });

  describe('Cache Management', () => {
    it('initializes with empty cache and clears correctly', () => {
      expect(getCacheStats().entries).toBe(0);
      clearCache();
      expect(getCacheStats().entries).toBe(0);
    });
  });
});
