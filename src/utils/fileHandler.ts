import {Platform, InteractionManager} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {Payslip, FileType} from '../types';
import {requestStoragePermission} from './permissions';
import {sanitizeFileName, validateFileSize} from './validation';
import {AppError, ErrorCode, logError} from './errorCodes';

// Type definition for react-native-fs module
interface RNFSModule {
  DocumentDirectoryPath: string;
  DownloadDirectoryPath?: string;
  exists: (path: string) => Promise<boolean>;
  mkdir: (path: string) => Promise<void>;
  unlink: (path: string) => Promise<void>;
  writeFile: (filepath: string, contents: string, encoding: 'utf8' | 'base64') => Promise<void>;
  getFSInfo: () => Promise<{freeSpace: number; totalSpace: number}>;
}

// Lazy import react-native-fs to avoid NativeEventEmitter initialization issues
let RNFS: RNFSModule | null = null;
const getRNFS = (): RNFSModule => {
  if (!RNFS) {
    try {
      const RNFSModule = require('react-native-fs');
      // Handle both default export and named export
      const module = RNFSModule.default || RNFSModule;
      // Verify the module has the required properties
      if (!module || !module.DocumentDirectoryPath) {
        throw new Error('react-native-fs module is not properly initialized');
      }
      RNFS = module as RNFSModule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(
        ErrorCode.UNKNOWN_ERROR,
        `react-native-fs is not properly linked: ${errorMessage}. Please run: cd ios && pod install && cd .. && npx react-native run-ios`,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }
  return RNFS;
};

/**
 * Detects file type from file path/name
 */
export const getFileType = (filePath: string): FileType => {
  if (!filePath || typeof filePath !== 'string') {
    return 'image'; // Default fallback
  }
  const extension = filePath.split('.').pop()?.toLowerCase();
  return extension === 'pdf' ? 'pdf' : 'image';
};

/**
 * Gets the appropriate download directory based on platform
 */
const getDownloadDirectory = (): string => {
  const fs = getRNFS();
  if (Platform.OS === 'ios') {
    // Use DocumentDirectoryPath - files here are accessible via Files app
    // Create a Payslips subdirectory for better organization
    return `${fs.DocumentDirectoryPath}/Payslips`;
  } else {
    // Android - use app Documents directory (accessible without special permissions)
    // For Downloads folder, we'd need additional permissions
    return fs.DocumentDirectoryPath;
  }
};

/**
 * Downloads a payslip file to device storage
 * For this demo, we create a placeholder file since we don't have actual assets
 * In production, you'd copy from the assets folder
 * 
 * Returns the saved file path on success, throws error on failure
 */
/**
 * Retry operation with exponential backoff
 */
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: Error | AppError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise<void>(resolve => setTimeout(() => resolve(), delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new AppError(ErrorCode.UNKNOWN_ERROR);
};

export const downloadPayslip = async (payslip: Payslip): Promise<string> => {
  return retryOperation(async () => {
    try {
      // Request permission for Android (if needed)
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        throw new AppError(
          ErrorCode.PERMISSION_DENIED,
          'Storage permission is required to save payslips. Please grant permission in app settings.',
        );
      }

      // Yield to UI thread before starting heavy operations
      await new Promise<void>(resolve => {
        InteractionManager.runAfterInteractions(() => {
          resolve();
        });
      });

      const fs = getRNFS();
      const downloadDir = getDownloadDirectory();
      
      // Sanitize filename to prevent path injection
      let fileName: string;
      try {
        fileName = sanitizeFileName(payslip.file);
      } catch (error) {
        throw new AppError(
          ErrorCode.INVALID_FILE_NAME,
          'Invalid file name provided',
          error instanceof Error ? error : new Error(String(error)),
        );
      }
      
      const destinationPath = `${downloadDir}/${fileName}`;

    // Check if directory exists, create if not
    const dirExists = await fs.exists(downloadDir);
    if (!dirExists) {
      await fs.mkdir(downloadDir);
    }

      // Check available storage space (basic check)
      const freeSpace = await fs.getFSInfo();
      const minRequiredSpace = 1024 * 1024; // 1MB minimum
      if (freeSpace.freeSpace < minRequiredSpace) {
        throw new AppError(
          ErrorCode.INSUFFICIENT_STORAGE,
          'Insufficient storage space. Please free up some space and try again.',
        );
      }

    // Get file type and create content
    const fileType = getFileType(payslip.file);
    
      // Validate file size before creating content
      const estimatedFileSize = fileType === 'pdf' ? 2000 : 500; // Rough estimate in bytes
      const sizeValidation = validateFileSize(estimatedFileSize);
      if (!sizeValidation.valid) {
        throw new AppError(ErrorCode.FILE_SIZE_EXCEEDED, sizeValidation.error);
      }

    let fileContent: string;
    
    if (fileType === 'pdf') {
      // Create a minimal valid PDF structure that can be opened by PDF viewers
      // This is a basic PDF with text content
      fileContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(Payslip Information) Tj
0 -20 Td
(ID: ${payslip.id}) Tj
0 -20 Td
(Period: ${payslip.fromDate} to ${payslip.toDate}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000316 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
516
%%EOF`;
    } else {
      // For images, create a simple text file (in production, this would be actual image data)
      fileContent = `Payslip Information

ID: ${payslip.id}
Period: ${payslip.fromDate} to ${payslip.toDate}

This is a placeholder file. In production, this would be the actual payslip image.`;
    }

    // Check if file already exists
    const fileExists = await fs.exists(destinationPath);
    if (fileExists) {
      // Remove existing file before writing new one
      await fs.unlink(destinationPath);
    }

    // Write the file
    // For PDF, write directly as the PDF format is text-based
    // For images, write as utf8 text
    // Yield to UI thread before file write to keep UI responsive
    await new Promise<void>(resolve => {
      // Use setTimeout with 0ms to yield to UI thread
      setTimeout(() => {
        resolve();
      }, 0);
    });
    
    // Perform file write (this is async and won't block UI)
    await fs.writeFile(destinationPath, fileContent, 'utf8');

      // Verify file was written
      const verifyExists = await fs.exists(destinationPath);
      if (!verifyExists) {
        throw new AppError(
          ErrorCode.FILE_WRITE_FAILED,
          'File was not saved correctly. Please try again.',
        );
      }

      return destinationPath;
    } catch (error) {
      // Log error for debugging
      logError(error instanceof Error ? error : new Error(String(error)), 'downloadPayslip');

      // If it's already an AppError, re-throw it
      if (error instanceof AppError) {
        throw error;
      }

      // Convert generic errors to AppError
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('Permission')) {
          throw new AppError(ErrorCode.PERMISSION_DENIED, error.message, error);
        }
        if (error.message.includes('storage') || error.message.includes('Storage')) {
          throw new AppError(ErrorCode.INSUFFICIENT_STORAGE, error.message, error);
        }
        throw new AppError(ErrorCode.FILE_DOWNLOAD_FAILED, error.message, error);
      }

      throw new AppError(ErrorCode.UNKNOWN_ERROR, 'An unexpected error occurred while downloading the payslip.');
    }
  });
};

/**
 * Gets a user-friendly message about where the file was saved
 */
export const getDownloadLocationMessage = (filePath: string): string => {
  if (Platform.OS === 'ios') {
    return `Payslip saved successfully!\n\nYou can access it via:\nFiles app > On My iPhone > PayslipsApp > Payslips\n\nOr use the Preview button to open it directly.`;
  } else {
    const fileName = filePath.split('/').pop();
    return `Payslip saved successfully!\n\nFile: ${fileName}\n\nYou can find it in your Downloads folder or use the Preview button to open it directly.`;
  }
};

/**
 * Opens a file for preview using the native file viewer
 * First checks if file exists, downloads if needed
 */
export const previewPayslip = async (payslip: Payslip): Promise<void> => {
  try {
    const fs = getRNFS();
    const downloadDir = getDownloadDirectory();
    
    // Sanitize filename
    let fileName: string;
    try {
      fileName = sanitizeFileName(payslip.file);
    } catch (error) {
      throw new AppError(
        ErrorCode.INVALID_FILE_NAME,
        'Invalid file name provided',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
    
    const filePath = `${downloadDir}/${fileName}`;

    // Ensure directory exists
    const dirExists = await fs.exists(downloadDir);
    if (!dirExists) {
      await fs.mkdir(downloadDir);
    }

    // Check if file exists, download if not
    const fileExists = await fs.exists(filePath);
    if (!fileExists) {
      // Download first, then preview
      await downloadPayslip(payslip);
    }

    // Verify file exists before trying to open
    const verifyExists = await fs.exists(filePath);
    if (!verifyExists) {
      throw new AppError(ErrorCode.FILE_NOT_FOUND, 'File was not found. Please try downloading again.');
    }

    // Open file with native viewer
    await FileViewer.open(filePath, {
      showOpenWithDialog: true,
      showAppsSuggestions: true,
      displayName: fileName,
    });
  } catch (error) {
    // Log error for debugging
    logError(error instanceof Error ? error : new Error(String(error)), 'previewPayslip');

    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }

    // Convert FileViewer errors to AppError
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage.includes('No app found') || errorMessage.includes('No application')) {
        throw new AppError(
          ErrorCode.FILE_PREVIEW_FAILED,
          'No app available to open this file type. Please install a PDF viewer.',
          error,
        );
      }
      if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
        throw new AppError(
          ErrorCode.PERMISSION_DENIED,
          'Permission denied. Please grant storage permission and try again.',
          error,
        );
      }
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        throw new AppError(ErrorCode.FILE_NOT_FOUND, 'File not found. Please download the payslip first.', error);
      }
      throw new AppError(ErrorCode.FILE_PREVIEW_FAILED, `Unable to preview file: ${errorMessage}`, error);
    }

    throw new AppError(ErrorCode.UNKNOWN_ERROR, 'An unexpected error occurred while previewing the file.');
  }
};
