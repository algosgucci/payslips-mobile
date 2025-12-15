/**
 * @format
 */

import {formatDate, formatDateRange, getYear} from '../dateFormatter';

describe('dateFormatter', () => {
  describe('formatDate', () => {
    it('should format a valid ISO date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle different months correctly', () => {
      expect(formatDate('2024-02-14')).toBe('Feb 14, 2024');
      expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
    });

    it('should handle single digit days correctly', () => {
      const result = formatDate('2024-03-05');
      expect(result).toBe('Mar 5, 2024');
    });

    it('should handle different years correctly', () => {
      expect(formatDate('2023-06-15')).toBe('Jun 15, 2023');
      expect(formatDate('2025-06-15')).toBe('Jun 15, 2025');
    });
  });

  describe('formatDateRange', () => {
    it('should format a date range correctly', () => {
      const result = formatDateRange('2024-01-01', '2024-01-31');
      expect(result).toBe('Jan 1, 2024 – Jan 31, 2024');
    });

    it('should handle date ranges spanning different months', () => {
      const result = formatDateRange('2024-01-15', '2024-02-14');
      expect(result).toBe('Jan 15, 2024 – Feb 14, 2024');
    });

    it('should handle date ranges spanning different years', () => {
      const result = formatDateRange('2023-12-15', '2024-01-14');
      expect(result).toBe('Dec 15, 2023 – Jan 14, 2024');
    });
  });

  describe('getYear', () => {
    it('should extract the year from a date string', () => {
      expect(getYear('2024-01-15')).toBe(2024);
      expect(getYear('2023-06-20')).toBe(2023);
      expect(getYear('2025-12-31')).toBe(2025);
    });

    it('should handle dates at the beginning of the year', () => {
      expect(getYear('2024-01-01')).toBe(2024);
    });

    it('should handle dates at the end of the year', () => {
      expect(getYear('2024-12-31')).toBe(2024);
    });
  });
});
