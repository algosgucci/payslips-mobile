/**
 * Error codes for consistent error handling across the app
 */
export enum ErrorCode {
  // File operations
  FILE_DOWNLOAD_FAILED = 'FILE_DOWNLOAD_FAILED',
  FILE_PREVIEW_FAILED = 'FILE_PREVIEW_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_WRITE_FAILED = 'FILE_WRITE_FAILED',
  INSUFFICIENT_STORAGE = 'INSUFFICIENT_STORAGE',
  INVALID_FILE_NAME = 'INVALID_FILE_NAME',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',

  // Permissions
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PERMISSION_REQUEST_FAILED = 'PERMISSION_REQUEST_FAILED',

  // Network (for future use)
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',

  // Data
  PAYSLIP_NOT_FOUND = 'PAYSLIP_NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.FILE_DOWNLOAD_FAILED]: 'Failed to download payslip. Please try again.',
  [ErrorCode.FILE_PREVIEW_FAILED]: 'Unable to preview payslip. Please install a PDF viewer.',
  [ErrorCode.FILE_NOT_FOUND]: 'File not found. Please download the payslip first.',
  [ErrorCode.FILE_WRITE_FAILED]: 'Failed to save file. Please check storage space and try again.',
  [ErrorCode.INSUFFICIENT_STORAGE]: 'Insufficient storage space. Please free up some space and try again.',
  [ErrorCode.INVALID_FILE_NAME]: 'Invalid file name. Please contact support.',
  [ErrorCode.FILE_SIZE_EXCEEDED]: 'File size is too large. Maximum size is 10MB.',
  [ErrorCode.PERMISSION_DENIED]: 'Storage permission is required. Please grant permission in app settings.',
  [ErrorCode.PERMISSION_REQUEST_FAILED]: 'Failed to request permission. Please try again.',
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ErrorCode.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.PAYSLIP_NOT_FOUND]: 'Payslip not found.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input. Please check your search or filter.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Custom error class with error code
 */
export class AppError extends Error {
  code: ErrorCode;
  originalError?: Error;

  constructor(code: ErrorCode, message?: string, originalError?: Error) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Logs error to console (and in production, would send to error service)
 */
export const logError = (error: Error | AppError, context?: string) => {
  if (__DEV__) {
    console.error(`[${context || 'Error'}]`, error);
    if (error instanceof AppError && error.originalError) {
      console.error('Original error:', error.originalError);
    }
  }

  // In production, send to error reporting service
  // Example: Sentry.captureException(error, {tags: {context}});
};
