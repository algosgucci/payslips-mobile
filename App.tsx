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
import ErrorBoundary from './src/components/ErrorBoundary';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <PayslipProvider>
          <AppNavigator />
        </PayslipProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
