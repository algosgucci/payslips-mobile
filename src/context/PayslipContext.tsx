import React, {createContext, useContext, useState, useMemo, ReactNode} from 'react';
import {Payslip, SortOrder} from '../types';
import {mockPayslips} from '../data/mockPayslips';

interface PayslipContextType {
  payslips: Payslip[];
  sortedPayslips: Payslip[];
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

const PayslipContext = createContext<PayslipContextType | undefined>(undefined);

export const PayslipProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [payslips] = useState<Payslip[]>(mockPayslips);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');

  const sortedPayslips = useMemo(() => {
    const sorted = [...payslips];
    sorted.sort((a, b) => {
      const dateA = new Date(a.fromDate).getTime();
      const dateB = new Date(b.fromDate).getTime();
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [payslips, sortOrder]);

  return (
    <PayslipContext.Provider value={{payslips, sortedPayslips, sortOrder, setSortOrder}}>
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
