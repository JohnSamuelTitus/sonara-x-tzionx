import { describe, it, expect } from 'vitest';

class ShuffleController {
  private queue: string[];
  private currentIndex: number;
  private isShuffle: boolean;
  private history: number[] = [];

  constructor(queue: string[], startIndex = 0, isShuffle = false) {
    this.queue = queue;
    this.currentIndex = startIndex;
    this.isShuffle = isShuffle;
  }

  public setShuffle(enabled: boolean) {
    this.isShuffle = enabled;
    if (!enabled) {
      this.history = [];
    }
  }

  public nextTrack(mockRandIndex?: number): number {
    if (this.queue.length === 0) return this.currentIndex;

    if (this.isShuffle) {
      // Record in history before moving
      this.history.push(this.currentIndex);

      const available = this.queue.map((_, i) => i).filter((i) => i !== this.currentIndex);
      if (available.length > 0) {
        this.currentIndex = mockRandIndex !== undefined ? mockRandIndex : available[0];
      }
      return this.currentIndex;
    }

    this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    return this.currentIndex;
  }

  public previousTrack(currentTime = 0): { action: 'restart' | 'change'; targetIndex: number } {
    if (this.queue.length === 0) return { action: 'restart', targetIndex: 0 };

    if (currentTime > 3) {
      return { action: 'restart', targetIndex: this.currentIndex };
    }

    // Coherent shuffle navigation: step backwards in shuffle history
    if (this.isShuffle && this.history.length > 0) {
      const prevIdx = this.history.pop()!;
      this.currentIndex = prevIdx;
      return { action: 'change', targetIndex: prevIdx };
    }

    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.queue.length - 1;
    return { action: 'change', targetIndex: this.currentIndex };
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getHistory(): number[] {
    return [...this.history];
  }
}

describe('Shuffle, next, and previous behavior', () => {
  const tracks = ['track-A', 'track-B', 'track-C', 'track-D'];

  it('records played tracks in shuffle history and steps backwards correctly', () => {
    const controller = new ShuffleController(tracks, 0, true);

    // Initial is at 0 (track-A)
    expect(controller.getCurrentIndex()).toBe(0);

    // Step 1: Next jumps randomly to 2 (track-C)
    controller.nextTrack(2);
    expect(controller.getCurrentIndex()).toBe(2);
    expect(controller.getHistory()).toEqual([0]);

    // Step 2: Next jumps randomly to 3 (track-D)
    controller.nextTrack(3);
    expect(controller.getCurrentIndex()).toBe(3);
    expect(controller.getHistory()).toEqual([0, 2]);

    // Step 3: Click previous within 3 seconds -> returns to 2 (track-C)
    const prev1 = controller.previousTrack(1.0);
    expect(prev1.action).toBe('change');
    expect(prev1.targetIndex).toBe(2);
    expect(controller.getCurrentIndex()).toBe(2);
    expect(controller.getHistory()).toEqual([0]);

    // Step 4: Click previous again -> returns to 0 (track-A)
    const prev2 = controller.previousTrack(0.5);
    expect(prev2.action).toBe('change');
    expect(prev2.targetIndex).toBe(0);
    expect(controller.getCurrentIndex()).toBe(0);
    expect(controller.getHistory()).toEqual([]);
  });

  it('restarts track when previous is clicked after 3 seconds, preserving history', () => {
    const controller = new ShuffleController(tracks, 0, true);

    controller.nextTrack(3);
    expect(controller.getCurrentIndex()).toBe(3);

    // 5 seconds into song: previous should restart current track without altering history
    const prev = controller.previousTrack(5.2);
    expect(prev.action).toBe('restart');
    expect(prev.targetIndex).toBe(3);
    expect(controller.getHistory()).toEqual([0]);
  });

  it('clears shuffle history when shuffle is disabled', () => {
    const controller = new ShuffleController(tracks, 0, true);

    controller.nextTrack(2);
    controller.nextTrack(1);
    expect(controller.getHistory().length).toBe(2);

    controller.setShuffle(false);
    expect(controller.getHistory()).toEqual([]);
  });
});
