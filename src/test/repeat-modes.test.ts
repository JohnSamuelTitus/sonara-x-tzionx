import { describe, it, expect, vi } from 'vitest';
import type { RepeatMode } from '../types/player';
import type { Track } from '../types/music';

// Pure simulation function matching PlayerContext track-ended semantics
interface TrackEndState {
  currentTrack: Track;
  queue: Track[];
  queueIndex: number;
  repeatMode: RepeatMode;
  isPlaying: boolean;
}

function simulateTrackEnded(
  state: TrackEndState,
  callbacks: {
    onReplay: () => void;
    onPlayTrack: (track: Track, index: number) => void;
    onStop: () => void;
  }
) {
  const { currentTrack, queue, queueIndex, repeatMode } = state;

  // 1. Repeat One: replay the same track
  if (repeatMode === 'one' && currentTrack) {
    callbacks.onReplay();
    return;
  }

  // 2. Advance queue
  const nextIdx = queueIndex + 1;
  if (nextIdx >= queue.length) {
    if (repeatMode === 'all') {
      // Loop back to beginning of queue
      callbacks.onPlayTrack(queue[0], 0);
    } else {
      // Repeat off: stop playback at end of queue
      callbacks.onStop();
    }
    return;
  }

  callbacks.onPlayTrack(queue[nextIdx], nextIdx);
}

describe('Repeat modes at track completion', () => {
  const testQueue: Track[] = [
    {
      id: 't-1',
      title: 'First Track',
      artist: 'Artist A',
      album: 'Album 1',
      duration: 10,
      coverUrl: '',
      audioUrl: '/audio/1.wav',
      genre: 'Ambient',
      licenseInfo: 'CC0',
      isLocal: true,
    },
    {
      id: 't-2',
      title: 'Middle Track',
      artist: 'Artist B',
      album: 'Album 1',
      duration: 12,
      coverUrl: '',
      audioUrl: '/audio/2.wav',
      genre: 'Lo-Fi',
      licenseInfo: 'CC0',
      isLocal: true,
    },
    {
      id: 't-3',
      title: 'Last Track',
      artist: 'Artist C',
      album: 'Album 1',
      duration: 14,
      coverUrl: '',
      audioUrl: '/audio/3.wav',
      genre: 'Synthwave',
      licenseInfo: 'CC0',
      isLocal: true,
    },
  ];

  it('repeat-one loops the exact current track upon track completion', () => {
    const onReplay = vi.fn();
    const onPlayTrack = vi.fn();
    const onStop = vi.fn();

    simulateTrackEnded(
      {
        currentTrack: testQueue[1],
        queue: testQueue,
        queueIndex: 1,
        repeatMode: 'one',
        isPlaying: true,
      },
      { onReplay, onPlayTrack, onStop }
    );

    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(onPlayTrack).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });

  it('repeat-all wraps back to index 0 when the last track completes', () => {
    const onReplay = vi.fn();
    const onPlayTrack = vi.fn();
    const onStop = vi.fn();

    // Last track (index 2 of 3) completes
    simulateTrackEnded(
      {
        currentTrack: testQueue[2],
        queue: testQueue,
        queueIndex: 2,
        repeatMode: 'all',
        isPlaying: true,
      },
      { onReplay, onPlayTrack, onStop }
    );

    expect(onPlayTrack).toHaveBeenCalledWith(testQueue[0], 0);
    expect(onReplay).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });

  it('repeat-all advances sequentially when not at the end of queue', () => {
    const onReplay = vi.fn();
    const onPlayTrack = vi.fn();
    const onStop = vi.fn();

    simulateTrackEnded(
      {
        currentTrack: testQueue[0],
        queue: testQueue,
        queueIndex: 0,
        repeatMode: 'all',
        isPlaying: true,
      },
      { onReplay, onPlayTrack, onStop }
    );

    expect(onPlayTrack).toHaveBeenCalledWith(testQueue[1], 1);
    expect(onReplay).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });

  it('repeat-off stops playback when reaching the end of queue', () => {
    const onReplay = vi.fn();
    const onPlayTrack = vi.fn();
    const onStop = vi.fn();

    // Last track completes with repeat off
    simulateTrackEnded(
      {
        currentTrack: testQueue[2],
        queue: testQueue,
        queueIndex: 2,
        repeatMode: 'off',
        isPlaying: true,
      },
      { onReplay, onPlayTrack, onStop }
    );

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onPlayTrack).not.toHaveBeenCalled();
    expect(onReplay).not.toHaveBeenCalled();
  });

  it('repeat-off advances to next track before reaching end of queue', () => {
    const onReplay = vi.fn();
    const onPlayTrack = vi.fn();
    const onStop = vi.fn();

    simulateTrackEnded(
      {
        currentTrack: testQueue[0],
        queue: testQueue,
        queueIndex: 0,
        repeatMode: 'off',
        isPlaying: true,
      },
      { onReplay, onPlayTrack, onStop }
    );

    expect(onPlayTrack).toHaveBeenCalledWith(testQueue[1], 1);
    expect(onStop).not.toHaveBeenCalled();
  });
});
