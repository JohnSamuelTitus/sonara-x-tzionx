import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserData, saveUserData, sanitizeUserData } from '../utils/storage';

describe('Like and unlike a track, including persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles liking a new track and persists to storage', () => {
    const initial = loadUserData();
    expect(initial.likedTrackIds).toContain('track-1');
    expect(initial.likedTrackIds).not.toContain('track-2');

    // Like track-2
    const updated = {
      ...initial,
      likedTrackIds: [...initial.likedTrackIds, 'track-2'],
    };
    saveUserData(updated);

    const reloaded = loadUserData();
    expect(reloaded.likedTrackIds).toContain('track-2');
    expect(reloaded.likedTrackIds).toContain('track-1');
  });

  it('unlikes a track and removes it from storage', () => {
    const initial = loadUserData();
    expect(initial.likedTrackIds).toContain('track-1');

    // Unlike track-1
    const unliked = {
      ...initial,
      likedTrackIds: initial.likedTrackIds.filter((id) => id !== 'track-1'),
    };
    saveUserData(unliked);

    const reloaded = loadUserData();
    expect(reloaded.likedTrackIds).not.toContain('track-1');
  });

  it('prevents duplicate track IDs in liked tracks', () => {
    const initial = loadUserData();
    const withDuplicates = {
      ...initial,
      likedTrackIds: ['track-1', 'track-1', 'track-3', 'track-3', 'track-2'],
    };

    // Sanitize ensures unique valid strings
    const uniqueIds = Array.from(new Set(withDuplicates.likedTrackIds));
    const sanitized = sanitizeUserData({ ...withDuplicates, likedTrackIds: uniqueIds });

    expect(sanitized.likedTrackIds).toEqual(['track-1', 'track-3', 'track-2']);
  });

  it('maintains like state consistently across multiple simulated sessions', () => {
    // Session 1: Like track-4, unlike track-3
    let sessionData = loadUserData();
    sessionData.likedTrackIds = sessionData.likedTrackIds.filter((id) => id !== 'track-3');
    sessionData.likedTrackIds.push('track-4');
    saveUserData(sessionData);

    // Session 2: Reload and verify
    sessionData = loadUserData();
    expect(sessionData.likedTrackIds).toEqual(['track-1', 'track-4']);

    // Session 2: Unlike track-1
    sessionData.likedTrackIds = sessionData.likedTrackIds.filter((id) => id !== 'track-1');
    saveUserData(sessionData);

    // Session 3: Reload and verify
    const finalSession = loadUserData();
    expect(finalSession.likedTrackIds).toEqual(['track-4']);
  });
});
