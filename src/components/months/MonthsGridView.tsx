import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { api } from '../../services/api.js';
import { AnnualReport } from '../../types/finance.js';
import { formatCurrency, MONTH_NAMES } from '../../utils/formatters.js';
import {
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Wallet
} from 'lucide-react';

export const MonthsGridView: React.FC = () => {
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    years,
    setIsAddYearModalOpen,
    openCreateExpenseModal
  } = useFinance();

  const [report, setReport] = useState<AnnualReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchYearData = async () => {
      try {
        setLoading(true);
        const data = await api.getAnnualReport(selectedYear);
        if (isMounted) setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchYearData();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  const handleSelectMonth = (monthIndex: number, destination: 'dashboard' | 'expenses') => {
    setSelectedMonth(monthIndex);
    setActiveTab(destination);
  };

  const handleAddExpenseForMonth = (monthIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMonth(monthIndex);
    openCreateExpenseModal();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-emerald-500" />
            Controle Mensal & Anual
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize os 12 meses de {selectedYear} com controle financeiro independente por período
          </p>
        </div>

        {/* Year Selector & Add Year Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Ano:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-bold text-base text-emerald-600 dark:text-emerald-400 cursor-pointer focus:outline-none"
            >
              {years.map(yr => (
                <option key={yr} value={yr} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddYearModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Ano</span>
          </button>
        </div>
      </div>

      {/* Annual Summary Highlights Bar */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Receitas ({selectedYear})</span>
              <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                {formatCurrency(report.totalRevenues)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Despesas ({selectedYear})</span>
              <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                {formatCurrency(report.totalExpenses)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.accumulatedBalance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">Saldo Acumulado no Ano</span>
              <p className={`text-lg font-black font-mono ${report.accumulatedBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(report.accumulatedBalance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 12 Months */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTH_NAMES.map((name, idx) => {
          const monthNum = idx + 1;
          const isSelected = selectedMonth === monthNum;
          const monthData = report?.monthlyBreakdown[idx] || { revenues: 0, expenses: 0, balance: 0 };
          const isPositive = monthData.balance >= 0;

          return (
            <div
              key={name}
              onClick={() => handleSelectMonth(monthNum, 'dashboard')}
              className={`group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Header: Month Name & Active Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center font-mono">
                    {monthNum.toString().padStart(2, '0')}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {name}
                  </h3>
                </div>

                {isSelected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Ativo
                  </span>
                )}
              </div>

              {/* Financial Metrics of this month */}
              <div className="mt-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Receitas:
                  </span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {formatCurrency(monthData.revenues)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Despesas:
                  </span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {formatCurrency(monthData.expenses)}
                  </span>
                </div>

                {/* Balance & mini indicator */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Saldo Restante:
                  </span>
                  <span className={`text-sm font-black font-mono ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrency(monthData.balance)}
                  </span>
                </div>
              </div>

              {/* Progress bar of revenue consumed */}
              <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    monthData.revenues > 0 && (monthData.expenses / monthData.revenues) > 1
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${monthData.revenues > 0 ? Math.min((monthData.expenses / monthData.revenues) * 100, 100) : 0}%`
                  }}
                />
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleAddExpenseForMonth(monthNum, e)}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition"
                  title="Cadastrar despesa neste mês"
                >
                  <Plus className="w-3.5 h-3.5" /> Despesa
                </button>

                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>Abrir mês</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
