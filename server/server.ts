import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';
import {
  Transaction,
  MonthSummary,
  AnnualReport,
  YearComparison
} from './types.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Helper to compute Month Summary
function computeMonthSummary(month: number, year: number): MonthSummary {
  const transactions = db.getTransactions({ month, year });
  const budgets = db.getBudgets(month, year);

  let totalRevenues = 0;
  let receivedRevenues = 0;
  let pendingRevenues = 0;

  let totalExpenses = 0;
  let paidExpenses = 0;
  let pendingExpenses = 0;
  let overdueExpenses = 0;

  for (const t of transactions) {
    if (t.type === 'receita') {
      totalRevenues += t.amount;
      if (t.status === 'recebido') {
        receivedRevenues += t.amount;
      } else {
        pendingRevenues += t.amount;
      }
    } else if (t.type === 'despesa') {
      totalExpenses += t.amount;
      if (t.status === 'pago') {
        paidExpenses += t.amount;
      } else if (t.status === 'atrasado') {
        overdueExpenses += t.amount;
        pendingExpenses += t.amount;
      } else {
        pendingExpenses += t.amount;
      }
    }
  }

  const balance = totalRevenues - totalExpenses;
  const effectiveBalance = receivedRevenues - paidExpenses;

  const incomeCommittedPercent = totalRevenues > 0
    ? Math.min(Math.round((totalExpenses / totalRevenues) * 1000) / 10, 999)
    : (totalExpenses > 0 ? 100 : 0);

  // Planned budget: either total category 'TOTAL' or sum of category budgets
  const totalBudgetSetting = budgets.find(b => b.category === 'TOTAL');
  const categoryBudgetsSum = budgets
    .filter(b => b.category !== 'TOTAL')
    .reduce((sum, b) => sum + b.plannedAmount, 0);

  const plannedExpenses = totalBudgetSetting
    ? totalBudgetSetting.plannedAmount
    : categoryBudgetsSum;

  const budgetDifference = plannedExpenses - totalExpenses;
  const budgetUsedPercent = plannedExpenses > 0
    ? Math.min(Math.round((totalExpenses / plannedExpenses) * 1000) / 10, 999)
    : 0;

  return {
    month,
    year,
    totalRevenues: Math.round(totalRevenues * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    paidExpenses: Math.round(paidExpenses * 100) / 100,
    pendingExpenses: Math.round(pendingExpenses * 100) / 100,
    overdueExpenses: Math.round(overdueExpenses * 100) / 100,
    receivedRevenues: Math.round(receivedRevenues * 100) / 100,
    pendingRevenues: Math.round(pendingRevenues * 100) / 100,
    balance: Math.round(balance * 100) / 100,
    effectiveBalance: Math.round(effectiveBalance * 100) / 100,
    incomeCommittedPercent,
    plannedExpenses: Math.round(plannedExpenses * 100) / 100,
    budgetDifference: Math.round(budgetDifference * 100) / 100,
    budgetUsedPercent
  };
}

// Helper to compute Annual Report
function computeAnnualReport(year: number): AnnualReport {
  const transactions = db.getTransactions({ year });
  const categories = db.getCategories();

  let totalRevenues = 0;
  let totalExpenses = 0;

  const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: MONTH_NAMES[i],
    revenues: 0,
    expenses: 0,
    balance: 0
  }));

  const categoryExpensesMap = new Map<string, number>();

  for (const t of transactions) {
    const mIdx = t.month - 1;
    if (mIdx >= 0 && mIdx < 12) {
      if (t.type === 'receita') {
        totalRevenues += t.amount;
        monthlyBreakdown[mIdx].revenues += t.amount;
      } else if (t.type === 'despesa') {
        totalExpenses += t.amount;
        monthlyBreakdown[mIdx].expenses += t.amount;

        const currentCatAmount = categoryExpensesMap.get(t.category) || 0;
        categoryExpensesMap.set(t.category, currentCatAmount + t.amount);
      }
    }
  }

  // Calculate balances per month
  monthlyBreakdown.forEach(m => {
    m.balance = Math.round((m.revenues - m.expenses) * 100) / 100;
    m.revenues = Math.round(m.revenues * 100) / 100;
    m.expenses = Math.round(m.expenses * 100) / 100;
  });

  // Highest & lowest expense month
  let highestExpenseMonth = { month: 1, amount: monthlyBreakdown[0].expenses };
  let lowestExpenseMonth = { month: 1, amount: monthlyBreakdown[0].expenses };

  monthlyBreakdown.forEach(m => {
    if (m.expenses > highestExpenseMonth.amount) {
      highestExpenseMonth = { month: m.month, amount: m.expenses };
    }
    if (m.expenses < lowestExpenseMonth.amount) {
      lowestExpenseMonth = { month: m.month, amount: m.expenses };
    }
  });

  // Top category
  let topExpenseCategory = { category: 'Nenhuma', amount: 0, percentage: 0 };
  let maxCatAmount = 0;

  const categoryBreakdown: Array<{ category: string; amount: number; percentage: number; color: string }> = [];

  categoryExpensesMap.forEach((amount, catName) => {
    const catObj = categories.find(c => c.name === catName);
    const color = catObj ? catObj.color : '#94a3b8';
    const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0;

    categoryBreakdown.push({
      category: catName,
      amount: Math.round(amount * 100) / 100,
      percentage,
      color
    });

    if (amount > maxCatAmount) {
      maxCatAmount = amount;
      topExpenseCategory = {
        category: catName,
        amount: Math.round(amount * 100) / 100,
        percentage
      };
    }
  });

  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  return {
    year,
    totalRevenues: Math.round(totalRevenues * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    accumulatedBalance: Math.round((totalRevenues - totalExpenses) * 100) / 100,
    monthlyAverageExpenses: Math.round((totalExpenses / 12) * 100) / 100,
    monthlyAverageRevenues: Math.round((totalRevenues / 12) * 100) / 100,
    highestExpenseMonth,
    lowestExpenseMonth,
    topExpenseCategory,
    monthlyBreakdown,
    categoryBreakdown
  };
}

// ----------------- ROUTES -----------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Years
app.get('/api/years', (req: Request, res: Response) => {
  res.json(db.getYears());
});

app.post('/api/years', (req: Request, res: Response) => {
  const { year } = req.body;
  if (!year || isNaN(Number(year))) {
    return res.status(400).json({ error: 'Ano inválido' });
  }
  const years = db.addYear(Number(year));
  res.json(years);
});

// Categories
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { name, type, icon, color } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
  }
  const cat = db.addCategory({
    name,
    type,
    icon: icon || 'Tag',
    color: color || '#6366f1'
  });
  res.status(201).json(cat);
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Categoria não encontrada' });
  res.json(updated);
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const deleted = db.deleteCategory(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Categoria não encontrada' });
  res.json({ success: true });
});

// Transactions
app.get('/api/transactions', (req: Request, res: Response) => {
  const { month, year, type, category, status, search } = req.query;
  const items = db.getTransactions({
    month: month ? Number(month) : undefined,
    year: year ? Number(year) : undefined,
    type: type as string,
    category: category as string,
    status: status as string,
    search: search as string
  });
  res.json(items);
});

app.post('/api/transactions', (req: Request, res: Response) => {
  const { title, amount, type, category, dueDate, paymentDate, month, year, status, description, isRecurring, recurrenceId } = req.body;
  if (!title || amount === undefined || !type || !category || !dueDate || !month || !year) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const transaction = db.createTransaction({
    title,
    amount: Number(amount),
    type,
    category,
    dueDate,
    paymentDate: paymentDate || null,
    month: Number(month),
    year: Number(year),
    status: status || (type === 'despesa' ? 'pendente' : 'a_receber'),
    description,
    isRecurring: !!isRecurring,
    recurrenceId: recurrenceId || null
  });

  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', (req: Request, res: Response) => {
  const applyToFutureRecurring = req.query.applyToFutureRecurring === 'true';
  const updated = db.updateTransaction(req.params.id, req.body, applyToFutureRecurring);
  if (!updated) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json(updated);
});

app.patch('/api/transactions/:id/toggle-status', (req: Request, res: Response) => {
  const transaction = db.getTransactionById(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Transação não encontrada' });

  const today = new Date().toISOString().split('T')[0];
  let newStatus = transaction.status;
  let paymentDate = transaction.paymentDate;

  if (transaction.type === 'despesa') {
    if (transaction.status === 'pago') {
      newStatus = transaction.dueDate < today ? 'atrasado' : 'pendente';
      paymentDate = null;
    } else {
      newStatus = 'pago';
      paymentDate = today;
    }
  } else {
    if (transaction.status === 'recebido') {
      newStatus = 'a_receber';
      paymentDate = null;
    } else {
      newStatus = 'recebido';
      paymentDate = today;
    }
  }

  const updated = db.updateTransaction(transaction.id, { status: newStatus, paymentDate });
  res.json(updated);
});

app.delete('/api/transactions/:id', (req: Request, res: Response) => {
  const scope = (req.query.scope as 'single' | 'future' | 'all') || 'single';
  const deleted = db.deleteTransaction(req.params.id, scope);
  if (!deleted) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json({ success: true });
});

// Recurring Rules
app.get('/api/recurring', (req: Request, res: Response) => {
  res.json(db.getRecurringRules());
});

app.post('/api/recurring', (req: Request, res: Response) => {
  const { title, amount, type, category, frequency, intervalMonths, startDate, endDate, dueDay, description, active } = req.body;
  if (!title || !amount || !type || !category || !frequency || !startDate) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const rule = db.createRecurringRule({
    title,
    amount: Number(amount),
    type,
    category,
    frequency,
    intervalMonths: intervalMonths ? Number(intervalMonths) : 1,
    startDate,
    endDate: endDate || null,
    dueDay: dueDay ? Number(dueDay) : 10,
    description,
    active: active !== undefined ? !!active : true
  });

  res.status(201).json(rule);
});

app.put('/api/recurring/:id', (req: Request, res: Response) => {
  const updated = db.updateRecurringRule(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Regra recorrente não encontrada' });
  res.json(updated);
});

app.delete('/api/recurring/:id', (req: Request, res: Response) => {
  const deleteGenerated = req.query.deleteGenerated === 'true';
  const deleted = db.deleteRecurringRule(req.params.id, deleteGenerated);
  if (!deleted) return res.status(404).json({ error: 'Regra recorrente não encontrada' });
  res.json({ success: true });
});

// Budgets
app.get('/api/budgets', (req: Request, res: Response) => {
  const { month, year } = req.query;
  const budgets = db.getBudgets(
    month ? Number(month) : undefined,
    year ? Number(year) : undefined
  );
  res.json(budgets);
});

app.post('/api/budgets', (req: Request, res: Response) => {
  const { month, year, category, plannedAmount } = req.body;
  if (!month || !year || !category || plannedAmount === undefined) {
    return res.status(400).json({ error: 'Dados de orçamento incompletos' });
  }
  const budget = db.setBudget({
    month: Number(month),
    year: Number(year),
    category,
    plannedAmount: Number(plannedAmount)
  });
  res.json(budget);
});

// Dashboard Summary for a Month & Year
app.get('/api/summary', (req: Request, res: Response) => {
  const month = Number(req.query.month) || (new Date().getMonth() + 1);
  const year = Number(req.query.year) || new Date().getFullYear();
  const summary = computeMonthSummary(month, year);
  res.json(summary);
});

// Annual Reports
app.get('/api/reports/annual', (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const report = computeAnnualReport(year);
  res.json(report);
});

// Compare two years
app.get('/api/reports/compare', (req: Request, res: Response) => {
  const year1 = Number(req.query.year1) || (new Date().getFullYear() - 1);
  const year2 = Number(req.query.year2) || new Date().getFullYear();

  const report1 = computeAnnualReport(year1);
  const report2 = computeAnnualReport(year2);

  const revDiff = report1.totalRevenues > 0
    ? Math.round(((report2.totalRevenues - report1.totalRevenues) / report1.totalRevenues) * 1000) / 10
    : 0;

  const expDiff = report1.totalExpenses > 0
    ? Math.round(((report2.totalExpenses - report1.totalExpenses) / report1.totalExpenses) * 1000) / 10
    : 0;

  const balDiff = report1.accumulatedBalance !== 0
    ? Math.round(((report2.accumulatedBalance - report1.accumulatedBalance) / Math.abs(report1.accumulatedBalance)) * 1000) / 10
    : 0;

  const monthlyComparison = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: MONTH_NAMES[i],
    year1Expenses: report1.monthlyBreakdown[i].expenses,
    year2Expenses: report2.monthlyBreakdown[i].expenses,
    year1Revenues: report1.monthlyBreakdown[i].revenues,
    year2Revenues: report2.monthlyBreakdown[i].revenues,
  }));

  const comparison: YearComparison = {
    year1,
    year2,
    metrics: {
      year1Revenues: report1.totalRevenues,
      year2Revenues: report2.totalRevenues,
      revenueDiffPercent: revDiff,
      year1Expenses: report1.totalExpenses,
      year2Expenses: report2.totalExpenses,
      expenseDiffPercent: expDiff,
      year1Balance: report1.accumulatedBalance,
      year2Balance: report2.accumulatedBalance,
      balanceDiffPercent: balDiff
    },
    monthlyComparison
  };

  res.json(comparison);
});

// User Profile
app.get('/api/user/profile', (req: Request, res: Response) => {
  res.json(db.getUserProfile());
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const updated = db.updateUserProfile(req.body);
  res.json(updated);
});

// Backup & Restore
app.get('/api/backup', (req: Request, res: Response) => {
  const dump = db.getFullDump();
  res.setHeader('Content-Disposition', `attachment; filename="fincontrol_backup_${new Date().toISOString().split('T')[0]}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(dump, null, 2));
});

app.post('/api/restore', (req: Request, res: Response) => {
  try {
    db.restoreFromDump(req.body);
    res.json({ success: true, message: 'Dados restaurados com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao restaurar backup' });
  }
});

app.post('/api/reset-sample', (req: Request, res: Response) => {
  const sample = db.resetToSampleData();
  res.json({ success: true, message: 'Dados de exemplo restaurados' });
});

app.post('/api/clear-all', (req: Request, res: Response) => {
  db.clearAllData();
  res.json({ success: true, message: 'Todos os dados foram reiniciados' });
});

// Serve frontend build if exists
const DIST_PATH = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.use((req: Request, res: Response, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Server API FinControl rodando na porta ${PORT}`);
});
