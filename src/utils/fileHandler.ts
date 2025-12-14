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
      throw new Error('Storage permission denied');
    }

    const downloadDir = getDownloadDirectory();
    const fileName = payslip.file;
    const destinationPath = `${downloadDir}/${fileName}`;

    // Check if directory exists, create if not
    const dirExists = await RNFS.exists(downloadDir);
    if (!dirExists) {
      await RNFS.mkdir(downloadDir);
    }

    // For demo purposes, create a simple text file with payslip info
    // In production, you'd copy the actual PDF/image from assets
    const fileContent = `Payslip Information\n\nID: ${payslip.id}\nPeriod: ${payslip.fromDate} to ${payslip.toDate}\n\nThis is a placeholder file. In production, this would be the actual payslip PDF or image.`;

    // Write the file
    await RNFS.writeFile(destinationPath, fileContent, 'utf8');

    return destinationPath;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to download payslip: ${errorMessage}`);
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
