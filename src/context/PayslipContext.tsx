import React, {createContext, useContext, useState, useMemo, ReactNode} from 'react';
import {Payslip, SortOrder} from '../types';
import {mockPayslips} from '../data/mockPayslips';
import {getYear} from '../utils/dateFormatter';

interface PayslipContextType {
  payslips: Payslip[];
  sortedPayslips: Payslip[];
  filteredAndSortedPayslips: Payslip[];
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: number[];
  getPayslipById: (id: string) => Payslip | undefined;
}

const PayslipContext = createContext<PayslipContextType | undefined>(undefined);

export const PayslipProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [payslips] = useState<Payslip[]>(mockPayslips);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Get available years from payslips
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    payslips.forEach(payslip => {
      years.add(getYear(payslip.fromDate));
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [payslips]);

  const sortedPayslips = useMemo(() => {
    const sorted = [...payslips];
    sorted.sort((a, b) => {
      const dateA = new Date(a.fromDate).getTime();
      const dateB = new Date(b.fromDate).getTime();
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [payslips, sortOrder]);

  // Memoize date strings to avoid repeated Date object creation
  const payslipDateStrings = useMemo(() => {
    return sortedPayslips.map(payslip => ({
      id: payslip.id,
      fromDateStr: new Date(payslip.fromDate).toLocaleDateString().toLowerCase(),
      toDateStr: new Date(payslip.toDate).toLocaleDateString().toLowerCase(),
    }));
  }, [sortedPayslips]);

  const filteredAndSortedPayslips = useMemo(() => {
    let filtered = [...sortedPayslips];

    // Filter by year
    if (selectedYear) {
      const year = parseInt(selectedYear, 10);
      if (!isNaN(year)) {
        filtered = filtered.filter(payslip => getYear(payslip.fromDate) === year);
      }
    }

    // Filter by search text (search in pre-computed date strings)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      const dateStringMap = new Map(payslipDateStrings.map(d => [d.id, d]));
      filtered = filtered.filter(payslip => {
        const dateStrings = dateStringMap.get(payslip.id);
        if (!dateStrings) return false;
        return dateStrings.fromDateStr.includes(searchLower) || dateStrings.toDateStr.includes(searchLower);
      });
    }

    return filtered;
  }, [sortedPayslips, selectedYear, searchText, payslipDateStrings]);

  const getPayslipById = (id: string): Payslip | undefined => {
    return payslips.find(p => p.id === id);
  };

  return (
    <PayslipContext.Provider
      value={{
        payslips,
        sortedPayslips,
        filteredAndSortedPayslips,
        sortOrder,
        setSortOrder,
        searchText,
        setSearchText,
        selectedYear,
        setSelectedYear,
        availableYears,
        getPayslipById,
      }}>
      {children}
    </PayslipContext.Provider>
  );
};

export const usePayslips = (): PayslipContextType => {
  const context = useContext(PayslipContext);
  if (!context) {
    throw new Error('usePayslips must be used within PayslipProvider');
  }
  return context;
};
