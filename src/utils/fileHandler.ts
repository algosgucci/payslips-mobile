import {Platform, Alert} from 'react-native';
import RNFS from 'react-native-fs';
import {Payslip, FileType} from '../types';
import {requestStoragePermission} from './permissions';

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
  if (Platform.OS === 'ios') {
    return RNFS.DocumentDirectoryPath;
  } else {
    // Android - use app-specific directory (works without permission on Android 10+)
    // For Downloads folder, we'd need permission, so using app directory is safer
    return RNFS.DocumentDirectoryPath;
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

    const downloadDir = getDownloadDirectory();
    const fileName = payslip.file;
    const destinationPath = `${downloadDir}/${fileName}`;

    // Check if directory exists, create if not
    const dirExists = await RNFS.exists(downloadDir);
    if (!dirExists) {
      await RNFS.mkdir(downloadDir);
    }

    // Check available storage space (basic check)
    const freeSpace = await RNFS.getFSInfo();
    if (freeSpace.freeSpace < 1024 * 1024) {
      // Less than 1MB free
      throw new Error('Insufficient storage space. Please free up some space and try again.');
    }

    // For demo purposes, create a simple text file with payslip info
    // In production, you'd copy the actual PDF/image from assets
    const fileContent = `Payslip Information\n\nID: ${payslip.id}\nPeriod: ${payslip.fromDate} to ${payslip.toDate}\n\nThis is a placeholder file. In production, this would be the actual payslip PDF or image.`;

    // Check if file already exists
    const fileExists = await RNFS.exists(destinationPath);
    if (fileExists) {
      // Optionally, we could add a timestamp or ask user
      // For now, we'll overwrite it
    }

    // Write the file
    await RNFS.writeFile(destinationPath, fileContent, 'utf8');

    // Verify file was written
    const verifyExists = await RNFS.exists(destinationPath);
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
