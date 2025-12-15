/**
 * @format
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import PayslipListScreen from '../PayslipListScreen';
import {PayslipProvider} from '../../context/PayslipContext';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({children}: {children: React.ReactNode}) => children,
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<PayslipProvider>{component}</PayslipProvider>);
};

describe('PayslipListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the payslip list with all items', async () => {
    const {getByText} = renderWithProviders(<PayslipListScreen />);

    await waitFor(() => {
      expect(getByText(/Jan 1, 2024 – Jan 31, 2024/)).toBeTruthy();
    });
  });

  it('should toggle sort order when sort button is pressed', async () => {
    const {getByText} = renderWithProviders(<PayslipListScreen />);

    await waitFor(() => {
      expect(getByText('Most Recent First')).toBeTruthy();
    });

    const sortButton = getByText('Most Recent First');
    fireEvent.press(sortButton);

    await waitFor(() => {
      expect(getByText('Oldest First')).toBeTruthy();
    });
  });

  it('should filter payslips by year when year filter is selected', async () => {
    const {getByText} = renderWithProviders(<PayslipListScreen />);

    await waitFor(() => {
      expect(getByText('2024')).toBeTruthy();
    });

    const year2024Button = getByText('2024');
    fireEvent.press(year2024Button);

    await waitFor(() => {
      // Should show 2024 payslips
      expect(getByText(/Jan 1, 2024/)).toBeTruthy();
    });
  });

  it('should show empty state when no payslips match filters', async () => {
    const {getByText, getByPlaceholderText} = renderWithProviders(
      <PayslipListScreen />,
    );

    const searchInput = getByPlaceholderText('Search payslips...');
    fireEvent.changeText(searchInput, 'nonexistent search term');

    await waitFor(() => {
      expect(getByText('No payslips found')).toBeTruthy();
      expect(
        getByText('Try adjusting your filters or search terms'),
      ).toBeTruthy();
    });
  });

  it('should navigate to details screen when payslip card is pressed', async () => {
    const {getByText} = renderWithProviders(<PayslipListScreen />);

    await waitFor(() => {
      expect(getByText(/Jan 1, 2024 – Jan 31, 2024/)).toBeTruthy();
    });

    const payslipCard = getByText(/Jan 1, 2024 – Jan 31, 2024/);
    fireEvent.press(payslipCard);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('PayslipDetails', {
        payslipId: '1',
      });
    });
  });

  it('should filter payslips by search text', async () => {
    const {getByPlaceholderText, getByText} = renderWithProviders(
      <PayslipListScreen />,
    );

    // Wait for initial render
    await waitFor(() => {
      expect(getByText(/Jan 1, 2024/)).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search payslips...');
    // Search for a date pattern that matches toLocaleDateString format (e.g., "1/1" or "1/2024")
    fireEvent.changeText(searchInput, '1/1');

    await waitFor(() => {
      // Should still show January payslip
      expect(getByText(/Jan 1, 2024/)).toBeTruthy();
    });

    // Test with a search that won't match
    fireEvent.changeText(searchInput, '12/25/2025');

    await waitFor(() => {
      // Should show empty state
      expect(getByText('No payslips found')).toBeTruthy();
    });
  });
});
