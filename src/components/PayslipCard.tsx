import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Payslip} from '../types';
import {formatDateRange} from '../utils/dateFormatter';
import {theme} from '../theme';

interface PayslipCardProps {
  payslip: Payslip;
  onPress: () => void;
}

const PayslipCard: React.FC<PayslipCardProps> = ({payslip, onPress}) => {
  return (
    <TouchableOpacity
      testID={`payslip-card-${payslip.id}`}
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Payslip from ${formatDateRange(payslip.fromDate, payslip.toDate)}`}
      accessibilityHint="Double tap to view payslip details">
      <View style={styles.content}>
        <Text testID={`payslip-date-${payslip.id}`} style={styles.periodText}>
          {formatDateRange(payslip.fromDate, payslip.toDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 60,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
});

export default PayslipCard;

