import React from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { MONTH_NAMES } from '../../utils/formatters.js';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Menu,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    years,
    setIsAddYearModalOpen,
    openCreateExpenseModal,
    openCreateRevenueModal,
    celebrate
  } = useFinance();

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Menu Button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Date Navigator (Month & Year) */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-950/70 p-1 sm:p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none px-1.5 py-0.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {m}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={e => {
              const val = e.target.value;
              if (val === 'ADD_NEW') {
                setIsAddYearModalOpen(true);
              } else {
                setSelectedYear(Number(val));
              }
            }}
            className="bg-transparent text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer focus:outline-none px-1.5 py-0.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
          >
            {years.map(yr => (
              <option key={yr} value={yr} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {yr}
              </option>
            ))}
            <option value="ADD_NEW" className="bg-white dark:bg-slate-900 text-emerald-500 font-bold">
              + Adicionar Ano...
            </option>
          </select>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action CTA Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Nova Receita Button */}
        <button
          onClick={openCreateRevenueModal}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800/60 transition shadow-xs"
        >
          <ArrowUpRight className="w-4 h-4 text-teal-500" />
          <span>+ Receita</span>
        </button>

        {/* Nova Despesa Button (Primary) */}
        <button
          onClick={openCreateExpenseModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition transform active:scale-95"
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>+ Despesa</span>
        </button>

        {/* Quick celebratory spark button */}
        <button
          onClick={celebrate}
          className="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Celebrar conquistas financeiras!"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
