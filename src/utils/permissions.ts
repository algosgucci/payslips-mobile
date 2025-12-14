import {Platform, PermissionsAndroid} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

/**
 * Requests storage permission for Android
 * Returns true if permission is granted, false otherwise
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    // iOS doesn't need explicit permission for Documents directory
    return true;
  }

  try {
    // For Android 13+ (API 33+), we might not need this permission
    // But for older versions, we request WRITE_EXTERNAL_STORAGE
    if (Platform.Version >= 33) {
      // Android 13+ uses scoped storage, no permission needed for app-specific directory
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'This app needs access to storage to save payslips',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission request error:', err);
    return false;
  }
};
