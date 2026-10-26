import { describe, it, expect, vi } from 'vitest';
import { AudioEngine } from '../audio/AudioEngine';

describe('Audio event listener cleanup and track switching', () => {
  it('removes all event listeners on destroy()', () => {
    const addListenerSpy = vi.fn();
    const removeListenerSpy = vi.fn();

    const mockAudio = {
      addEventListener: addListenerSpy,
      removeEventListener: removeListenerSpy,
      pause: vi.fn(),
      src: '/audio/test.wav',
    } as unknown as HTMLAudioElement;

    const engine = new AudioEngine(undefined, mockAudio);

    // Initial listeners should have been added
    expect(addListenerSpy).toHaveBeenCalled();
    const registeredEvents = addListenerSpy.mock.calls.map((call) => call[0]);
    expect(registeredEvents).toContain('timeupdate');
    expect(registeredEvents).toContain('ended');
    expect(registeredEvents).toContain('error');
    expect(registeredEvents).toContain('playing');

    // Call destroy
    engine.destroy();

    // Verify removeEventListener was called for each event
    expect(removeListenerSpy).toHaveBeenCalledTimes(registeredEvents.length);
    const removedEvents = removeListenerSpy.mock.calls.map((call) => call[0]);
    expect(removedEvents).toEqual(registeredEvents);
  });

  it('unloads audio source and pauses on destroy()', () => {
    const pauseSpy = vi.fn();
    const mockAudio = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      pause: pauseSpy,
      src: 'https://example.com/song.mp3',
    } as unknown as HTMLAudioElement;

    const engine = new AudioEngine(undefined, mockAudio);
    engine.destroy();

    expect(pauseSpy).toHaveBeenCalledTimes(1);
    expect(mockAudio.src).toBe('');
  });

  it('ignores callbacks safely after destroy() is invoked', () => {
    const onEnded = vi.fn();
    const onError = vi.fn();
    const onTimeUpdate = vi.fn();

    const listeners: Record<string, EventListener> = {};
    const mockAudio = {
      addEventListener: (event: string, handler: EventListener) => {
        listeners[event] = handler;
      },
      removeEventListener: vi.fn(),
      pause: vi.fn(),
      src: '',
    } as unknown as HTMLAudioElement;

    const engine = new AudioEngine(undefined, mockAudio);
    engine.setCallbacks({ onEnded, onError, onTimeUpdate });

    engine.destroy();

    // Simulate event firing after destroy
    if (listeners.timeupdate) listeners.timeupdate(new Event('timeupdate'));
    if (listeners.ended) listeners.ended(new Event('ended'));
    if (listeners.error) listeners.error(new Event('error'));

    expect(onEnded).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onTimeUpdate).not.toHaveBeenCalled();
  });
});
