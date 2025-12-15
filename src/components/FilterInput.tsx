import React from 'react';
import {View, TextInput, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {theme} from '../theme';

interface FilterInputProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: number[];
}

const FilterInput: React.FC<FilterInputProps> = ({
  searchText,
  onSearchChange,
  selectedYear,
  onYearChange,
  availableYears,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search payslips..."
          value={searchText}
          onChangeText={onSearchChange}
          accessibilityLabel="Search payslips"
          accessibilityHint="Type to filter payslips by date range"
          accessibilityRole="search"
        />
      </View>

      <View style={styles.yearContainer}>
        <Text style={styles.label}>Filter by Year:</Text>
        <View style={styles.yearButtons}>
          <TouchableOpacity
            style={[styles.yearButton, selectedYear === '' && styles.yearButtonActive]}
            onPress={() => onYearChange('')}
            accessibilityRole="button"
            accessibilityLabel="Show all years">
            <Text
              style={[
                styles.yearButtonText,
                selectedYear === '' && styles.yearButtonTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          {availableYears.map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year.toString() && styles.yearButtonActive,
              ]}
              onPress={() => onYearChange(selectedYear === year.toString() ? '' : year.toString())}
              accessibilityRole="button"
              accessibilityLabel={`Filter by year ${year}`}>
              <Text
                style={[
                  styles.yearButtonText,
                  selectedYear === year.toString() && styles.yearButtonTextActive,
                ]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yearContainer: {
    marginTop: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  yearButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  yearButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  yearButtonText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
  },
  yearButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default FilterInput;
