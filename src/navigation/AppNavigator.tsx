import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PayslipListScreen from '../screens/PayslipListScreen';
import PayslipDetailsScreen from '../screens/PayslipDetailsScreen';

export type RootStackParamList = {
  PayslipList: undefined;
  PayslipDetails: {payslipId: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PayslipList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="PayslipList"
          component={PayslipListScreen}
          options={{title: 'Payslips'}}
        />
        <Stack.Screen
          name="PayslipDetails"
          component={PayslipDetailsScreen}
          options={{title: 'Payslip Details'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

