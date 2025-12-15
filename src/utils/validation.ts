/**
 * Input validation and sanitization utilities
 */

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum search text length
 */
export const MAX_SEARCH_LENGTH = 100;

/**
 * Sanitizes a filename to prevent directory traversal and invalid characters
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('Invalid file name');
  }

  // Remove path separators and dangerous characters
  let sanitized = fileName
    .replace(/[/\\]/g, '_') // Replace path separators
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"|?*\u0000-\u001f]/g, '_') // Remove control characters and invalid filename chars
    .replace(/^\.+/, '') // Remove leading dots
    .trim();

  // Ensure filename is not empty
  if (!sanitized) {
    throw new Error('File name cannot be empty');
  }

  // Limit length (most file systems have 255 char limit)
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
};

/**
 * Validates search text input
 */
export const validateSearchText = (text: string): {valid: boolean; error?: string} => {
  if (typeof text !== 'string') {
    return {valid: false, error: 'Search text must be a string'};
  }

  if (text.length > MAX_SEARCH_LENGTH) {
    return {
      valid: false,
      error: `Search text cannot exceed ${MAX_SEARCH_LENGTH} characters`,
    };
  }

  // Check for potentially dangerous patterns (basic XSS prevention)
  const dangerousPatterns = /<script|javascript:|onerror=|onload=/i;
  if (dangerousPatterns.test(text)) {
    return {valid: false, error: 'Invalid characters in search text'};
  }

  return {valid: true};
};

/**
 * Validates year filter input
 */
export const validateYear = (year: string | number): {valid: boolean; error?: string} => {
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;

  if (isNaN(yearNum)) {
    return {valid: false, error: 'Year must be a number'};
  }

  const currentYear = new Date().getFullYear();
  if (yearNum < 1900 || yearNum > currentYear + 1) {
    return {valid: false, error: `Year must be between 1900 and ${currentYear + 1}`};
  }

  return {valid: true};
};

/**
 * Validates file size
 */
export const validateFileSize = (size: number): {valid: boolean; error?: string} => {
  if (typeof size !== 'number' || size < 0) {
    return {valid: false, error: 'Invalid file size'};
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return {valid: true};
};
