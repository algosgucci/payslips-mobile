import {Platform, InteractionManager} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {Payslip, FileType} from '../types';
import {requestStoragePermission} from './permissions';

// Lazy import react-native-fs to avoid NativeEventEmitter initialization issues
let RNFS: any = null;
const getRNFS = () => {
  if (!RNFS) {
    try {
      const RNFSModule = require('react-native-fs');
      // Handle both default export and named export
      RNFS = RNFSModule.default || RNFSModule;
      // Verify the module has the required properties
      if (!RNFS || !RNFS.DocumentDirectoryPath) {
        throw new Error('react-native-fs module is not properly initialized');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`react-native-fs is not properly linked: ${errorMessage}. Please run: cd ios && pod install && cd .. && npx react-native run-ios`);
    }
  }
  return RNFS;
};

/**
 * Detects file type from file path/name
 */
export const getFileType = (filePath: string): FileType => {
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
export const downloadPayslip = async (payslip: Payslip): Promise<string> => {
  try {
    // Request permission for Android (if needed)
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      throw new Error(
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
    const fileName = payslip.file;
    const destinationPath = `${downloadDir}/${fileName}`;

    // Check if directory exists, create if not
    const dirExists = await fs.exists(downloadDir);
    if (!dirExists) {
      await fs.mkdir(downloadDir);
    }

    // Check available storage space (basic check)
    const freeSpace = await fs.getFSInfo();
    if (freeSpace.freeSpace < 1024 * 1024) {
      // Less than 1MB free
      throw new Error('Insufficient storage space. Please free up some space and try again.');
    }

    // Create file content based on file type
    const fileType = getFileType(payslip.file);
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
      throw new Error('File was not saved correctly. Please try again.');
    }

    return destinationPath;
  } catch (error) {
    // Provide more specific error messages
    if (error instanceof Error) {
      // Re-throw with original message if it's already user-friendly
      if (error.message.includes('permission') || error.message.includes('storage')) {
        throw error;
      }
      throw new Error(`Failed to download payslip: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while downloading the payslip.');
  }
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
    const filePath = `${downloadDir}/${payslip.file}`;

    // Ensure directory exists
    const dirExists = await fs.exists(downloadDir);
    if (!dirExists) {
      await fs.mkdir(downloadDir);
    }

    // Check if file exists, download if not
    const fileExists = await fs.exists(filePath);
    if (!fileExists) {
      // Download first, then preview
      // Yield to UI thread before starting download to keep UI responsive
      await new Promise<void>(resolve => {
        InteractionManager.runAfterInteractions(() => {
          resolve();
        });
      });
      await downloadPayslip(payslip);
    }

    // Verify file exists before trying to open
    const verifyExists = await fs.exists(filePath);
    if (!verifyExists) {
      throw new Error('File was not found. Please try downloading again.');
    }

    // Open file with native viewer
    await FileViewer.open(filePath, {
      showOpenWithDialog: true,
      showAppsSuggestions: true,
      displayName: payslip.file,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // FileViewer throws specific errors we can handle
    if (errorMessage.includes('No app found') || errorMessage.includes('No application')) {
      throw new Error('No app available to open this file type. Please install a PDF viewer.');
    } else if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
      throw new Error('Permission denied. Please grant storage permission and try again.');
    } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
      throw new Error('File not found. Please download the payslip first.');
    } else {
      throw new Error(`Unable to preview file: ${errorMessage}`);
    }
  }
};
