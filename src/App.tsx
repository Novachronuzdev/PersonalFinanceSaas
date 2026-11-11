import React, { useState } from 'react';
import { useFinance } from './context/FinanceContext.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { ToastContainer } from './components/ui/Toast.js';
import { ExpenseModal } from './components/expenses/ExpenseModal.js';
import { RevenueModal } from './components/revenues/RevenueModal.js';
import { AddYearModal } from './components/ui/AddYearModal.js';
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal.js';

// Views
import { DashboardView } from './components/dashboard/DashboardView.js';
import { MonthsGridView } from './components/months/MonthsGridView.js';
import { ExpenseListView } from './components/expenses/ExpenseListView.js';
import { RevenueListView } from './components/revenues/RevenueListView.js';
import { BudgetView } from './components/budget/BudgetView.js';
import { RecurringManagerView } from './components/recurring/RecurringManagerView.js';
import { AnnualReportView } from './components/reports/AnnualReportView.js';
import { HistoryView } from './components/history/HistoryView.js';
import { SettingsView } from './components/settings/SettingsView.js';

export const App: React.FC = () => {
  const { activeTab, loading } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'months':
        return <MonthsGridView />;
      case 'expenses':
        return <ExpenseListView />;
      case 'revenues':
        return <RevenueListView />;
      case 'budget':
        return <BudgetView />;
      case 'recurring':
        return <RecurringManagerView />;
      case 'reports':
        return <AnnualReportView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header with Month/Year Switcher & Quick Actions */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ExpenseModal />
      <RevenueModal />
      <AddYearModal />
      <DeleteConfirmModal />
      <ToastContainer />
    </div>
  );
};
