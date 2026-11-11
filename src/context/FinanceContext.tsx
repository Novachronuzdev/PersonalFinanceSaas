import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Transaction,
  RecurringRule,
  Category,
  MonthlyBudget,
  MonthSummary,
  UserProfile,
  TransactionType
} from '../types/finance.js';
import { api } from '../services/api.js';

export type ActiveTab =
  | 'dashboard'
  | 'months'
  | 'expenses'
  | 'revenues'
  | 'budget'
  | 'recurring'
  | 'reports'
  | 'history'
  | 'settings';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FinanceContextType {
  // Navigation & Date Selection
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  years: number[];
  addNewYear: (year: number) => Promise<void>;

  // Data
  summary: MonthSummary | null;
  transactions: Transaction[];
  categories: Category[];
  recurringRules: RecurringRule[];
  budgets: MonthlyBudget[];
  userProfile: UserProfile | null;
  loading: boolean;

  // Actions
  refreshData: () => Promise<void>;
  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>, applyToFuture?: boolean) => Promise<void>;
  toggleTransactionStatus: (id: string) => Promise<void>;
  deleteTransaction: (id: string, scope?: 'single' | 'future' | 'all') => Promise<void>;
  
  createRecurringRule: (rule: Omit<RecurringRule, 'id' | 'createdAt'>) => Promise<void>;
  updateRecurringRule: (id: string, updates: Partial<RecurringRule>) => Promise<void>;
  deleteRecurringRule: (id: string, deleteGenerated?: boolean) => Promise<void>;

  setBudget: (category: string, plannedAmount: number) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Modals & UI States
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  isRevenueModalOpen: boolean;
  setIsRevenueModalOpen: (open: boolean) => void;
  isRecurringModalOpen: boolean;
  setIsRecurringModalOpen: (open: boolean) => void;
  isBudgetModalOpen: boolean;
  setIsBudgetModalOpen: (open: boolean) => void;
  isAddYearModalOpen: boolean;
  setIsAddYearModalOpen: (open: boolean) => void;
  
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  openCreateExpenseModal: () => void;
  openEditExpenseModal: (t: Transaction) => void;
  openCreateRevenueModal: () => void;
  openEditRevenueModal: (t: Transaction) => void;

  deleteConfirmModal: { open: boolean; transaction: Transaction | null };
  setDeleteConfirmModal: (state: { open: boolean; transaction: Transaction | null }) => void;

  // Toasts & Celebrations
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  celebrate: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Default to 2026 and November (or system date)
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear() || 2026;
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return new Date().getMonth() + 1 || 11;
  });

  const [years, setYears] = useState<number[]>([2024, 2025, 2026, 2027]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ open: boolean; transaction: Transaction | null }>({
    open: false,
    transaction: null
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const celebrate = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
    });
  }, []);

  // Fetch all core data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        fetchedYears,
        fetchedCategories,
        fetchedSummary,
        fetchedTransactions,
        fetchedRecurring,
        fetchedBudgets,
        fetchedProfile
      ] = await Promise.all([
        api.getYears(),
        api.getCategories(),
        api.getMonthSummary(selectedMonth, selectedYear),
        api.getTransactions({ month: selectedMonth, year: selectedYear }),
        api.getRecurringRules(),
        api.getBudgets(selectedMonth, selectedYear),
        api.getUserProfile()
      ]);

      setYears(fetchedYears);
      setCategories(fetchedCategories);
      setSummary(fetchedSummary);
      setTransactions(fetchedTransactions);
      setRecurringRules(fetchedRecurring);
      setBudgets(fetchedBudgets);
      setUserProfile(fetchedProfile);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      showToast('Erro ao sincronizar dados com o servidor', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addNewYear = async (newYear: number) => {
    try {
      const updatedYears = await api.addYear(newYear);
      setYears(updatedYears);
      setSelectedYear(newYear);
      showToast(`Ano ${newYear} adicionado com sucesso!`, 'success');
      await refreshData();
    } catch (err) {
      showToast('Erro ao adicionar ano', 'error');
    }
  };

  const createTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await api.createTransaction(data);
      showToast(
        data.type === 'despesa' ? 'Despesa registrada com sucesso!' : 'Receita registrada com sucesso!',
        'success'
      );
      await refreshData();
    } catch (err) {
      showToast('Erro ao registrar transação', 'error');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>, applyToFuture = false) => {
    try {
      await api.updateTransaction(id, updates, applyToFuture);
      showToast('Transação atualizada com sucesso!', 'success');
      await refreshData();
    } catch (err) {
      showToast('Erro ao atualizar transação', 'error');
      throw err;
    }
  };

  const toggleTransactionStatus = async (id: string) => {
    try {
      const updated = await api.toggleTransactionStatus(id);
      const isPaid = updated.status === 'pago' || updated.status === 'recebido';
      if (isPaid) {
        showToast(
          updated.type === 'despesa' ? 'Despesa marcada como Paga! 🎉' : 'Receita marcada como Recebida! 💰',
          'success'
        );
      } else {
        showToast('Status alterado para Pendente', 'info');
      }
      await refreshData();
    } catch (err) {
      showToast('Erro ao alterar status', 'error');
    }
  };

  const deleteTransaction = async (id: string, scope: 'single' | 'future' | 'all' = 'single') => {
    try {
      await api.deleteTransaction(id, scope);
      showToast('Item excluído com sucesso!', 'info');
      await refreshData();
    } catch (err) {
      showToast('Erro ao excluir item', 'error');
    }
  };

  const createRecurringRule = async (rule: Omit<RecurringRule, 'id' | 'createdAt'>) => {
    try {
      await api.createRecurringRule(rule);
      showToast('Regra de recorrência criada e lançada nos meses correspondentes!', 'success');
      await refreshData();
    } catch (err) {
      showToast('Erro ao criar recorrência', 'error');
      throw err;
    }
  };

  const updateRecurringRule = async (id: string, updates: Partial<RecurringRule>) => {
    try {
      await api.updateRecurringRule(id, updates);
      showToast('Regra recorrente atualizada!', 'success');
      await refreshData();
    } catch (err) {
      showToast('Erro ao atualizar recorrência', 'error');
    }
  };

  const deleteRecurringRule = async (id: string, deleteGenerated = false) => {
    try {
      await api.deleteRecurringRule(id, deleteGenerated);
      showToast('Regra de recorrência removida com sucesso!', 'info');
      await refreshData();
    } catch (err) {
      showToast('Erro ao excluir regra de recorrência', 'error');
    }
  };

  const setBudget = async (category: string, plannedAmount: number) => {
    try {
      await api.setBudget({
        month: selectedMonth,
        year: selectedYear,
        category,
        plannedAmount
      });
      showToast(`Orçamento de ${category} atualizado!`, 'success');
      await refreshData();
    } catch (err) {
      showToast('Erro ao definir orçamento', 'error');
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.updateUserProfile(updates);
      setUserProfile(updated);
      showToast('Perfil e preferências atualizados!', 'success');
    } catch (err) {
      showToast('Erro ao atualizar perfil', 'error');
    }
  };

  const openCreateExpenseModal = () => {
    setEditingTransaction(null);
    setIsExpenseModalOpen(true);
  };

  const openEditExpenseModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsExpenseModalOpen(true);
  };

  const openCreateRevenueModal = () => {
    setEditingTransaction(null);
    setIsRevenueModalOpen(true);
  };

  const openEditRevenueModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsRevenueModalOpen(true);
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        years,
        addNewYear,
        summary,
        transactions,
        categories,
        recurringRules,
        budgets,
        userProfile,
        loading,
        refreshData,
        createTransaction,
        updateTransaction,
        toggleTransactionStatus,
        deleteTransaction,
        createRecurringRule,
        updateRecurringRule,
        deleteRecurringRule,
        setBudget,
        updateUserProfile,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        isRevenueModalOpen,
        setIsRevenueModalOpen,
        isRecurringModalOpen,
        setIsRecurringModalOpen,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        isAddYearModalOpen,
        setIsAddYearModalOpen,
        editingTransaction,
        setEditingTransaction,
        openCreateExpenseModal,
        openEditExpenseModal,
        openCreateRevenueModal,
        openEditRevenueModal,
        deleteConfirmModal,
        setDeleteConfirmModal,
        toasts,
        showToast,
        removeToast,
        celebrate
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser utilizado dentro de um FinanceProvider');
  }
  return context;
};
