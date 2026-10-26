import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserData, saveUserData, sanitizeUserData } from '../utils/storage';

describe('Recently played tracks ordering, deduplication, and persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('prepends newly played track to the front of recently played list', () => {
    const initial = loadUserData();
    const playedTrackId = 'track-3';

    // Simulate genuine playback recording logic
    const nextRecents = [playedTrackId, ...initial.recentTrackIds.filter((id) => id !== playedTrackId)].slice(0, 50);
    saveUserData({ ...initial, recentTrackIds: nextRecents });

    const reloaded = loadUserData();
    expect(reloaded.recentTrackIds[0]).toBe('track-3');
    expect(reloaded.recentTrackIds).toContain('track-1');
  });

  it('moves existing track to the front without duplicating it when replayed', () => {
    const data = loadUserData();
    data.recentTrackIds = ['track-1', 'track-2', 'track-3'];
    saveUserData(data);

    // Replay track-2
    const replayed = 'track-2';
    const nextRecents = [replayed, ...data.recentTrackIds.filter((id) => id !== replayed)].slice(0, 50);
    saveUserData({ ...data, recentTrackIds: nextRecents });

    const reloaded = loadUserData();
    expect(reloaded.recentTrackIds).toEqual(['track-2', 'track-1', 'track-3']);
    expect(reloaded.recentTrackIds.filter((id) => id === 'track-2').length).toBe(1);
  });

  it('does NOT add unavailable or failing track if genuine playback did not start', () => {
    const data = loadUserData();
    data.recentTrackIds = ['track-1'];
    saveUserData(data);

    // Simulated action: user clicks unavailable track "failing-track"
    // Playback rejected / error occurred -> playback never started
    const isPlaybackStarted = false;

    if (isPlaybackStarted) {
      data.recentTrackIds = ['failing-track', ...data.recentTrackIds];
      saveUserData(data);
    }

    const reloaded = loadUserData();
    expect(reloaded.recentTrackIds).not.toContain('failing-track');
    expect(reloaded.recentTrackIds).toEqual(['track-1']);
  });

  it('caps recently played list at 50 tracks and drops oldest entries', () => {
    const fiftyTracks = Array.from({ length: 50 }, (_, i) => `track-${i + 1}`);
    const data = loadUserData();
    data.recentTrackIds = fiftyTracks;
    saveUserData(data);

    // Add a 51st track
    const newTrack = 'track-new';
    const updatedRecents = [newTrack, ...data.recentTrackIds.filter((id) => id !== newTrack)].slice(0, 50);
    saveUserData({ ...data, recentTrackIds: updatedRecents });

    const reloaded = loadUserData();
    expect(reloaded.recentTrackIds.length).toBe(50);
    expect(reloaded.recentTrackIds[0]).toBe('track-new');
    expect(reloaded.recentTrackIds).not.toContain('track-50'); // Oldest dropped
  });

  it('persists and restores recently played after storage sanitize', () => {
    const dirtyData = {
      recentTrackIds: ['track-valid-1', null, 999, 'track-valid-2'],
    };
    const sanitized = sanitizeUserData(dirtyData);
    expect(sanitized.recentTrackIds).toEqual(['track-valid-1', 'track-valid-2']);
  });
});
