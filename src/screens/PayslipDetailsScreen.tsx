import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, AppState} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {usePayslips} from '../context/PayslipContext';
import {formatDate, formatDateRange} from '../utils/dateFormatter';
import {getFileType, downloadPayslip, getDownloadLocationMessage, previewPayslip} from '../utils/fileHandler';
import {AppError, ERROR_MESSAGES} from '../utils/errorCodes';
import {theme} from '../theme';

type PayslipDetailsRouteProp = RouteProp<RootStackParamList, 'PayslipDetails'>;

const PayslipDetailsScreen = () => {
  const route = useRoute<PayslipDetailsRouteProp>();
  const navigation = useNavigation();
  const {payslipId} = route.params;
  const {getPayslipById} = usePayslips();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payslip = getPayslipById(payslipId);

  // Ensure modal is closed when user returns to app (safety net)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // User returned to app, ensure modal is closed
        setIsLoadingPreview(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return; // Prevent concurrent downloads
    setIsDownloading(true);
    setError(null);
    try {
      const filePath = await downloadPayslip(payslip!);
      const message = getDownloadLocationMessage(filePath);
      Alert.alert(
        'Download Successful',
        message,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ],
      );
    } catch (err) {
      let errorMessage: string;
      if (err instanceof AppError) {
        errorMessage = ERROR_MESSAGES[err.code] || err.message;
      } else {
        errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      }
      setError(errorMessage);
      Alert.alert(
        'Download Failed',
        errorMessage,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ],
      );
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, payslip]);

  const handlePreview = useCallback(async () => {
    if (isLoadingPreview) return; // Prevent concurrent preview operations
    setIsLoadingPreview(true);
    setError(null);
    try {
      // Prepare and open the payslip
      await previewPayslip(payslip!);
      // File viewer is now open, close modal
      setIsLoadingPreview(false);
    } catch (err) {
      // Close modal on error
      setIsLoadingPreview(false);
      
      let errorMessage: string;
      if (err instanceof AppError) {
        errorMessage = ERROR_MESSAGES[err.code] || err.message;
      } else {
        errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      }
      setError(errorMessage);
      Alert.alert('Preview Failed', errorMessage, [
        {text: 'OK'},
        {text: 'Retry', onPress: handlePreview},
      ]);
    }
  }, [isLoadingPreview, payslip]);

  if (!payslip) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Payslip not found</Text>
          <Text style={styles.errorSubtext}>
            The payslip you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const fileType = getFileType(payslip.file);
  const fileTypeLabel = fileType === 'pdf' ? 'PDF' : 'Image';


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section} accessibilityRole="text">
        <Text style={styles.label} accessibilityRole="text">Period</Text>
        <Text style={styles.value} accessibilityLabel={`Period from ${formatDate(payslip.fromDate)} to ${formatDate(payslip.toDate)}`}>
          {formatDateRange(payslip.fromDate, payslip.toDate)}
        </Text>
      </View>

      <View style={styles.section} accessibilityRole="text">
        <Text style={styles.label} accessibilityRole="text">From Date</Text>
        <Text style={styles.value} accessibilityLabel={`From date ${formatDate(payslip.fromDate)}`}>
          {formatDate(payslip.fromDate)}
        </Text>
      </View>

      <View style={styles.section} accessibilityRole="text">
        <Text style={styles.label} accessibilityRole="text">To Date</Text>
        <Text style={styles.value} accessibilityLabel={`To date ${formatDate(payslip.toDate)}`}>
          {formatDate(payslip.toDate)}
        </Text>
      </View>

      <View style={styles.section} accessibilityRole="text">
        <Text style={styles.label} accessibilityRole="text">Payslip ID</Text>
        <Text style={styles.value} accessibilityLabel={`Payslip ID ${payslip.id}`}>
          {payslip.id}
        </Text>
      </View>

      <View style={styles.section} accessibilityRole="text">
        <Text style={styles.label} accessibilityRole="text">File Type</Text>
        <Text style={styles.value} accessibilityLabel={`File type ${fileTypeLabel}`}>
          {fileTypeLabel}
        </Text>
      </View>

      {error && (
        <View style={styles.errorBanner} accessibilityLiveRegion="polite">
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Loading Modal for Preview */}
      <Modal
        visible={isLoadingPreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLoadingPreview(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.modalTitle}>Loading Payslip</Text>
            <Text style={styles.modalMessage}>
              Please wait while we prepare the payslip for viewing...
            </Text>
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          testID="download-button"
          style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
          onPress={handleDownload}
          disabled={isDownloading}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Download payslip"
          accessibilityHint="Double tap to download payslip to device storage"
          accessibilityState={{disabled: isDownloading}}>
          {isDownloading ? (
            <View style={styles.downloadButtonContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.downloadButtonText}>Downloading...</Text>
            </View>
          ) : (
            <Text style={styles.downloadButtonText}>Download Payslip</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.previewButton, isLoadingPreview && styles.previewButtonDisabled]}
          onPress={handlePreview}
          disabled={isLoadingPreview}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Preview payslip"
          accessibilityHint="Double tap to open payslip in default viewer app"
          accessibilityState={{disabled: isLoadingPreview}}>
          <Text style={styles.previewButtonText}>Preview Payslip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  previewButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewButtonDisabled: {
    opacity: 0.6,
  },
  previewButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  previewButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorSubtext: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minWidth: 120,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorBannerText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PayslipDetailsScreen;
