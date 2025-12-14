import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Payslip, SortOrder} from '../types';
import {mockPayslips} from '../data/mockPayslips';

interface PayslipContextType {
  payslips: Payslip[];
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

const PayslipContext = createContext<PayslipContextType | undefined>(undefined);

export const PayslipProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [payslips] = useState<Payslip[]>(mockPayslips);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');

  return (
    <PayslipContext.Provider value={{payslips, sortOrder, setSortOrder}}>
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
