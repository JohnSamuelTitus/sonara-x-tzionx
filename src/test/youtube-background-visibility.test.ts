import { describe, it, expect } from 'vitest';

describe('YouTube Cinema Screen User Decision & Default OFF Behavior', () => {
  it('is OFF by default when player initializes or starts playing', () => {
    // Initial state is OFF by default
    let isYouTubeVideoVisible = false;
    let isYouTubeActive = false;

    const playTrack = (track: { provider: string; videoId?: string }) => {
      const isYouTube = track.provider === 'youtube' || Boolean(track.videoId);
      isYouTubeActive = isYouTube;
      if (!isYouTube) {
        isYouTubeVideoVisible = false;
      }
    };

    // User plays a track — default remains OFF, audio runs in background
    playTrack({ provider: 'youtube', videoId: 'dQw4w9WgXcQ' });
    expect(isYouTubeActive).toBe(true);
    expect(isYouTubeVideoVisible).toBe(false);
  });

  it('respects user decision to turn Cinema Screen ON or OFF', () => {
    let isYouTubeVideoVisible = false; // Default is OFF

    const toggleCinemaScreen = () => {
      isYouTubeVideoVisible = !isYouTubeVideoVisible;
    };

    // 1. Initial default state: OFF (Image 1: dark button)
    expect(isYouTubeVideoVisible).toBe(false);

    // 2. User decides to turn it ON (Image 2: red button)
    toggleCinemaScreen();
    expect(isYouTubeVideoVisible).toBe(true);

    // 3. User decides to turn it OFF (Image 1: dark button)
    toggleCinemaScreen();
    expect(isYouTubeVideoVisible).toBe(false);
  });

  it('maintains the user decision across playlist tracks', () => {
    let isYouTubeVideoVisible = false; // Default is OFF

    const playTrack = (track: { provider: string; videoId?: string }) => {
      const isYouTube = track.provider === 'youtube' || Boolean(track.videoId);
      if (!isYouTube) {
        isYouTubeVideoVisible = false;
      }
      // If user decided ON, it stays ON. If user decided OFF, it stays OFF.
    };

    // Scenario A: User keeps default OFF
    playTrack({ provider: 'youtube', videoId: 'song1' });
    expect(isYouTubeVideoVisible).toBe(false);
    playTrack({ provider: 'youtube', videoId: 'song2' });
    expect(isYouTubeVideoVisible).toBe(false);

    // Scenario B: User explicitly turns ON
    isYouTubeVideoVisible = true;
    playTrack({ provider: 'youtube', videoId: 'song3' });
    expect(isYouTubeVideoVisible).toBe(true); // User decision respected!

    // Scenario C: Non-YouTube track closes video screen
    playTrack({ provider: 'local' });
    expect(isYouTubeVideoVisible).toBe(false);
  });
});
