/**
 * Payslips App
 * React Native application for managing and viewing payslips
 *
 * @format
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PayslipProvider} from './src/context/PayslipContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <PayslipProvider>
        <AppNavigator />
      </PayslipProvider>
    </SafeAreaProvider>
  );
}

export default App;
