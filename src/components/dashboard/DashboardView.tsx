import React from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { KPICards } from './KPICards.js';
import { MonthlyEvolutionChart } from './MonthlyEvolutionChart.js';
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart.js';
import { PendingBillsWidget } from './PendingBillsWidget.js';
import { getMonthName, formatCurrency, formatPercent } from '../../utils/formatters.js';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { selectedMonth, selectedYear, summary, setActiveTab } = useFinance();

  const monthName = getMonthName(selectedMonth);

  return (
    <div className="space-y-6">
      {/* Title & Period Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Painel Financeiro
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visão detalhada do seu fluxo financeiro em{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              {monthName} de {selectedYear}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('months')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Ver Grade de 12 Meses
          </button>
        </div>
      </div>

      {/* KPI Indicators */}
      <KPICards />

      {/* Budget Overrun Warning Banner if applicable */}
      {summary && summary.plannedExpenses > 0 && summary.totalExpenses > summary.plannedExpenses && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-900 dark:text-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Atenção: Orçamento Mensal Ultrapassado!
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Você já gastou {formatCurrency(summary.totalExpenses)}, excedendo o teto planejado de{' '}
                {formatCurrency(summary.plannedExpenses)} em{' '}
                <strong>{formatCurrency(Math.abs(summary.budgetDifference))}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budget')}
            className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-500 shrink-0 transition"
          >
            Ajustar Orçamento
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Evolução Financeira em {selectedYear}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Acompanhamento mensal de receitas, despesas e saldo acumulado
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Relatório anual <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MonthlyEvolutionChart />
        </div>

        {/* Expenses by Category (1 col) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Distribuição de Gastos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Categorias em {monthName}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Detalhar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ExpensesByCategoryChart />
        </div>
      </div>

      {/* Bottom Row: Pending Bills + Comparison Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingBillsWidget />

        {/* Comparison & Budget Overview Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Comparativo Financeiro ({monthName})
              </h4>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Gerenciar Orçamento <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Receitas vs Despesas comparison progress */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <span>Equilíbrio Receitas vs Despesas</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    {summary ? formatCurrency(summary.totalExpenses) : '0'} de {summary ? formatCurrency(summary.totalRevenues) : '0'}
                  </span>
                </div>
                <div className="w-full bg-emerald-500/20 dark:bg-emerald-500/10 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(summary?.incomeCommittedPercent || 0, 100)}%` }}
                    title={`Despesas: ${summary?.incomeCommittedPercent || 0}%`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    ● Despesas: {summary?.incomeCommittedPercent || 0}%
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    ● Sobra / Margem: {Math.max(100 - (summary?.incomeCommittedPercent || 0), 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Planned Budget status */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  <span>Teto Orçamentário Definido:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    {summary ? formatCurrency(summary.plannedExpenses) : 'R$ 0,00'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>Saldo disponível no orçamento:</span>
                  <span className={`font-bold font-mono ${summary && summary.budgetDifference >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {summary ? formatCurrency(summary.budgetDifference) : 'R$ 0,00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cálculos automáticos e em tempo real
            </span>
            <span className="font-mono text-[11px]">{selectedYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
