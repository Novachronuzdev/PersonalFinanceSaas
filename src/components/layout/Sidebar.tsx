import React from 'react';
import { useFinance, ActiveTab } from '../../context/FinanceContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import {
  LayoutDashboard,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  PieChart,
  Repeat,
  BarChart3,
  History,
  Settings,
  Moon,
  Sun,
  ShieldCheck,
  Target
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, userProfile, summary } = useFinance();
  const { theme, toggleTheme } = useTheme();

  const navItems: Array<{ tab: ActiveTab; label: string; icon: React.ElementType; badge?: string }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'months', label: 'Meses & Anos', icon: CalendarDays },
    { tab: 'expenses', label: 'Despesas', icon: TrendingDown, badge: summary && summary.pendingExpenses > 0 ? '!' : undefined },
    { tab: 'revenues', label: 'Receitas', icon: TrendingUp },
    { tab: 'budget', label: 'Planejamento & Teto', icon: PieChart },
    { tab: 'recurring', label: 'Despesas Recorrentes', icon: Repeat },
    { tab: 'reports', label: 'Relatórios Anuais', icon: BarChart3 },
    { tab: 'history', label: 'Histórico & Extrato', icon: History },
    { tab: 'settings', label: 'Ajustes & Backup', icon: Settings },
  ];

  const savingsGoal = userProfile?.monthlySavingsGoal || 2000;
  const currentSavings = summary ? Math.max(summary.balance, 0) : 0;
  const savingsPercent = Math.min(Math.round((currentSavings / savingsGoal) * 100), 100);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div>
          <div className="flex items-center gap-3 px-6 h-18 border-b border-slate-100 dark:border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              F
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                FinControl
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                SaaS Financeiro
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;

              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info: Savings target & theme toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {/* Savings Target Mini Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" /> Meta de Economia
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{savingsPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${savingsPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{formatCurrency(currentSavings)}</span>
              <span>{formatCurrency(savingsGoal)}</span>
            </div>
          </div>

          {/* Theme switcher & quick user info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 overflow-hidden">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-tight truncate max-w-[90px]">
                  {userProfile?.name || 'Usuário'}
                </p>
                <span className="text-[10px] text-emerald-500 flex items-center gap-0.5 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Seguro
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
