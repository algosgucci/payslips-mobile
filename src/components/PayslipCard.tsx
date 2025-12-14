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
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Payslip from ${formatDateRange(payslip.fromDate, payslip.toDate)}`}>
      <View style={styles.content}>
        <Text style={styles.periodText}>
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
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text,
  },
});

export default PayslipCard;

