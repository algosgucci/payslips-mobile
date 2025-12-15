import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {SortOrder} from '../types';
import {theme} from '../theme';

interface SortButtonProps {
  sortOrder: SortOrder;
  onPress: () => void;
}

const SortButton: React.FC<SortButtonProps> = ({sortOrder, onPress}) => {
  const getSortLabel = () => {
    return sortOrder === 'recent' ? 'Most Recent First' : 'Oldest First';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="sort-button"
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${getSortLabel()}`}
        accessibilityHint="Double tap to toggle between most recent first and oldest first"
        accessibilityState={{selected: true}}>
        <Text testID="sort-button-text" style={styles.buttonText}>{getSortLabel()}</Text>
        <Text style={styles.arrow}>{sortOrder === 'recent' ? '↓' : '↑'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  buttonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
});

export default SortButton;

