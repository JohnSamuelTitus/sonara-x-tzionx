import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isMediaSessionSupported,
  setMediaSessionMetadata,
  setMediaSessionPlaybackState,
  setMediaSessionPositionState,
  registerMediaSessionHandlers,
  clearMediaSession,
} from '../utils/mediaSession';
import type { Track } from '../types/music';

describe('Media Session API & Lock-Screen Controls', () => {
  let mockMediaSession: any;
  let actionHandlers: Record<string, Function>;

  beforeEach(() => {
    actionHandlers = {};
    mockMediaSession = {
      metadata: null,
      playbackState: 'none',
      setActionHandler: vi.fn((action: string, handler: Function | null) => {
        if (handler) {
          actionHandlers[action] = handler;
        } else {
          delete actionHandlers[action];
        }
      }),
      setPositionState: vi.fn(),
    };

    // Polyfill navigator.mediaSession and MediaMetadata for jsdom environment
    Object.defineProperty(navigator, 'mediaSession', {
      value: mockMediaSession,
      configurable: true,
      writable: true,
    });

    class MockMediaMetadata {
      title: string;
      artist: string;
      album: string;
      artwork: any[];
      constructor(init: any) {
        this.title = init.title;
        this.artist = init.artist;
        this.album = init.album;
        this.artwork = init.artwork;
      }
    }

    (global as any).MediaMetadata = MockMediaMetadata;
  });

  afterEach(() => {
    delete (navigator as any).mediaSession;
    delete (global as any).MediaMetadata;
  });

  it('detects media session support correctly', () => {
    expect(isMediaSessionSupported()).toBe(true);
  });

  it('sets track metadata with absolute artwork URLs on lock-screen', () => {
    const track: Track = {
      id: 'demo-1',
      title: 'Mass Celluloid Hit',
      artist: 'Maestro SPB',
      album: 'Golden Era Classics',
      duration: 240,
      coverUrl: '/cinema/pin-retro-radio.jpg',
      provider: 'local',
      audioUrl: 'https://example.com/audio.mp3',
    };

    setMediaSessionMetadata(track);

    expect(mockMediaSession.metadata).not.toBeNull();
    expect(mockMediaSession.metadata.title).toBe('Mass Celluloid Hit');
    expect(mockMediaSession.metadata.artist).toBe('Maestro SPB');
    expect(mockMediaSession.metadata.album).toBe('Golden Era Classics');
    expect(Array.isArray(mockMediaSession.metadata.artwork)).toBe(true);
    expect(mockMediaSession.metadata.artwork.length).toBeGreaterThan(0);
    // Verified artwork is resolved to absolute URL
    expect(mockMediaSession.metadata.artwork[0].src).toContain('http');
  });

  it('updates playback state to playing and paused accurately', () => {
    setMediaSessionPlaybackState('playing');
    expect(mockMediaSession.playbackState).toBe('playing');

    setMediaSessionPlaybackState('paused');
    expect(mockMediaSession.playbackState).toBe('paused');

    setMediaSessionPlaybackState('none');
    expect(mockMediaSession.playbackState).toBe('none');
  });

  it('updates position state with valid duration and position', () => {
    setMediaSessionPositionState(45, 180);
    expect(mockMediaSession.setPositionState).toHaveBeenCalledWith({
      duration: 180,
      playbackRate: 1.0,
      position: 45,
    });
  });

  it('ignores invalid or non-positive durations gracefully without throwing', () => {
    setMediaSessionPositionState(0, 0);
    setMediaSessionPositionState(10, NaN);
    setMediaSessionPositionState(10, -5);
    // setPositionState should NOT be called with invalid values
    expect(mockMediaSession.setPositionState).not.toHaveBeenCalled();
  });

  it('registers supported action handlers and executes them upon lock-screen events', () => {
    const handlers = {
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onPrevious: vi.fn(),
      onNext: vi.fn(),
      onSeekTo: vi.fn(),
      onSeekBackward: vi.fn(),
      onSeekForward: vi.fn(),
      onStop: vi.fn(),
    };

    const cleanup = registerMediaSessionHandlers(handlers);

    // Verify all actions registered
    expect(actionHandlers['play']).toBeDefined();
    expect(actionHandlers['pause']).toBeDefined();
    expect(actionHandlers['previoustrack']).toBeDefined();
    expect(actionHandlers['nexttrack']).toBeDefined();
    expect(actionHandlers['seekto']).toBeDefined();
    expect(actionHandlers['seekbackward']).toBeDefined();
    expect(actionHandlers['seekforward']).toBeDefined();
    expect(actionHandlers['stop']).toBeDefined();

    // Trigger action handlers
    actionHandlers['play']();
    expect(handlers.onPlay).toHaveBeenCalledTimes(1);

    actionHandlers['pause']();
    expect(handlers.onPause).toHaveBeenCalledTimes(1);

    actionHandlers['previoustrack']();
    expect(handlers.onPrevious).toHaveBeenCalledTimes(1);

    actionHandlers['nexttrack']();
    expect(handlers.onNext).toHaveBeenCalledTimes(1);

    actionHandlers['seekto']({ seekTime: 65 });
    expect(handlers.onSeekTo).toHaveBeenCalledWith(65);

    actionHandlers['seekbackward']({ seekOffset: 15 });
    expect(handlers.onSeekBackward).toHaveBeenCalledWith(15);

    actionHandlers['seekforward']({ seekOffset: 15 });
    expect(handlers.onSeekForward).toHaveBeenCalledWith(15);

    actionHandlers['stop']();
    expect(handlers.onStop).toHaveBeenCalledTimes(1);

    // Cleanup should remove all handlers
    cleanup();
    expect(Object.keys(actionHandlers).length).toBe(0);
  });

  it('clears metadata and resets state to none on stop or teardown', () => {
    setMediaSessionPlaybackState('playing');
    clearMediaSession();

    expect(mockMediaSession.metadata).toBeNull();
    expect(mockMediaSession.playbackState).toBe('none');
  });

  it('handles environment gracefully when mediaSession is not supported', () => {
    delete (navigator as any).mediaSession;
    delete (global as any).MediaMetadata;

    expect(isMediaSessionSupported()).toBe(false);

    // All functions should execute safely without throwing errors
    expect(() => setMediaSessionMetadata(null)).not.toThrow();
    expect(() => setMediaSessionPlaybackState('playing')).not.toThrow();
    expect(() => setMediaSessionPositionState(10, 100)).not.toThrow();
    expect(() =>
      registerMediaSessionHandlers({
        onPlay: () => {},
        onPause: () => {},
        onPrevious: () => {},
        onNext: () => {},
        onSeekTo: () => {},
        onSeekBackward: () => {},
        onSeekForward: () => {},
      })
    ).not.toThrow();
    expect(() => clearMediaSession()).not.toThrow();
  });
});
