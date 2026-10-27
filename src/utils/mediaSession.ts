import type { Track } from '../types/music';

export interface MediaSessionActionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeekTo: (seconds: number) => void;
  onSeekBackward: (offsetSeconds: number) => void;
  onSeekForward: (offsetSeconds: number) => void;
  onStop?: () => void;
}

/**
 * Check if the browser supports the Media Session API
 */
export function isMediaSessionSupported(): boolean {
  return typeof window !== 'undefined' && 'mediaSession' in navigator && typeof MediaMetadata !== 'undefined';
}

/**
 * Resolves an image URL to an absolute URL for lock-screen metadata.
 * Mobile operating systems (iOS lock screen, Android notification shade)
 * require absolute URLs to fetch and display artwork properly.
 */
function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (typeof window !== 'undefined') {
    try {
      return new URL(url, window.location.origin).href;
    } catch {
      return url;
    }
  }
  return url;
}

/**
 * Updates navigator.mediaSession metadata with current track info and artwork.
 */
export function setMediaSessionMetadata(track: Track | null): void {
  if (!isMediaSessionSupported()) return;

  if (!track) {
    navigator.mediaSession.metadata = null;
    return;
  }

  const coverAbsolute = toAbsoluteUrl(track.coverUrl);

  const artwork: MediaImage[] = coverAbsolute
    ? [
        { src: coverAbsolute, sizes: '96x96', type: 'image/jpeg' },
        { src: coverAbsolute, sizes: '128x128', type: 'image/jpeg' },
        { src: coverAbsolute, sizes: '192x192', type: 'image/jpeg' },
        { src: coverAbsolute, sizes: '256x256', type: 'image/jpeg' },
        { src: coverAbsolute, sizes: '384x384', type: 'image/jpeg' },
        { src: coverAbsolute, sizes: '512x512', type: 'image/jpeg' },
      ]
    : [];

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist || 'Sonara Artist',
      album: track.album || 'sonara X TzionX',
      artwork,
    });
  } catch {
    // Graceful fallback for non-standard environments
  }
}

/**
 * Updates navigator.mediaSession playbackState ('playing' | 'paused' | 'none')
 */
export function setMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void {
  if (!isMediaSessionSupported()) return;
  try {
    navigator.mediaSession.playbackState = state;
  } catch {
    // Ignore unsupported browser states
  }
}

/**
 * Updates navigator.mediaSession position state (duration, playbackRate, position)
 */
export function setMediaSessionPositionState(currentTime: number, duration: number): void {
  if (!isMediaSessionSupported()) return;
  if (typeof navigator.mediaSession.setPositionState !== 'function') return;

  if (typeof duration !== 'number' || isNaN(duration) || !isFinite(duration) || duration <= 0) {
    return;
  }

  const safeCurrent = typeof currentTime === 'number' && !isNaN(currentTime) ? Math.max(0, Math.min(currentTime, duration)) : 0;

  try {
    navigator.mediaSession.setPositionState({
      duration: Math.max(0.1, duration),
      playbackRate: 1.0,
      position: safeCurrent,
    });
  } catch {
    // Browser may throw if state is momentarily out of sync
  }
}

/**
 * Registers Media Session action handlers (play, pause, previous, next, seek, etc.)
 * Returns an unregister cleanup function.
 */
export function registerMediaSessionHandlers(handlers: MediaSessionActionHandlers): () => void {
  if (!isMediaSessionSupported()) {
    return () => {};
  }

  const actions: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
    ['play', () => handlers.onPlay()],
    ['pause', () => handlers.onPause()],
    ['previoustrack', () => handlers.onPrevious()],
    ['nexttrack', () => handlers.onNext()],
    [
      'seekbackward',
      (details) => {
        const offset = details.seekOffset || 10;
        handlers.onSeekBackward(offset);
      },
    ],
    [
      'seekforward',
      (details) => {
        const offset = details.seekOffset || 10;
        handlers.onSeekForward(offset);
      },
    ],
    [
      'seekto',
      (details) => {
        if (typeof details.seekTime === 'number' && !isNaN(details.seekTime)) {
          handlers.onSeekTo(details.seekTime);
        }
      },
    ],
    [
      'stop',
      () => {
        if (handlers.onStop) {
          handlers.onStop();
        } else {
          handlers.onPause();
        }
      },
    ],
  ];

  for (const [action, handler] of actions) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Action not supported by this browser
    }
  }

  return () => {
    if (!isMediaSessionSupported()) return;
    for (const [action] of actions) {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // Ignore removal error
      }
    }
  };
}

/**
 * Clears all media session metadata and resets state to none.
 */
export function clearMediaSession(): void {
  if (!isMediaSessionSupported()) return;
  try {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
  } catch {
    // Ignore error
  }
}
