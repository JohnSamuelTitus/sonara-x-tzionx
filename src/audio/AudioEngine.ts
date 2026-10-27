import type { Track } from '../types/music';
import { type AudioSourceProvider, DefaultDemoSourceProvider } from './AudioSourceProvider';

export interface AudioEngineCallbacks {
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export class AudioEngine {
  private audio: HTMLAudioElement;
  private currentTrack: Track | null = null;
  private callbacks: AudioEngineCallbacks = {};
  private sourceProvider: AudioSourceProvider;
  private isDestroyed = false;

  private listeners: Record<string, EventListener> = {};

  constructor(sourceProvider?: AudioSourceProvider, initialAudio?: HTMLAudioElement) {
    this.sourceProvider = sourceProvider || new DefaultDemoSourceProvider();
    
    // Allow injecting audio instance for test environments, or create native HTMLAudioElement
    this.audio = initialAudio || (typeof Audio !== 'undefined' ? new Audio() : ({} as HTMLAudioElement));
    
    // Configure mobile browser audio flags
    if (this.audio) {
      try {
        this.audio.preload = 'auto';
        (this.audio as any).playsInline = true;
        if (typeof this.audio.setAttribute === 'function') {
          this.audio.setAttribute('playsinline', 'true');
          this.audio.setAttribute('webkit-playsinline', 'true');
        }
      } catch {
        // Ignore in restricted environments
      }
    }
    
    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.audio.addEventListener) return;

    this.listeners = {
      timeupdate: () => {
        if (this.callbacks.onTimeUpdate && !this.isDestroyed) {
          this.callbacks.onTimeUpdate(this.audio.currentTime || 0);
        }
      },
      loadedmetadata: () => {
        if (this.callbacks.onDurationChange && !this.isDestroyed) {
          const dur = this.audio.duration;
          this.callbacks.onDurationChange(isNaN(dur) || !isFinite(dur) ? 0 : dur);
        }
      },
      durationchange: () => {
        if (this.callbacks.onDurationChange && !this.isDestroyed) {
          const dur = this.audio.duration;
          this.callbacks.onDurationChange(isNaN(dur) || !isFinite(dur) ? 0 : dur);
        }
      },
      ended: () => {
        if (this.callbacks.onEnded && !this.isDestroyed) {
          this.callbacks.onEnded();
        }
      },
      waiting: () => {
        if (this.callbacks.onLoadingChange && !this.isDestroyed) {
          this.callbacks.onLoadingChange(true);
        }
      },
      playing: () => {
        if (!this.isDestroyed) {
          this.callbacks.onLoadingChange?.(false);
          this.callbacks.onPlayStateChange?.(true);
        }
      },
      pause: () => {
        if (!this.isDestroyed) {
          this.callbacks.onPlayStateChange?.(false);
        }
      },
      error: () => {
        if (this.callbacks.onError && !this.isDestroyed) {
          const err = this.audio.error;
          let message = 'Unable to play audio stream.';
          if (err) {
            switch (err.code) {
              case 1:
                message = 'Playback aborted by user.';
                break;
              case 2:
                message = 'Network error while downloading audio.';
                break;
              case 3:
                message = 'Audio decoding error. The media format may not be supported.';
                break;
              case 4:
                message = 'Audio resource unavailable or media format not supported.';
                break;
              default:
                message = err.message || 'Unknown media playback error.';
            }
          }
          this.callbacks.onLoadingChange?.(false);
          this.callbacks.onPlayStateChange?.(false);
          this.callbacks.onError(message);
        }
      },
    };

    for (const [event, handler] of Object.entries(this.listeners)) {
      this.audio.addEventListener(event, handler);
    }
  }

  public setCallbacks(callbacks: AudioEngineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async loadTrack(track: Track, autoPlay = true): Promise<void> {
    if (this.isDestroyed) return;
    this.currentTrack = track;
    this.callbacks.onLoadingChange?.(true);

    try {
      const url = await this.sourceProvider.resolveAudioUrl(track);
      if (this.isDestroyed) return;

      this.audio.src = url;
      this.audio.load();

      if (autoPlay) {
        await this.play();
      } else {
        this.callbacks.onLoadingChange?.(false);
      }
    } catch (err) {
      if (!this.isDestroyed) {
        this.callbacks.onLoadingChange?.(false);
        this.callbacks.onPlayStateChange?.(false);
        const errMsg = err instanceof Error ? err.message : 'Failed to resolve audio track URL';
        this.callbacks.onError?.(errMsg);
      }
    }
  }

  public async play(): Promise<void> {
    if (this.isDestroyed || !this.audio.play) return;
    try {
      await this.audio.play();
      this.callbacks.onPlayStateChange?.(true);
      this.callbacks.onLoadingChange?.(false);
    } catch (err: unknown) {
      const errName = err && typeof err === 'object' && 'name' in err ? String((err as any).name) : '';
      const errMsg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : String(err);

      // Handles user-aborted or rapid track skipping gracefully
      if (errName === 'AbortError' || errMsg.includes('AbortError')) {
        return;
      }

      // Handles browser autoplay restriction
      if (errName === 'NotAllowedError' || errMsg.includes('NotAllowedError') || errMsg.toLowerCase().includes('autoplay')) {
        this.callbacks.onError?.('Playback blocked by browser autoplay policy. Click play to listen.');
        this.callbacks.onPlayStateChange?.(false);
        this.callbacks.onLoadingChange?.(false);
        return;
      }

      this.callbacks.onError?.('Playback failed: ' + errMsg);
      this.callbacks.onPlayStateChange?.(false);
      this.callbacks.onLoadingChange?.(false);
    }
  }

  public pause(): void {
    if (this.isDestroyed || !this.audio.pause) return;
    this.audio.pause();
    this.callbacks.onPlayStateChange?.(false);
  }

  public seek(seconds: number): void {
    if (this.isDestroyed) return;
    const target = Math.max(0, Math.min(seconds, this.audio.duration || 0));
    if (!isNaN(target)) {
      this.audio.currentTime = target;
      this.callbacks.onTimeUpdate?.(target);
    }
  }

  public setVolume(volume: number): void {
    if (this.isDestroyed) return;
    const clamped = Math.max(0, Math.min(volume, 1));
    this.audio.volume = clamped;
  }

  public setMuted(muted: boolean): void {
    if (this.isDestroyed) return;
    this.audio.muted = muted;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getDuration(): number {
    return this.audio.duration || 0;
  }

  public isPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0;
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.audio.removeEventListener) {
      for (const [event, handler] of Object.entries(this.listeners)) {
        this.audio.removeEventListener(event, handler);
      }
    }
    this.listeners = {};
    if (this.audio.pause) {
      this.audio.pause();
    }
    if (this.audio.src) {
      this.audio.src = '';
    }
    this.callbacks = {};
  }
}
