import {
  Transaction,
  RecurringRule,
  Category,
  MonthlyBudget,
  MonthSummary,
  AnnualReport,
  YearComparison,
  UserProfile
} from '../types/finance.js';

const API_BASE = '/api';

export const api = {
  // Years
  async getYears(): Promise<number[]> {
    const res = await fetch(`${API_BASE}/years`);
    return res.json();
  },

  async addYear(year: number): Promise<number[]> {
    const res = await fetch(`${API_BASE}/years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year })
    });
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // Transactions
  async getTransactions(filters?: {
    month?: number;
    year?: number;
    type?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/transactions?${params.toString()}`);
    return res.json();
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return res.json();
  },

  async updateTransaction(id: string, updates: Partial<Transaction>, applyToFutureRecurring = false): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}?applyToFutureRecurring=${applyToFutureRecurring}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async toggleTransactionStatus(id: string): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}/toggle-status`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async deleteTransaction(id: string, scope: 'single' | 'future' | 'all' = 'single'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/transactions/${id}?scope=${scope}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // Recurring Rules
  async getRecurringRules(): Promise<RecurringRule[]> {
    const res = await fetch(`${API_BASE}/recurring`);
    return res.json();
  },

  async createRecurringRule(rule: Omit<RecurringRule, 'id' | 'createdAt'>): Promise<RecurringRule> {
    const res = await fetch(`${API_BASE}/recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return res.json();
  },

  async updateRecurringRule(id: string, updates: Partial<RecurringRule>): Promise<RecurringRule> {
    const res = await fetch(`${API_BASE}/recurring/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteRecurringRule(id: string, deleteGenerated = false): Promise<boolean> {
    const res = await fetch(`${API_BASE}/recurring/${id}?deleteGenerated=${deleteGenerated}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // Budgets
  async getBudgets(month?: number, year?: number): Promise<MonthlyBudget[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const res = await fetch(`${API_BASE}/budgets?${params.toString()}`);
    return res.json();
  },

  async setBudget(budget: { month: number; year: number; category: string; plannedAmount: number }): Promise<MonthlyBudget> {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    return res.json();
  },

  // Summaries & Reports
  async getMonthSummary(month: number, year: number): Promise<MonthSummary> {
    const res = await fetch(`${API_BASE}/summary?month=${month}&year=${year}`);
    return res.json();
  },

  async getAnnualReport(year: number): Promise<AnnualReport> {
    const res = await fetch(`${API_BASE}/reports/annual?year=${year}`);
    return res.json();
  },

  async getYearComparison(year1: number, year2: number): Promise<YearComparison> {
    const res = await fetch(`${API_BASE}/reports/compare?year1=${year1}&year2=${year2}`);
    return res.json();
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile`);
    return res.json();
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Reset & Clear
  async resetToSampleData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset-sample`, { method: 'POST' });
    return res.json();
  },

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/clear-all`, { method: 'POST' });
    return res.json();
  },

  // Export URL
  getBackupDownloadUrl(): string {
    return `${API_BASE}/backup`;
  },

  async restoreBackup(backupData: any): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData)
    });
    return res.json();
  }
};
