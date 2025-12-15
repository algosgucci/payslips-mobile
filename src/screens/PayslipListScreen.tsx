import React, {useCallback} from 'react';
import {View, FlatList, StyleSheet, Text, ListRenderItem} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PayslipCard from '../components/PayslipCard';
import SortButton from '../components/SortButton';
import FilterInput from '../components/FilterInput';
import {usePayslips} from '../context/PayslipContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Payslip} from '../types';
import {theme} from '../theme';
import {validateSearchText} from '../utils/validation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PayslipListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    filteredAndSortedPayslips,
    sortOrder,
    setSortOrder,
    searchText,
    setSearchText,
    selectedYear,
    setSelectedYear,
    availableYears,
  } = usePayslips();

  const handlePayslipPress = useCallback(
    (payslip: Payslip) => {
      navigation.navigate('PayslipDetails', {payslipId: payslip.id});
    },
    [navigation],
  );

  const handleSortToggle = useCallback(() => {
    setSortOrder(sortOrder === 'recent' ? 'oldest' : 'recent');
  }, [sortOrder, setSortOrder]);

  const handleSearchChange = useCallback(
    (text: string) => {
      const validation = validateSearchText(text);
      if (validation.valid) {
        setSearchText(text);
      }
      // Silently ignore invalid input (or could show a toast)
    },
    [setSearchText],
  );

  const renderPayslipItem = useCallback<ListRenderItem<Payslip>>(
    ({item}) => {
      return <PayslipCard payslip={item} onPress={() => handlePayslipPress(item)} />;
    },
    [handlePayslipPress],
  );

  const renderEmptyList = useCallback(() => {
    if (filteredAndSortedPayslips.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No payslips found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your filters or search terms
          </Text>
        </View>
      );
    }
    return null;
  }, [filteredAndSortedPayslips.length]);

  const keyExtractor = useCallback((item: Payslip) => item.id, []);

  // Optimize FlatList with performance props
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 60 + theme.spacing.sm * 2, // card minHeight + margins
      offset: (60 + theme.spacing.sm * 2) * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <FilterInput
        searchText={searchText}
        onSearchChange={handleSearchChange}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={availableYears}
      />
      <SortButton sortOrder={sortOrder} onPress={handleSortToggle} />
      <FlatList
        data={filteredAndSortedPayslips}
        renderItem={renderPayslipItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingVertical: theme.spacing.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default PayslipListScreen;

