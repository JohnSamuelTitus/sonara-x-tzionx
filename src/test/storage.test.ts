import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeUserData, loadUserData, saveUserData, DEFAULT_USER_DATA } from '../utils/storage';

describe('storage & persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default data when localStorage is empty', () => {
    const data = loadUserData();
    expect(data.likedTrackIds).toEqual(DEFAULT_USER_DATA.likedTrackIds);
    expect(data.volume).toBe(DEFAULT_USER_DATA.volume);
  });

  it('persists and loads valid user data', () => {
    const custom = {
      likedTrackIds: ['track-9', 'track-10'],
      recentTrackIds: ['track-1'],
      customPlaylists: [
        {
          id: 'test-pl-1',
          title: 'Synth Explorations',
          description: 'Test description',
          coverUrl: 'https://example.com/cover.jpg',
          trackIds: ['track-9'],
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      volume: 0.65,
    };

    saveUserData(custom);
    const loaded = loadUserData();

    expect(loaded.likedTrackIds).toEqual(['track-9', 'track-10']);
    expect(loaded.volume).toBe(0.65);
    expect(loaded.customPlaylists).toHaveLength(1);
    expect(loaded.customPlaylists[0].title).toBe('Synth Explorations');
  });

  it('recovers safely from corrupted or malformed data', () => {
    // Write corrupted JSON into localStorage
    localStorage.setItem('sonora_user_data_v1', '{ invalid json syntax !!!');

    const recovered = loadUserData();
    expect(recovered).toEqual(DEFAULT_USER_DATA);
  });

  it('sanitizes partial schema mismatches and invalid volume values', () => {
    const malformed = {
      likedTrackIds: 'not-an-array',
      recentTrackIds: [123, null, 'track-valid'],
      customPlaylists: [
        { invalid: true },
        { id: 'valid-pl', title: 'Valid PL', trackIds: ['track-1', 456] },
      ],
      volume: 4.5, // Exceeds 1.0 bound
    };

    const sanitized = sanitizeUserData(malformed);

    expect(Array.isArray(sanitized.likedTrackIds)).toBe(true);
    expect(sanitized.recentTrackIds).toEqual(['track-valid']);
    expect(sanitized.customPlaylists).toHaveLength(1);
    expect(sanitized.customPlaylists[0].id).toBe('valid-pl');
    expect(sanitized.customPlaylists[0].trackIds).toEqual(['track-1']);
    expect(sanitized.volume).toBe(1.0); // Clamped to 1.0
  });

  it('clamps volume when negative or NaN', () => {
    expect(sanitizeUserData({ volume: -0.5 }).volume).toBe(0);
    expect(sanitizeUserData({ volume: NaN }).volume).toBe(0.8);
  });
});
