export interface Payslip {
  id: string;
  fromDate: string; // ISO format
  toDate: string; // ISO format
  file: string; // Path to bundled asset (PDF or image)
}

export type SortOrder = 'recent' | 'oldest';

export type FileType = 'pdf' | 'image';

