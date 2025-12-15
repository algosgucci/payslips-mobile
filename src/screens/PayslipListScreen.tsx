import React from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PayslipCard from '../components/PayslipCard';
import SortButton from '../components/SortButton';
import FilterInput from '../components/FilterInput';
import {usePayslips} from '../context/PayslipContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Payslip} from '../types';
import {theme} from '../theme';

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

  const handlePayslipPress = (payslip: Payslip) => {
    navigation.navigate('PayslipDetails', {payslipId: payslip.id});
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'recent' ? 'oldest' : 'recent');
  };

  const renderPayslipItem = ({item}: {item: Payslip}) => {
    return (
      <PayslipCard
        payslip={item}
        onPress={() => handlePayslipPress(item)}
      />
    );
  };

  const renderEmptyList = () => {
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
  };

  return (
    <View style={styles.container}>
      <FilterInput
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={availableYears}
      />
      <SortButton sortOrder={sortOrder} onPress={handleSortToggle} />
      <FlatList
        data={filteredAndSortedPayslips}
        renderItem={renderPayslipItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
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

