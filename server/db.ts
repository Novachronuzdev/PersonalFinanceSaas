import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Transaction,
  RecurringRule,
  Category,
  MonthlyBudget,
  UserProfile
} from './types.js';

export interface DatabaseSchema {
  version: number;
  years: number[];
  userProfile: UserProfile;
  categories: Category[];
  budgets: MonthlyBudget[];
  recurringRules: RecurringRule[];
  transactions: Transaction[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'financial_db.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

const DEFAULT_CATEGORIES: Category[] = [
  // Despesas
  { id: 'cat-alimentacao', name: 'Alimentação', type: 'despesa', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-moradia', name: 'Moradia', type: 'despesa', icon: 'Home', color: '#3b82f6' },
  { id: 'cat-agua', name: 'Água', type: 'despesa', icon: 'Droplets', color: '#06b6d4' },
  { id: 'cat-energia', name: 'Energia elétrica', type: 'despesa', icon: 'Zap', color: '#eab308' },
  { id: 'cat-internet', name: 'Internet', type: 'despesa', icon: 'Wifi', color: '#6366f1' },
  { id: 'cat-telefone', name: 'Telefone', type: 'despesa', icon: 'Phone', color: '#8b5cf6' },
  { id: 'cat-transporte', name: 'Transporte', type: 'despesa', icon: 'Car', color: '#10b981' },
  { id: 'cat-saude', name: 'Saúde', type: 'despesa', icon: 'HeartPulse', color: '#ec4899' },
  { id: 'cat-educacao', name: 'Educação', type: 'despesa', icon: 'GraduationCap', color: '#a855f7' },
  { id: 'cat-lazer', name: 'Lazer', type: 'despesa', icon: 'Sparkles', color: '#f43f5e' },
  { id: 'cat-assinaturas', name: 'Assinaturas', type: 'despesa', icon: 'Tv', color: '#14b8a6' },
  { id: 'cat-compras', name: 'Compras pessoais', type: 'despesa', icon: 'ShoppingBag', color: '#f59e0b' },
  { id: 'cat-cartao', name: 'Cartão de crédito', type: 'despesa', icon: 'CreditCard', color: '#ef4444' },
  { id: 'cat-outros-desp', name: 'Outros', type: 'despesa', icon: 'MoreHorizontal', color: '#64748b' },

  // Receitas
  { id: 'cat-salario', name: 'Salário', type: 'receita', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat-freelance', name: 'Freelances', type: 'receita', icon: 'Laptop', color: '#06b6d4' },
  { id: 'cat-renda-extra', name: 'Renda extra', type: 'receita', icon: 'Coins', color: '#f59e0b' },
  { id: 'cat-investimentos', name: 'Investimentos', type: 'receita', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat-outros-rec', name: 'Outros', type: 'receita', icon: 'Wallet', color: '#64748b' },
];

function generateSeedData(): DatabaseSchema {
  const currentYear = 2026;
  const years = [2024, 2025, 2026, 2027];

  const recurringRules: RecurringRule[] = [
    {
      id: 'rec-aluguel',
      type: 'despesa',
      title: 'Aluguel do Apartamento',
      amount: 1200.0,
      category: 'Moradia',
      frequency: 'mensal',
      intervalMonths: 1,
      startDate: '2025-01-01',
      endDate: null,
      dueDay: 5,
      description: 'Aluguel mensal e condomínio básico',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-internet',
      type: 'despesa',
      title: 'Internet Fibra 600MB',
      amount: 119.90,
      category: 'Internet',
      frequency: 'mensal',
      intervalMonths: 1,
      startDate: '2025-01-01',
      endDate: null,
      dueDay: 10,
      description: 'Plano fibra óptica residencial',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-netflix',
      type: 'despesa',
      title: 'Netflix & Streaming',
      amount: 55.90,
      category: 'Assinaturas',
      frequency: 'mensal',
      intervalMonths: 1,
      startDate: '2025-01-01',
      endDate: null,
      dueDay: 15,
      description: 'Assinatura padrão 4K',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-academia',
      type: 'despesa',
      title: 'Academia Smart Fit',
      amount: 129.90,
      category: 'Saúde',
      frequency: 'mensal',
      intervalMonths: 1,
      startDate: '2025-01-01',
      endDate: null,
      dueDay: 20,
      description: 'Plano Black musculação',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-salario',
      type: 'receita',
      title: 'Salário Mensal',
      amount: 6200.0,
      category: 'Salário',
      frequency: 'mensal',
      intervalMonths: 1,
      startDate: '2025-01-01',
      endDate: null,
      dueDay: 5,
      description: 'Remuneração principal CLT líquido',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  const transactions: Transaction[] = [];

  // Generate historical data for 2025 and 2026
  for (const yr of [2025, 2026]) {
    for (let m = 1; m <= 12; m++) {
      // Don't generate future months for 2026 past current date (month 11) with paid status
      const isPastOrCurrent = (yr === 2025) || (yr === 2026 && m <= 11);
      const isCurrentMonth = (yr === 2026 && m === 11);
      const isFuture = (yr === 2026 && m > 11);

      const mStr = m.toString().padStart(2, '0');

      // Receita Principal (Salário)
      transactions.push({
        id: uuidv4(),
        type: 'receita',
        title: 'Salário Principal',
        amount: yr === 2026 ? 6200.0 : 5800.0,
        category: 'Salário',
        dueDate: `${yr}-${mStr}-05`,
        paymentDate: isPastOrCurrent ? `${yr}-${mStr}-05` : null,
        month: m,
        year: yr,
        status: isPastOrCurrent ? 'recebido' : 'a_receber',
        description: 'Recebimento do salário mensal',
        isRecurring: true,
        recurrenceId: 'rec-salario',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Extra freelance in some months
      if (m % 3 === 0 || m === 11) {
        transactions.push({
          id: uuidv4(),
          type: 'receita',
          title: 'Projeto Freelance Web',
          amount: yr === 2026 ? 1500.0 : 1200.0,
          category: 'Freelances',
          dueDate: `${yr}-${mStr}-18`,
          paymentDate: (isPastOrCurrent && !isCurrentMonth) ? `${yr}-${mStr}-18` : null,
          month: m,
          year: yr,
          status: (isPastOrCurrent && !isCurrentMonth) ? 'recebido' : 'a_receber',
          description: 'Consultoria técnica e desenvolvimento',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Despesa: Aluguel
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Aluguel do Apartamento',
        amount: 1200.0,
        category: 'Moradia',
        dueDate: `${yr}-${mStr}-05`,
        paymentDate: isPastOrCurrent ? `${yr}-${mStr}-05` : null,
        month: m,
        year: yr,
        status: isPastOrCurrent ? 'pago' : 'pendente',
        description: 'Aluguel mensal e condomínio básico',
        isRecurring: true,
        recurrenceId: 'rec-aluguel',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Despesa: Internet
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Internet Fibra 600MB',
        amount: 119.90,
        category: 'Internet',
        dueDate: `${yr}-${mStr}-10`,
        paymentDate: isPastOrCurrent ? `${yr}-${mStr}-10` : null,
        month: m,
        year: yr,
        status: isPastOrCurrent ? 'pago' : 'pendente',
        description: 'Plano fibra residencial',
        isRecurring: true,
        recurrenceId: 'rec-internet',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Despesa: Energia
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Conta de Energia (Enel)',
        amount: Math.round((180 + Math.sin(m) * 40) * 100) / 100,
        category: 'Energia elétrica',
        dueDate: `${yr}-${mStr}-12`,
        paymentDate: (isPastOrCurrent && m !== 11) ? `${yr}-${mStr}-12` : null,
        month: m,
        year: yr,
        status: (isPastOrCurrent && m !== 11) ? 'pago' : 'pendente',
        description: 'Consumo de energia elétrica mensal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Despesa: Supermercado (Alimentação)
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Supermercado Mensal',
        amount: Math.round((750 + (m % 4) * 60) * 100) / 100,
        category: 'Alimentação',
        dueDate: `${yr}-${mStr}-14`,
        paymentDate: (isPastOrCurrent && m !== 11) ? `${yr}-${mStr}-14` : null,
        month: m,
        year: yr,
        status: (isPastOrCurrent && m !== 11) ? 'pago' : 'pendente',
        description: 'Compras de mercado, feira e açougue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Despesa: Netflix
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Netflix & Streaming',
        amount: 55.90,
        category: 'Assinaturas',
        dueDate: `${yr}-${mStr}-15`,
        paymentDate: isPastOrCurrent ? `${yr}-${mStr}-15` : null,
        month: m,
        year: yr,
        status: isPastOrCurrent ? 'pago' : 'pendente',
        description: 'Assinatura padrão 4K',
        isRecurring: true,
        recurrenceId: 'rec-netflix',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Despesa: Academia
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Academia Smart Fit',
        amount: 129.90,
        category: 'Saúde',
        dueDate: `${yr}-${mStr}-20`,
        paymentDate: (isPastOrCurrent && m < 11) ? `${yr}-${mStr}-20` : null,
        month: m,
        year: yr,
        status: (isPastOrCurrent && m < 11) ? 'pago' : 'pendente',
        description: 'Mensalidade academia',
        isRecurring: true,
        recurrenceId: 'rec-academia',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Despesa: Transporte / Combustível
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Combustível e Estacionamento',
        amount: Math.round((280 + (m % 5) * 30) * 100) / 100,
        category: 'Transporte',
        dueDate: `${yr}-${mStr}-22`,
        paymentDate: (isPastOrCurrent && m < 11) ? `${yr}-${mStr}-22` : null,
        month: m,
        year: yr,
        status: (isPastOrCurrent && m < 11) ? 'pago' : 'pendente',
        description: 'Abastecimento veículo e mobilidade',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Despesa: Lazer e Restaurantes
      transactions.push({
        id: uuidv4(),
        type: 'despesa',
        title: 'Jantares & Cinema fim de semana',
        amount: Math.round((220 + (m % 3) * 50) * 100) / 100,
        category: 'Lazer',
        dueDate: `${yr}-${mStr}-25`,
        paymentDate: (isPastOrCurrent && m < 11) ? `${yr}-${mStr}-25` : null,
        month: m,
        year: yr,
        status: (isPastOrCurrent && m < 11) ? 'pago' : 'pendente',
        description: 'Lazer com a família',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Pre-configured monthly budgets
  const budgets: MonthlyBudget[] = [];
  for (const yr of [2025, 2026, 2027]) {
    for (let m = 1; m <= 12; m++) {
      budgets.push(
        { id: uuidv4(), month: m, year: yr, category: 'Moradia', plannedAmount: 1300.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'Alimentação', plannedAmount: 850.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'Transporte', plannedAmount: 350.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'Energia elétrica', plannedAmount: 200.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'Internet', plannedAmount: 120.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'Saúde', plannedAmount: 250.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'Lazer', plannedAmount: 300.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'Assinaturas', plannedAmount: 100.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: uuidv4(), month: m, year: yr, category: 'TOTAL', plannedAmount: 3500.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      );
    }
  }

  return {
    version: 1,
    years,
    userProfile: {
      name: 'Leonardo Silva',
      email: 'leonardo@fincontrol.app',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currency: 'BRL',
      monthlySavingsGoal: 2000.0,
      theme: 'dark',
      pinProtection: false,
    },
    categories: DEFAULT_CATEGORIES,
    budgets,
    recurringRules,
    transactions
  };
}

class Database {
  private data: DatabaseSchema;
  private isWriting = false;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadDatabase();
    this.updateOverdueStatus();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      } catch (err) {
        console.error('Erro ao ler DB existente, gerando fallback/backup:', err);
      }
    }

    const initial = generateSeedData();
    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(data: DatabaseSchema) {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // Auto-flag overdue expenses
  public updateOverdueStatus() {
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    for (const t of this.data.transactions) {
      if (t.type === 'despesa') {
        if (t.status === 'pendente' && t.dueDate < today) {
          t.status = 'atrasado';
          changed = true;
        } else if (t.status === 'atrasado' && t.dueDate >= today) {
          t.status = 'pendente';
          changed = true;
        }
      }
    }

    if (changed) {
      this.save();
    }
  }

  // --- Transactions ---
  public getTransactions(filters?: {
    month?: number;
    year?: number;
    type?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Transaction[] {
    this.updateOverdueStatus();
    return this.data.transactions.filter(t => {
      if (filters?.month && t.month !== Number(filters.month)) return false;
      if (filters?.year && t.year !== Number(filters.year)) return false;
      if (filters?.type && t.type !== filters.type) return false;
      if (filters?.category && t.category !== filters.category) return false;
      if (filters?.status && t.status !== filters.status) return false;
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query);
        const matchCat = t.category.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find(t => t.id === id);
  }

  public createTransaction(t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const today = new Date().toISOString().split('T')[0];
    let status = t.status;
    if (t.type === 'despesa' && status === 'pendente' && t.dueDate < today) {
      status = 'atrasado';
    }

    const newTransaction: Transaction = {
      ...t,
      status,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ensure year is registered in available years
    if (!this.data.years.includes(newTransaction.year)) {
      this.data.years.push(newTransaction.year);
      this.data.years.sort((a, b) => a - b);
    }

    this.data.transactions.push(newTransaction);
    this.save();
    return newTransaction;
  }

  public updateTransaction(id: string, updates: Partial<Transaction>, applyToFutureRecurring = false): Transaction | null {
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const current = this.data.transactions[idx];
    const today = new Date().toISOString().split('T')[0];

    let newStatus = updates.status !== undefined ? updates.status : current.status;
    const dueDate = updates.dueDate || current.dueDate;
    if (current.type === 'despesa' && newStatus === 'pendente' && dueDate < today) {
      newStatus = 'atrasado';
    }

    const updated: Transaction = {
      ...current,
      ...updates,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    this.data.transactions[idx] = updated;

    // If applyToFutureRecurring is true and it belongs to a recurring series
    if (applyToFutureRecurring && current.recurrenceId) {
      const recId = current.recurrenceId;
      for (let i = 0; i < this.data.transactions.length; i++) {
        const item = this.data.transactions[i];
        if (item.recurrenceId === recId && item.id !== id) {
          // Compare dates to see if future
          const isFuture = (item.year > current.year) || (item.year === current.year && item.month >= current.month);
          if (isFuture) {
            this.data.transactions[i] = {
              ...item,
              title: updates.title !== undefined ? updates.title : item.title,
              amount: updates.amount !== undefined ? updates.amount : item.amount,
              category: updates.category !== undefined ? updates.category : item.category,
              description: updates.description !== undefined ? updates.description : item.description,
              updatedAt: new Date().toISOString()
            };
          }
        }
      }
    }

    this.save();
    return updated;
  }

  public deleteTransaction(id: string, scope: 'single' | 'future' | 'all' = 'single'): boolean {
    const item = this.data.transactions.find(t => t.id === id);
    if (!item) return false;

    if (scope === 'single' || !item.recurrenceId) {
      this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    } else if (scope === 'future') {
      const recId = item.recurrenceId;
      this.data.transactions = this.data.transactions.filter(t => {
        if (t.recurrenceId !== recId) return true;
        const isFutureOrCurrent = (t.year > item.year) || (t.year === item.year && t.month >= item.month);
        return !isFutureOrCurrent;
      });
    } else if (scope === 'all') {
      const recId = item.recurrenceId;
      this.data.transactions = this.data.transactions.filter(t => t.recurrenceId !== recId);
    }

    this.save();
    return true;
  }

  // --- Years ---
  public getYears(): number[] {
    return [...this.data.years].sort((a, b) => a - b);
  }

  public addYear(year: number): number[] {
    if (!this.data.years.includes(year)) {
      this.data.years.push(year);
      this.data.years.sort((a, b) => a - b);
      this.save();
    }
    return this.getYears();
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${uuidv4().slice(0, 8)}`,
      isCustom: true
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Recurring Rules ---
  public getRecurringRules(): RecurringRule[] {
    return this.data.recurringRules;
  }

  public createRecurringRule(rule: Omit<RecurringRule, 'id' | 'createdAt'>): RecurringRule {
    const newRule: RecurringRule = {
      ...rule,
      id: `rec-${uuidv4().slice(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.data.recurringRules.push(newRule);
    this.generateRecurringInstancesForActiveYears(newRule);
    this.save();
    return newRule;
  }

  public updateRecurringRule(id: string, updates: Partial<RecurringRule>): RecurringRule | null {
    const idx = this.data.recurringRules.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.recurringRules[idx] = { ...this.data.recurringRules[idx], ...updates };
    this.save();
    return this.data.recurringRules[idx];
  }

  public deleteRecurringRule(id: string, deleteGenerated = false): boolean {
    const idx = this.data.recurringRules.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.recurringRules.splice(idx, 1);

    if (deleteGenerated) {
      this.data.transactions = this.data.transactions.filter(t => t.recurrenceId !== id);
    }

    this.save();
    return true;
  }

  // Generates recurrence instances for a specific rule across active years without duplicates
  public generateRecurringInstancesForActiveYears(rule: RecurringRule) {
    const startYear = parseInt(rule.startDate.substring(0, 4));
    const startMonth = parseInt(rule.startDate.substring(5, 7));
    const endYear = rule.endDate ? parseInt(rule.endDate.substring(0, 4)) : 9999;
    const endMonth = rule.endDate ? parseInt(rule.endDate.substring(5, 7)) : 12;

    for (const yr of this.data.years) {
      for (let m = 1; m <= 12; m++) {
        // Date check
        if (yr < startYear || (yr === startYear && m < startMonth)) continue;
        if (yr > endYear || (yr === endYear && m > endMonth)) continue;

        // Interval check
        if (rule.frequency === 'anual') {
          if (m !== startMonth) continue;
        } else if (rule.frequency === 'personalizada') {
          const totalMonthsDiff = (yr - startYear) * 12 + (m - startMonth);
          if (totalMonthsDiff % (rule.intervalMonths || 1) !== 0) continue;
        }

        // Check if already exists
        const exists = this.data.transactions.some(
          t => t.recurrenceId === rule.id && t.year === yr && t.month === m
        );

        if (!exists) {
          const day = Math.min(rule.dueDay || 10, 28).toString().padStart(2, '0');
          const mStr = m.toString().padStart(2, '0');
          const dueDate = `${yr}-${mStr}-${day}`;
          const today = new Date().toISOString().split('T')[0];

          let status = rule.type === 'despesa' ? 'pendente' : 'a_receber';
          if (rule.type === 'despesa' && dueDate < today) {
            status = 'atrasado';
          }

          this.data.transactions.push({
            id: uuidv4(),
            type: rule.type,
            title: rule.title,
            amount: rule.amount,
            category: rule.category,
            dueDate,
            paymentDate: null,
            month: m,
            year: yr,
            status: status as any,
            description: rule.description,
            isRecurring: true,
            recurrenceId: rule.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  }

  // --- Budgets ---
  public getBudgets(month?: number, year?: number): MonthlyBudget[] {
    return this.data.budgets.filter(b => {
      if (month && b.month !== Number(month)) return false;
      if (year && b.year !== Number(year)) return false;
      return true;
    });
  }

  public setBudget(budget: { month: number; year: number; category: string; plannedAmount: number }): MonthlyBudget {
    const existingIdx = this.data.budgets.findIndex(
      b => b.month === budget.month && b.year === budget.year && b.category === budget.category
    );

    if (existingIdx !== -1) {
      this.data.budgets[existingIdx].plannedAmount = budget.plannedAmount;
      this.data.budgets[existingIdx].updatedAt = new Date().toISOString();
      this.save();
      return this.data.budgets[existingIdx];
    } else {
      const newBudget: MonthlyBudget = {
        id: uuidv4(),
        month: budget.month,
        year: budget.year,
        category: budget.category,
        plannedAmount: budget.plannedAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.budgets.push(newBudget);
      this.save();
      return newBudget;
    }
  }

  // --- User Profile ---
  public getUserProfile(): UserProfile {
    return this.data.userProfile;
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.data.userProfile = { ...this.data.userProfile, ...updates };
    this.save();
    return this.data.userProfile;
  }

  // --- Full Backup / Restore / Reset ---
  public getFullDump(): DatabaseSchema {
    return this.data;
  }

  public restoreFromDump(dump: DatabaseSchema): boolean {
    if (!dump.transactions || !dump.categories || !dump.years) {
      throw new Error('Formato de backup inválido');
    }
    this.data = dump;
    this.save();
    return true;
  }

  public resetToSampleData(): DatabaseSchema {
    this.data = generateSeedData();
    this.save();
    return this.data;
  }

  public clearAllData(): DatabaseSchema {
    this.data = {
      version: 1,
      years: [new Date().getFullYear()],
      userProfile: this.data.userProfile,
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      recurringRules: [],
      transactions: []
    };
    this.save();
    return this.data;
  }
}

export const db = new Database();
