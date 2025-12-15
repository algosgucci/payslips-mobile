import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
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
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payslip = getPayslipById(payslipId);

  const handleDownload = useCallback(async () => {
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
  }, [payslip]);

  const handlePreview = useCallback(async () => {
    setIsPreviewing(true);
    setError(null);
    try {
      // Use requestAnimationFrame to ensure UI updates before heavy operation
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await previewPayslip(payslip!);
      // FileViewer handles the preview, no need for success message
    } catch (err) {
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
    } finally {
      setIsPreviewing(false);
    }
  }, [payslip]);

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
          style={[styles.previewButton, isPreviewing && styles.previewButtonDisabled]}
          onPress={handlePreview}
          disabled={isPreviewing}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Preview payslip"
          accessibilityHint="Double tap to open payslip in default viewer app"
          accessibilityState={{disabled: isPreviewing}}>
          {isPreviewing ? (
            <View style={styles.previewButtonContent}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
              <Text style={styles.previewButtonText}>Preparing...</Text>
            </View>
          ) : (
            <Text style={styles.previewButtonText}>Preview Payslip</Text>
          )}
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
});

export default PayslipDetailsScreen;

