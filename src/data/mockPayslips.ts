import {Payslip} from '../types';

// Mock payslip data - using placeholder file paths
// In a real app, these would be actual PDF/image files in the assets folder
export const mockPayslips: Payslip[] = [
  {
    id: '1',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
    file: 'payslip_jan_2024.pdf',
  },
  {
    id: '2',
    fromDate: '2024-02-01',
    toDate: '2024-02-29',
    file: 'payslip_feb_2024.pdf',
  },
  {
    id: '3',
    fromDate: '2024-03-01',
    toDate: '2024-03-31',
    file: 'payslip_mar_2024.pdf',
  },
  {
    id: '4',
    fromDate: '2023-12-01',
    toDate: '2023-12-31',
    file: 'payslip_dec_2023.pdf',
  },
  {
    id: '5',
    fromDate: '2024-04-01',
    toDate: '2024-04-30',
    file: 'payslip_apr_2024.pdf',
  },
  {
    id: '6',
    fromDate: '2023-11-01',
    toDate: '2023-11-30',
    file: 'payslip_nov_2023.pdf',
  },
  {
    id: '7',
    fromDate: '2024-05-01',
    toDate: '2024-05-31',
    file: 'payslip_may_2024.pdf',
  },
];
