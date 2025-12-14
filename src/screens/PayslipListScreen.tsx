import React from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PayslipCard from '../components/PayslipCard';
import SortButton from '../components/SortButton';
import {usePayslips} from '../context/PayslipContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Payslip} from '../types';
import {theme} from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PayslipListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {sortedPayslips, sortOrder, setSortOrder} = usePayslips();

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

  return (
    <View style={styles.container}>
      <SortButton sortOrder={sortOrder} onPress={handleSortToggle} />
      <FlatList
        data={sortedPayslips}
        renderItem={renderPayslipItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  },
});

export default PayslipListScreen;

