import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {usePayslips} from '../context/PayslipContext';
import {formatDate, formatDateRange} from '../utils/dateFormatter';
import {getFileType} from '../utils/fileHandler';
import {theme} from '../theme';

type PayslipDetailsRouteProp = RouteProp<RootStackParamList, 'PayslipDetails'>;

const PayslipDetailsScreen = () => {
  const route = useRoute<PayslipDetailsRouteProp>();
  const {payslipId} = route.params;
  const {getPayslipById} = usePayslips();

  const payslip = getPayslipById(payslipId);

  if (!payslip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Payslip not found</Text>
      </View>
    );
  }

  const fileType = getFileType(payslip.file);
  const fileTypeLabel = fileType === 'pdf' ? 'PDF' : 'Image';

  const handleDownload = () => {
    // TODO: Implement download functionality in next commit
    Alert.alert('Download', 'Download functionality will be implemented soon');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Period</Text>
        <Text style={styles.value}>{formatDateRange(payslip.fromDate, payslip.toDate)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>From Date</Text>
        <Text style={styles.value}>{formatDate(payslip.fromDate)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>To Date</Text>
        <Text style={styles.value}>{formatDate(payslip.toDate)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Payslip ID</Text>
        <Text style={styles.value}>{payslip.id}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>File Type</Text>
        <Text style={styles.value}>{fileTypeLabel}</Text>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={handleDownload}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Download payslip">
        <Text style={styles.downloadButtonText}>Download Payslip</Text>
      </TouchableOpacity>
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
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default PayslipDetailsScreen;

