import { describe, it, expect } from 'vitest';
import { calculateEventColumns, detectEventConflicts } from '@/features/events/utils';
import { Event } from '@/features/events/types';

describe('Event Utils', () => {
  const mockEvent = (id: string, start: string, end: string): Event => ({
    id,
    title: `Event ${id}`,
    start,
    end,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  });

  describe('calculateEventColumns', () => {
    it('assigns single column for non-overlapping events', () => {
      const events = [
        mockEvent('1', '2023-01-01T10:00:00Z', '2023-01-01T11:00:00Z'),
        mockEvent('2', '2023-01-01T12:00:00Z', '2023-01-01T13:00:00Z'),
      ];

      const result = calculateEventColumns(events);

      expect(result[0].column).toBe(0);
      expect(result[0].maxColumns).toBe(1);
      expect(result[1].column).toBe(0);
      expect(result[1].maxColumns).toBe(1);
    });

    it('assigns different columns for overlapping events', () => {
      const events = [
        mockEvent('1', '2023-01-01T10:00:00Z', '2023-01-01T12:00:00Z'),
        mockEvent('2', '2023-01-01T11:00:00Z', '2023-01-01T13:00:00Z'),
      ];

      const result = calculateEventColumns(events);

      expect(result[0].column).toBe(0);
      expect(result[1].column).toBe(1);
      expect(result[0].maxColumns).toBe(2);
      expect(result[1].maxColumns).toBe(2);
    });
  });

  describe('detectEventConflicts', () => {
    it('detects overlapping events', () => {
      const newEvent = mockEvent('new', '2023-01-01T10:30:00Z', '2023-01-01T11:30:00Z');
      const existingEvents = [
        mockEvent('1', '2023-01-01T10:00:00Z', '2023-01-01T11:00:00Z'),
        mockEvent('2', '2023-01-01T12:00:00Z', '2023-01-01T13:00:00Z'),
      ];

      const conflicts = detectEventConflicts(newEvent, existingEvents);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].id).toBe('1');
    });

    it('returns empty array for non-overlapping events', () => {
      const newEvent = mockEvent('new', '2023-01-01T11:00:00Z', '2023-01-01T12:00:00Z');
      const existingEvents = [
        mockEvent('1', '2023-01-01T10:00:00Z', '2023-01-01T11:00:00Z'),
        mockEvent('2', '2023-01-01T12:00:00Z', '2023-01-01T13:00:00Z'),
      ];

      const conflicts = detectEventConflicts(newEvent, existingEvents);

      expect(conflicts).toHaveLength(0);
    });
  });
});