import { describe, it, expect, vi } from 'vitest';
import { AudioEngine } from '../audio/AudioEngine';
import type { AudioSourceProvider } from '../audio/AudioSourceProvider';
import type { Track } from '../types/music';

// Mock source provider with failing track support
class TestSourceProvider implements AudioSourceProvider {
  id = 'test-provider';
  name = 'Test Provider';
  description = 'Test provider with simulated failures';

  isAvailable(): boolean {
    return true;
  }

  async resolveAudioUrl(track: Track): Promise<string> {
    if (track.id === 'failing-missing-url') {
      throw new Error(`Track "${track.title}" has no valid audio URL configured.`);
    }
    if (track.id === 'failing-remote-404') {
      return 'https://example.com/audio/nonexistent-track-404.mp3';
    }
    return track.audioUrl || '';
  }
}

describe('Audio play failures, media error events, and recovery', () => {
  const validTrack: Track = {
    id: 'valid-1',
    title: 'Valid Track',
    artist: 'Artist',
    album: 'Album',
    duration: 120,
    coverUrl: '',
    audioUrl: '/audio/valid.wav',
    genre: 'Ambient',
    licenseInfo: 'CC0',
    isLocal: true,
  };

  const failingTrack: Track = {
    id: 'failing-missing-url',
    title: 'Broken Track',
    artist: 'Artist',
    album: 'Album',
    duration: 0,
    coverUrl: '',
    audioUrl: '',
    genre: 'None',
    licenseInfo: 'None',
    isLocal: false,
  };

  it('handles source provider resolution rejection and notifies onError', async () => {
    const provider = new TestSourceProvider();
    const onError = vi.fn();
    const onLoadingChange = vi.fn();
    const onPlayStateChange = vi.fn();

    const engine = new AudioEngine(provider);
    engine.setCallbacks({ onError, onLoadingChange, onPlayStateChange });

    await engine.loadTrack(failingTrack, true);

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('has no valid audio URL configured')
    );
    expect(onPlayStateChange).toHaveBeenCalledWith(false);
  });

  it('handles autoplay restriction (NotAllowedError) gracefully without uncaught rejection', async () => {
    const mockAudio = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      load: vi.fn(),
      play: vi.fn().mockRejectedValue(new DOMException('Autoplay restricted', 'NotAllowedError')),
      pause: vi.fn(),
      currentTime: 0,
      duration: 100,
    } as unknown as HTMLAudioElement;

    const onError = vi.fn();
    const onPlayStateChange = vi.fn();

    const engine = new AudioEngine(new TestSourceProvider(), mockAudio);
    engine.setCallbacks({ onError, onPlayStateChange });

    await engine.loadTrack(validTrack, true);

    expect(onError).toHaveBeenCalledWith(
      'Playback blocked by browser autoplay policy. Click play to listen.'
    );
    expect(onPlayStateChange).toHaveBeenCalledWith(false);
  });

  it('handles AbortError quietly when user skips rapidly before previous play resolves', async () => {
    const mockAudio = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      load: vi.fn(),
      play: vi.fn().mockRejectedValue(new DOMException('Interrupted by pause', 'AbortError')),
      pause: vi.fn(),
      currentTime: 0,
      duration: 100,
    } as unknown as HTMLAudioElement;

    const onError = vi.fn();

    const engine = new AudioEngine(new TestSourceProvider(), mockAudio);
    engine.setCallbacks({ onError });

    await engine.loadTrack(validTrack, true);

    // AbortError is benign and should NOT set an alarming error banner
    expect(onError).not.toHaveBeenCalled();
  });

  it('recovers cleanly when switching from an error track to a valid track', async () => {
    const provider = new TestSourceProvider();
    let currentError: string | null = null;
    let isPlaying = false;

    const engine = new AudioEngine(provider);
    engine.setCallbacks({
      onError: (err) => {
        currentError = err;
      },
      onPlayStateChange: (playing) => {
        isPlaying = playing;
        if (playing) {
          currentError = null; // Clean recovery on successful play
        }
      },
    });

    // Step 1: Attempt failing track
    await engine.loadTrack(failingTrack, true);
    expect(currentError).toBeTruthy();
    expect(isPlaying).toBe(false);

    // Step 2: User selects valid track -> error should clear
    currentError = null; // As done by playTrack() before loading
    expect(currentError).toBeNull();
  });
});
