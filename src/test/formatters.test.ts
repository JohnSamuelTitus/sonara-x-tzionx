import { describe, it, expect } from 'vitest';
import { formatTime, formatTotalDuration, clamp } from '../utils/formatters';

describe('formatters', () => {
  describe('formatTime', () => {
    it('formats seconds into mm:ss with zero-padding', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(75)).toBe('01:15');
      expect(formatTime(605)).toBe('10:05');
    });

    it('handles negative or invalid numbers safely', () => {
      expect(formatTime(-10)).toBe('00:00');
      expect(formatTime(NaN)).toBe('00:00');
      expect(formatTime(Infinity as any)).toBe('00:00');
    });

    it('formats long durations accurately', () => {
      expect(formatTime(3665)).toBe('61:05');
    });
  });

  describe('formatTotalDuration', () => {
    it('formats durations in minutes and seconds', () => {
      expect(formatTotalDuration(45)).toBe('45 sec');
      expect(formatTotalDuration(125)).toBe('2 min 5 sec');
      expect(formatTotalDuration(180)).toBe('3 min 0 sec');
    });

    it('formats durations in hours and minutes', () => {
      expect(formatTotalDuration(3600)).toBe('1 hr 0 min');
      expect(formatTotalDuration(3665)).toBe('1 hr 1 min');
      expect(formatTotalDuration(7320)).toBe('2 hr 2 min');
    });

    it('handles zero or invalid numbers gracefully', () => {
      expect(formatTotalDuration(0)).toBe('0 min');
      expect(formatTotalDuration(-5)).toBe('0 min');
      expect(formatTotalDuration(NaN)).toBe('0 min');
    });
  });

  describe('clamp', () => {
    it('clamps numbers within given bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(0.5, 0, 1)).toBe(0.5);
      expect(clamp(1.2, 0, 1)).toBe(1);
    });
  });
});
