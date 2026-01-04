
export type Category = 
  | 'Office Supplies'
  | 'Travel'
  | 'Meals'
  | 'Marketing'
  | 'Utilities'
  | 'Salaries'
  | 'Software'
  | 'Training'
  | 'Other';

export type PaymentMethod = 
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'Reimbursement';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: Category;
  description: string;
  paymentMethod: PaymentMethod;
  isTaxDeductible: boolean;
}

export interface Budget {
  category: Category;
  amount: number;
}

export type ViewType = 'dashboard' | 'expenses' | 'budgets' | 'reports';
