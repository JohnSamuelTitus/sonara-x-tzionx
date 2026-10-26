// ==============================================================================
// Sonora — Official YouTube IFrame Player API Engine
// ==============================================================================
// Interacts exclusively through the official YouTube IFrame Player API.
// Does NOT scrape or extract audio streams.
// ==============================================================================

import type { Track } from '../types/music';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export interface YouTubeEngineCallbacks {
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onError?: (error: string, code?: number) => void;
  onEnded?: () => void;
}

export class YouTubePlayerEngine {
  private player: any = null;
  private containerId: string;
  private currentTrack: Track | null = null;
  private callbacks: YouTubeEngineCallbacks = {};
  private isDestroyed = false;
  private isApiReady = false;
  private pollInterval: any = null;
  private volume = 0.8;
  private isMuted = false;

  constructor(containerId = 'sonora-youtube-player-iframe') {
    this.containerId = containerId;
    this.ensureIFrameApi();
  }

  private ensureIFrameApi(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    if (window.YT && window.YT.Player) {
      this.isApiReady = true;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const existingScript = document.getElementById('youtube-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(tag, firstScript);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        this.isApiReady = true;
        resolve();
      };
    });
  }

  public setCallbacks(callbacks: YouTubeEngineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private initPlayer(videoId: string, autoPlay = true): Promise<void> {
    return new Promise((resolve) => {
      const container = document.getElementById(this.containerId);
      if (!container || !window.YT || !window.YT.Player) {
        resolve();
        return;
      }

      if (this.player && typeof this.player.loadVideoById === 'function') {
        if (autoPlay) {
          this.player.loadVideoById({ videoId, startSeconds: 0 });
        } else {
          this.player.cueVideoById({ videoId, startSeconds: 0 });
        }
        resolve();
        return;
      }

      try {
        this.player = new window.YT.Player(this.containerId, {
          height: '100%',
          width: '100%',
          videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 1, // Show standard YouTube controls inside embedded player per compliance
            modestbranding: 1,
            rel: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              if (this.isDestroyed) return;
              event.target.setVolume(Math.round(this.volume * 100));
              if (this.isMuted) {
                event.target.mute();
              }
              if (autoPlay) {
                event.target.playVideo();
              }
              resolve();
            },
            onStateChange: (event: any) => {
              if (this.isDestroyed) return;
              this.handleStateChange(event.data);
            },
            onError: (event: any) => {
              if (this.isDestroyed) return;
              this.handleError(event.data);
            },
          },
        });
      } catch (err) {
        this.callbacks.onError?.(
          'Failed to initialize YouTube embedded player: ' +
            (err instanceof Error ? err.message : String(err))
        );
        resolve();
      }
    });
  }

  private handleStateChange(stateCode: number): void {
    // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
    switch (stateCode) {
      case 1: // PLAYING
        this.callbacks.onLoadingChange?.(false);
        this.callbacks.onPlayStateChange?.(true);
        this.startPolling();
        if (this.player && this.player.getDuration) {
          const dur = this.player.getDuration();
          if (dur > 0) this.callbacks.onDurationChange?.(dur);
        }
        break;

      case 2: // PAUSED
        this.callbacks.onPlayStateChange?.(false);
        this.stopPolling();
        break;

      case 3: // BUFFERING
        this.callbacks.onLoadingChange?.(true);
        break;

      case 0: // ENDED
        this.stopPolling();
        this.callbacks.onPlayStateChange?.(false);
        this.callbacks.onEnded?.();
        break;

      default:
        break;
    }
  }

  private handleError(errorCode: number): void {
    this.stopPolling();
    this.callbacks.onLoadingChange?.(false);
    this.callbacks.onPlayStateChange?.(false);

    let message = 'An error occurred during YouTube video playback.';
    switch (errorCode) {
      case 2:
        message = 'Invalid YouTube video ID specified.';
        break;
      case 5:
        message = 'HTML5 player error on YouTube.';
        break;
      case 100:
        message = 'The requested YouTube video was not found or is private/deleted.';
        break;
      case 101:
      case 150:
        message =
          'This video does not allow embedded playback by request of the content owner. Try another song or view on YouTube.';
        break;
      default:
        message = `YouTube playback error (code ${errorCode}).`;
    }

    this.callbacks.onError?.(message, errorCode);
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function' && !this.isDestroyed) {
        const time = this.player.getCurrentTime();
        if (typeof time === 'number' && !isNaN(time)) {
          this.callbacks.onTimeUpdate?.(time);
        }
        const dur = this.player.getDuration?.();
        if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
          this.callbacks.onDurationChange?.(dur);
        }
      }
    }, 250);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  public async loadTrack(track: Track, autoPlay = true): Promise<void> {
    if (this.isDestroyed) return;
    this.currentTrack = track;
    this.callbacks.onLoadingChange?.(true);

    const videoId = track.videoId || (track.id.startsWith('yt-') ? track.id.replace('yt-', '') : null);
    if (!videoId) {
      this.callbacks.onLoadingChange?.(false);
      this.callbacks.onError?.(`Track "${track.title}" does not contain a valid YouTube video ID.`);
      return;
    }

    if (!this.isApiReady) {
      await this.ensureIFrameApi();
    }

    await this.initPlayer(videoId, autoPlay);
  }

  public play(): void {
    if (this.isDestroyed || !this.player) return;
    if (typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  public pause(): void {
    if (this.isDestroyed || !this.player) return;
    if (typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
    }
    this.stopPolling();
    this.callbacks.onPlayStateChange?.(false);
  }

  public seek(seconds: number): void {
    if (this.isDestroyed || !this.player) return;
    if (typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
      this.callbacks.onTimeUpdate?.(seconds);
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(volume, 1));
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(Math.round(this.volume * 100));
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.player) {
      if (muted && typeof this.player.mute === 'function') {
        this.player.mute();
      } else if (!muted && typeof this.player.unMute === 'function') {
        this.player.unMute();
      }
    }
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public isDisposed(): boolean {
    return this.isDestroyed;
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.stopPolling();
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch {
        // Ignore destroy error
      }
    }
    this.player = null;
    this.callbacks = {};
  }
}
