import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const PayslipListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Payslip List Screen</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  subtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});

export default PayslipListScreen;
