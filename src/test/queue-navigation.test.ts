import { describe, it, expect } from 'vitest';
import type { RepeatMode } from '../types/player';

// Testable pure queue navigation helpers matching Sonora player semantics
function getNextIndex(
  currentIndex: number,
  queueLength: number,
  repeatMode: RepeatMode,
  isShuffle: boolean,
  mockRandom?: () => number
): number | null {
  if (queueLength === 0) return null;

  if (isShuffle) {
    const available = Array.from({ length: queueLength }, (_, i) => i).filter((i) => i !== currentIndex);
    if (available.length === 0) return currentIndex;
    const rand = (mockRandom || Math.random)();
    return available[Math.floor(rand * available.length)];
  }

  const next = currentIndex + 1;
  if (next >= queueLength) {
    return repeatMode === 'all' ? 0 : null; // null indicates playback stops
  }
  return next;
}

function getPreviousIndex(
  currentIndex: number,
  queueLength: number,
  currentTime: number,
  repeatMode: RepeatMode
): { action: 'restart' | 'change'; targetIndex: number } {
  if (queueLength === 0) return { action: 'restart', targetIndex: 0 };

  if (currentTime > 3) {
    return { action: 'restart', targetIndex: currentIndex };
  }

  let prev = currentIndex - 1;
  if (prev < 0) {
    prev = repeatMode === 'all' ? queueLength - 1 : 0;
  }
  return { action: 'change', targetIndex: prev };
}

describe('queue navigation & shuffle/repeat logic', () => {

  describe('getNextIndex', () => {
    it('advances sequentially in normal playback', () => {
      expect(getNextIndex(0, 3, 'off', false)).toBe(1);
      expect(getNextIndex(1, 3, 'off', false)).toBe(2);
    });

    it('returns null at the end of queue when repeat is off', () => {
      expect(getNextIndex(2, 3, 'off', false)).toBeNull();
    });

    it('loops to the beginning when repeatMode is all', () => {
      expect(getNextIndex(2, 3, 'all', false)).toBe(0);
    });

    it('picks a different random track when shuffle is enabled', () => {
      // Deterministic random returning 0.5 -> picks middle candidate
      const next = getNextIndex(0, 3, 'off', true, () => 0.5);
      expect(next).not.toBe(0);
      expect([1, 2]).toContain(next);
    });

    it('handles single track queues gracefully in shuffle', () => {
      expect(getNextIndex(0, 1, 'off', true)).toBe(0);
    });
  });

  describe('getPreviousIndex', () => {
    it('restarts current track if played for more than 3 seconds', () => {
      const res = getPreviousIndex(1, 3, 5.0, 'off');
      expect(res.action).toBe('restart');
      expect(res.targetIndex).toBe(1);
    });

    it('jumps to previous track if played for 3 seconds or less', () => {
      const res = getPreviousIndex(1, 3, 1.2, 'off');
      expect(res.action).toBe('change');
      expect(res.targetIndex).toBe(0);
    });

    it('wraps to end of queue if at track 0 and repeatMode is all', () => {
      const res = getPreviousIndex(0, 3, 0.5, 'all');
      expect(res.action).toBe('change');
      expect(res.targetIndex).toBe(2);
    });

    it('stays at track 0 if at beginning and repeat is off', () => {
      const res = getPreviousIndex(0, 3, 0.5, 'off');
      expect(res.action).toBe('change');
      expect(res.targetIndex).toBe(0);
    });
  });
});
