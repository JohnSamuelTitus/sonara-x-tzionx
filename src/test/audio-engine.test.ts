import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioEngine } from '../audio/AudioEngine';
import type { Track } from '../types/music';

// Mock HTMLAudioElement for Node/JSDOM environment
class MockAudioElement {
  public src = '';
  public currentTime = 0;
  public duration = 120;
  public volume = 1.0;
  public muted = false;
  public paused = true;
  public ended = false;
  public error: { code: number; message: string } | null = null;
  private listeners: Record<string, Array<() => void>> = {};

  addEventListener(event: string, callback: () => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: () => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  dispatchEvent(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb());
    }
  }

  load() {
    this.dispatchEvent('loadedmetadata');
    this.dispatchEvent('canplay');
  }

  async play() {
    this.paused = false;
    this.dispatchEvent('playing');
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatchEvent('pause');
  }
}

describe('AudioEngine', () => {
  let mockAudio: MockAudioElement;
  let engine: AudioEngine;

  const sampleTrack: Track = {
    id: 'test-1',
    title: 'Test Ambient',
    artist: 'Tester',
    album: 'Tests',
    duration: 120,
    coverUrl: '',
    audioUrl: '/audio/test.wav',
    genre: 'Ambient',
    licenseInfo: 'CC0',
  };

  beforeEach(() => {
    mockAudio = new MockAudioElement();
    engine = new AudioEngine(undefined, mockAudio as unknown as HTMLAudioElement);
  });

  it('loads track and sets source correctly', async () => {
    const onPlayState = vi.fn();
    const onLoading = vi.fn();

    engine.setCallbacks({
      onPlayStateChange: onPlayState,
      onLoadingChange: onLoading,
    });

    await engine.loadTrack(sampleTrack, true);

    expect(mockAudio.src).toBe('/audio/test.wav');
    expect(mockAudio.paused).toBe(false);
    expect(onPlayState).toHaveBeenCalledWith(true);
  });

  it('controls volume and clamps within [0, 1] range', () => {
    engine.setVolume(0.5);
    expect(mockAudio.volume).toBe(0.5);

    engine.setVolume(1.8);
    expect(mockAudio.volume).toBe(1.0);

    engine.setVolume(-0.4);
    expect(mockAudio.volume).toBe(0.0);
  });

  it('controls mute state', () => {
    engine.setMuted(true);
    expect(mockAudio.muted).toBe(true);

    engine.setMuted(false);
    expect(mockAudio.muted).toBe(false);
  });

  it('seeks accurately within bounds', () => {
    const onTime = vi.fn();
    engine.setCallbacks({ onTimeUpdate: onTime });

    engine.seek(45);
    expect(mockAudio.currentTime).toBe(45);
    expect(onTime).toHaveBeenCalledWith(45);

    // Negative seeking clamps to 0
    engine.seek(-10);
    expect(mockAudio.currentTime).toBe(0);

    // Seeking beyond duration clamps to duration
    engine.seek(500);
    expect(mockAudio.currentTime).toBe(120);
  });

  it('translates media error codes into user-friendly messages', () => {
    const onError = vi.fn();
    engine.setCallbacks({ onError });

    // Simulate Network error (code 2)
    mockAudio.error = { code: 2, message: 'Network Failure' };
    mockAudio.dispatchEvent('error');
    expect(onError).toHaveBeenCalledWith('Network error while downloading audio.');

    // Simulate Decode error (code 3)
    mockAudio.error = { code: 3, message: 'Decode Failure' };
    mockAudio.dispatchEvent('error');
    expect(onError).toHaveBeenCalledWith('Audio decoding error. The media format may not be supported.');

    // Simulate Resource unavailable (code 4)
    mockAudio.error = { code: 4, message: '404' };
    mockAudio.dispatchEvent('error');
    expect(onError).toHaveBeenCalledWith('Audio resource unavailable or media format not supported.');
  });
});
