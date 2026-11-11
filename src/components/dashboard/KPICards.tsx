import React from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Clock,
  AlertCircle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const KPICards: React.FC = () => {
  const { summary } = useFinance();

  if (!summary) return null;

  const {
    totalRevenues,
    totalExpenses,
    balance,
    incomeCommittedPercent,
    pendingExpenses,
    overdueExpenses,
    paidExpenses,
    receivedRevenues,
    plannedExpenses,
    budgetDifference
  } = summary;

  // Health indicator based on committed income
  let healthLabel = 'Saudável';
  let healthColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (incomeCommittedPercent > 80) {
    healthLabel = 'Crítico';
    healthColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  } else if (incomeCommittedPercent > 60) {
    healthLabel = 'Moderado';
    healthColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Receitas do Mês */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Receitas do Mês
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-2">
          {formatCurrency(totalRevenues)}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Recebido: {formatCurrency(receivedRevenues)}
          </span>
        </div>
      </div>

      {/* 2. Despesas do Mês */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Despesas do Mês
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-2">
          {formatCurrency(totalExpenses)}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400">
            Pago: {formatCurrency(paidExpenses)}
          </span>
          {overdueExpenses > 0 ? (
            <span className="text-rose-500 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Atrasado: {formatCurrency(overdueExpenses)}
            </span>
          ) : (
            <span className="text-slate-400 font-medium">
              Previsto: {formatCurrency(pendingExpenses)}
            </span>
          )}
        </div>
      </div>

      {/* 3. Saldo Restante */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Saldo Restante
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <p className={`text-2xl font-black font-mono tracking-tight mt-2 ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {formatCurrency(balance)}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span>{balance >= 0 ? 'Superávit no período' : 'Déficit no período'}</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {totalRevenues > 0 ? `${Math.round(((totalRevenues - totalExpenses) / totalRevenues) * 100)}% margem` : '-'}
          </span>
        </div>
      </div>

      {/* 4. Renda Comprometida */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Renda Comprometida
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${healthColor}`}>
            {healthLabel}
          </span>
        </div>
        <p className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-2">
          {formatPercent(incomeCommittedPercent)}
        </p>
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                incomeCommittedPercent > 80 ? 'bg-rose-500' : incomeCommittedPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(incomeCommittedPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Despesas Previstas (Pendentes) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Despesas Previstas
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-2">
          {formatCurrency(pendingExpenses)}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span>A liquidar no mês</span>
          {overdueExpenses > 0 ? (
            <span className="text-rose-500 font-bold">Atenção aos boletos!</span>
          ) : (
            <span className="text-emerald-500 font-medium">Contas em dia</span>
          )}
        </div>
      </div>
    </div>
  );
};
