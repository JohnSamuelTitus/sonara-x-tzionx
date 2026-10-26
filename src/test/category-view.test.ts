import { describe, it, expect } from 'vitest';
import { CATEGORY_DEFINITIONS } from '../../server/youtubeService.js';

describe('Category View & Discovery Sections', () => {
  it('defines 13 valid discovery categories covering all required regions and moods', () => {
    const requiredSections = [
      'Trending Now',
      'Top Bollywood Hits',
      'Top South Indian Hits',
      'Popular Hindi Songs',
      'Popular Tamil Songs',
      'Popular Telugu Songs',
      'Popular Malayalam Songs',
      'Popular Kannada Songs',
      'Punjabi Hits',
      'Romantic Vibes',
      'Party & Dance',
      'Chill & Relax',
      'Latest Music Discoveries',
    ];

    const categoryTitles = (CATEGORY_DEFINITIONS as any[]).map((c: any) => c.title);
    requiredSections.forEach((sec) => {
      expect(categoryTitles).toContain(sec);
    });
  });

  it('ensures each category has distinct queries and valid IDs', () => {
    const ids = new Set<string>();
    const queries = new Set<string>();

    (CATEGORY_DEFINITIONS as any[]).forEach((cat: any) => {
      expect(ids.has(cat.id)).toBe(false);
      ids.add(cat.id);

      expect(queries.has(cat.query)).toBe(false);
      queries.add(cat.query);
    });

    expect(ids.size).toBe(13);
  });
});
