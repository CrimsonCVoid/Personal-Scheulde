import { describe, it, expect } from 'vitest';
import { formatTime, getWeekDays, roundToSlot } from '@/lib/time';

describe('Time Utils', () => {
  describe('formatTime', () => {
    it('formats time in 12-hour format by default', () => {
      const date = new Date('2023-01-01T15:30:00');
      expect(formatTime(date)).toBe('3:30 PM');
    });

    it('formats time in 24-hour format when requested', () => {
      const date = new Date('2023-01-01T15:30:00');
      expect(formatTime(date, true)).toBe('15:30');
    });

    it('handles ISO strings', () => {
      expect(formatTime('2023-01-01T09:00:00')).toBe('9:00 AM');
    });
  });

  describe('getWeekDays', () => {
    it('returns 7 days starting from Monday', () => {
      const date = new Date('2023-01-04'); // Wednesday
      const weekDays = getWeekDays(date);
      
      expect(weekDays).toHaveLength(7);
      expect(weekDays[0].getDay()).toBe(1); // Monday
      expect(weekDays[6].getDay()).toBe(0); // Sunday
    });
  });

  describe('roundToSlot', () => {
    it('rounds to nearest 15-minute slot by default', () => {
      const date = new Date('2023-01-01T10:23:00');
      const rounded = roundToSlot(date);
      
      expect(rounded.getMinutes()).toBe(30);
    });

    it('rounds to custom slot size', () => {
      const date = new Date('2023-01-01T10:23:00');
      const rounded = roundToSlot(date, 30);
      
      expect(rounded.getMinutes()).toBe(30);
    });
  });
});