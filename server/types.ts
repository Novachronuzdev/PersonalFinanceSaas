export type TransactionType = 'despesa' | 'receita';

export type ExpenseStatus = 'pago' | 'pendente' | 'atrasado';
export type RevenueStatus = 'recebido' | 'a_receber';
export type TransactionStatus = ExpenseStatus | RevenueStatus;

export type RecurrenceFrequency = 'mensal' | 'anual' | 'personalizada';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string | null; // YYYY-MM-DD
  month: number; // 1-12
  year: number; // e.g., 2026
  status: TransactionStatus;
  description?: string;
  isRecurring?: boolean;
  recurrenceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringRule {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  frequency: RecurrenceFrequency;
  intervalMonths: number; // 1 for monthly, 12 for annual, or X for custom
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD or null for indefinite
  dueDay: number; // 1-31
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface MonthlyBudget {
  id: string;
  month: number;
  year: number;
  category: string; // Category name or 'TOTAL' for overall ceiling
  plannedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  currency: string;
  monthlySavingsGoal: number;
  theme: 'light' | 'dark' | 'system';
  pinProtection: boolean;
  pinCode?: string;
}

export interface MonthSummary {
  month: number;
  year: number;
  totalRevenues: number;
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  overdueExpenses: number;
  receivedRevenues: number;
  pendingRevenues: number;
  balance: number; // totalRevenues - totalExpenses
  effectiveBalance: number; // receivedRevenues - paidExpenses
  incomeCommittedPercent: number; // (totalExpenses / totalRevenues) * 100
  plannedExpenses: number;
  budgetDifference: number; // plannedExpenses - totalExpenses
  budgetUsedPercent: number; // (totalExpenses / plannedExpenses) * 100
}

export interface AnnualReport {
  year: number;
  totalRevenues: number;
  totalExpenses: number;
  accumulatedBalance: number;
  monthlyAverageExpenses: number;
  monthlyAverageRevenues: number;
  highestExpenseMonth: { month: number; amount: number };
  lowestExpenseMonth: { month: number; amount: number };
  topExpenseCategory: { category: string; amount: number; percentage: number };
  monthlyBreakdown: Array<{
    month: number;
    monthName: string;
    revenues: number;
    expenses: number;
    balance: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
}

export interface YearComparison {
  year1: number;
  year2: number;
  metrics: {
    year1Revenues: number;
    year2Revenues: number;
    revenueDiffPercent: number;
    year1Expenses: number;
    year2Expenses: number;
    expenseDiffPercent: number;
    year1Balance: number;
    year2Balance: number;
    balanceDiffPercent: number;
  };
  monthlyComparison: Array<{
    month: number;
    monthName: string;
    year1Expenses: number;
    year2Expenses: number;
    year1Revenues: number;
    year2Revenues: number;
  }>;
}
