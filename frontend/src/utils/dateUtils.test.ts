import { describe, expect, test } from 'vitest';
import { toLocalDateInputValue } from './dateUtils';

describe('toLocalDateInputValue', () => {
  test('converts a Date to YYYY-MM-DD format', () => {
    const date = new Date('2026-03-15T12:00:00');
    expect(toLocalDateInputValue(date)).toBe('2026-03-15');
  });

  test('pads single-digit months and days with leading zero', () => {
    const date = new Date('2026-01-05T12:00:00');
    expect(toLocalDateInputValue(date)).toBe('2026-01-05');
  });

  test('handles December correctly', () => {
    const date = new Date('2026-12-25T12:00:00');
    expect(toLocalDateInputValue(date)).toBe('2026-12-25');
  });
});
