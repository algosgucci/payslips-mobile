import {Platform} from 'react-native';
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
    return fs.DocumentDirectoryPath;
  } else {
    // Android - use app-specific directory (works without permission on Android 10+)
    // For Downloads folder, we'd need permission, so using app directory is safer
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

    // For demo purposes, create a simple text file with payslip info
    // In production, you'd copy the actual PDF/image from assets
    const fileContent = `Payslip Information\n\nID: ${payslip.id}\nPeriod: ${payslip.fromDate} to ${payslip.toDate}\n\nThis is a placeholder file. In production, this would be the actual payslip PDF or image.`;

    // Check if file already exists
    const fileExists = await fs.exists(destinationPath);
    if (fileExists) {
      // Optionally, we could add a timestamp or ask user
      // For now, we'll overwrite it
    }

    // Write the file
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
    return `Payslip saved to Documents folder.\n\nYou can access it via Files app > On My iPhone > PayslipsApp`;
  } else {
    return `Payslip saved to app storage.\n\nPath: ${filePath}`;
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

    // Check if file exists, download if not
    const fileExists = await fs.exists(filePath);
    if (!fileExists) {
      // Download first, then preview
      await downloadPayslip(payslip);
    }

    // Open file with native viewer
    await FileViewer.open(filePath, {
      showOpenWithDialog: true,
      showAppsSuggestions: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // FileViewer throws specific errors we can handle
    if (errorMessage.includes('No app found')) {
      throw new Error('No app available to open this file type.');
    } else if (errorMessage.includes('permission')) {
      throw new Error('Permission denied. Please grant storage permission and try again.');
    } else {
      throw new Error(`Unable to preview file: ${errorMessage}`);
    }
  }
};
