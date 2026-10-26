import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { YouTubePlayerEngine } from '../audio/YouTubePlayerEngine';
import type { Track } from '../types/music';

describe('YouTubePlayerEngine & Official IFrame API Integration', () => {
  let mockPlayerInstance: any;
  let mockYT: any;
  let playerConfigRef: any;

  beforeEach(() => {
    // Set up mock DOM element for container
    const div = document.createElement('div');
    div.id = 'sonora-youtube-player-iframe';
    document.body.appendChild(div);

    mockPlayerInstance = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
      setVolume: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      getDuration: vi.fn().mockReturnValue(240),
      getCurrentTime: vi.fn().mockReturnValue(15),
      loadVideoById: vi.fn(),
      cueVideoById: vi.fn(),
      destroy: vi.fn(),
    };

    function MockYTPlayer(this: any, _id: string, config: any) {
      playerConfigRef = config;
      // Trigger onReady synchronously so initPlayer resolves cleanly
      if (config?.events?.onReady) {
        config.events.onReady({ target: mockPlayerInstance });
      }
      return mockPlayerInstance;
    }

    mockYT = {
      Player: vi.fn(MockYTPlayer as any),
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      },
    };

    window.YT = mockYT;
  });

  afterEach(() => {
    const el = document.getElementById('sonora-youtube-player-iframe');
    if (el) el.remove();
    delete (window as any).YT;
    delete (window as any).onYouTubeIframeAPIReady;
    vi.clearAllMocks();
  });

  it('initializes and mounts to container element', () => {
    const engine = new YouTubePlayerEngine('sonora-youtube-player-iframe');
    expect(engine).toBeDefined();
    engine.destroy();
  });

  it('loads and plays a valid YouTube track', async () => {
    const engine = new YouTubePlayerEngine('sonora-youtube-player-iframe');
    const callbacks = {
      onPlayStateChange: vi.fn(),
      onLoadingChange: vi.fn(),
      onTimeUpdate: vi.fn(),
      onDurationChange: vi.fn(),
    };
    engine.setCallbacks(callbacks);

    const testTrack: Track = {
      id: 'yt-dQw4w9WgXcQ',
      videoId: 'dQw4w9WgXcQ',
      provider: 'youtube',
      title: 'Never Gonna Give You Up',
      artist: 'Rick Astley',
      album: 'Whenever You Need Somebody',
      duration: 213,
      coverUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      isLocal: false,
    };

    await engine.loadTrack(testTrack, true);

    expect(mockYT.Player).toHaveBeenCalledWith(
      'sonora-youtube-player-iframe',
      expect.objectContaining({
        videoId: 'dQw4w9WgXcQ',
        playerVars: expect.objectContaining({
          autoplay: 1,
          controls: 1,
        }),
      })
    );

    engine.destroy();
  });

  it('rejects a track missing a video ID and reports error', async () => {
    const engine = new YouTubePlayerEngine('sonora-youtube-player-iframe');
    const onError = vi.fn();
    engine.setCallbacks({ onError });

    const invalidTrack: Track = {
      id: 'invalid-track',
      title: 'Invalid Track',
      artist: 'Unknown',
      album: 'Unknown',
      duration: 100,
      coverUrl: '',
      isLocal: false,
    };

    await engine.loadTrack(invalidTrack);
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('does not contain a valid YouTube video ID'));
    engine.destroy();
  });

  it('handles play, pause, seek, volume, and mute controls', async () => {
    const engine = new YouTubePlayerEngine('sonora-youtube-player-iframe');

    const testTrack: Track = {
      id: 'yt-abc123',
      videoId: 'abc123',
      provider: 'youtube',
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Single',
      duration: 180,
      coverUrl: '',
      isLocal: false,
    };

    await engine.loadTrack(testTrack, false);

    // Call controls
    engine.play();
    expect(mockPlayerInstance.playVideo).toHaveBeenCalled();

    engine.pause();
    expect(mockPlayerInstance.pauseVideo).toHaveBeenCalled();

    engine.seek(45);
    expect(mockPlayerInstance.seekTo).toHaveBeenCalledWith(45, true);

    engine.setVolume(0.5);
    expect(mockPlayerInstance.setVolume).toHaveBeenCalledWith(50);

    engine.setMuted(true);
    expect(mockPlayerInstance.mute).toHaveBeenCalled();

    engine.setMuted(false);
    expect(mockPlayerInstance.unMute).toHaveBeenCalled();

    engine.destroy();
  });

  it('handles YouTube embed restriction errors (code 101/150)', async () => {
    const engine = new YouTubePlayerEngine('sonora-youtube-player-iframe');
    const onError = vi.fn();
    engine.setCallbacks({ onError });

    const testTrack: Track = {
      id: 'yt-restricted',
      videoId: 'restricted',
      provider: 'youtube',
      title: 'Restricted Video',
      artist: 'Artist',
      album: 'Single',
      duration: 180,
      coverUrl: '',
      isLocal: false,
    };

    await engine.loadTrack(testTrack);

    // Simulate error event 150 (not allowed in embedded player)
    playerConfigRef.events.onError({ data: 150 });

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('does not allow embedded playback'),
      150
    );

    engine.destroy();
  });

  it('cleans up resources and intervals on destroy', () => {
    const engine = new YouTubePlayerEngine('sonora-youtube-player-iframe');
    engine.destroy();
    expect(engine.isDisposed()).toBe(true);
  });
});
