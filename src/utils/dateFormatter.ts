/**
 * Formats a date string (ISO format) to a readable date string
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a date range for display
 * @param fromDate - Start date in ISO format
 * @param toDate - End date in ISO format
 * @returns Formatted date range string (e.g., "Jan 15, 2024 – Feb 14, 2024")
 */
export const formatDateRange = (fromDate: string, toDate: string): string => {
  return `${formatDate(fromDate)} – ${formatDate(toDate)}`;
};

/**
 * Extracts the year from a date string
 * @param dateString - ISO date string
 * @returns Year as number
 */
export const getYear = (dateString: string): number => {
  return new Date(dateString).getFullYear();
};
