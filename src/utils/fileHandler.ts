import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {Payslip, FileType} from '../types';

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
  // For now, this is a placeholder
  // In a real implementation, we'd copy from assets to device storage
  const downloadDir = getDownloadDirectory();
  const fileName = payslip.file;
  const destinationPath = `${downloadDir}/${fileName}`;

  // TODO: Implement actual file copy from assets
  // This will be implemented in the next commit with proper file handling

  return destinationPath;
};
