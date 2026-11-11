import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters.js';
import { Transaction } from '../../types/finance.js';
import {
  TrendingDown,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Repeat,
  Edit2,
  Trash2,
  Filter,
  Check
} from 'lucide-react';

export const ExpenseListView: React.FC = () => {
  const {
    transactions,
    selectedMonth,
    selectedYear,
    categories,
    openCreateExpenseModal,
    openEditExpenseModal,
    setDeleteConfirmModal,
    toggleTransactionStatus
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pago' | 'pendente' | 'atrasado'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter only expenses for active month & year
  const allExpenses = transactions.filter(t => t.type === 'despesa');

  const filteredExpenses = allExpenses.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  // Calculate totals
  const totalAmount = allExpenses.reduce((sum, t) => sum + t.amount, 0);
  const paidAmount = allExpenses.filter(t => t.status === 'pago').reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = allExpenses.filter(t => t.status === 'pendente').reduce((sum, t) => sum + t.amount, 0);
  const overdueAmount = allExpenses.filter(t => t.status === 'atrasado').reduce((sum, t) => sum + t.amount, 0);

  const expenseCategories = categories.filter(c => c.type === 'despesa');

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            Controle de Despesas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gerenciamento de gastos de {getMonthName(selectedMonth)} de {selectedYear}
          </p>
        </div>

        <button
          onClick={openCreateExpenseModal}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/25 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Mini Summary Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total de Despesas</span>
          <p className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalAmount)}
          </p>
          <span className="text-xs text-slate-500">{allExpenses.length} lançamentos</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-emerald-500">Total Pago</span>
          <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(paidAmount)}
          </p>
          <span className="text-xs text-slate-500">
            {totalAmount > 0 ? `${Math.round((paidAmount / totalAmount) * 100)}% quitado` : '0%'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-amber-500">A Pagar (Pendente)</span>
          <p className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(pendingAmount)}
          </p>
          <span className="text-xs text-slate-500">No prazo de vencimento</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-rose-500">Em Atraso</span>
          <p className="text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(overdueAmount)}
          </p>
          <span className="text-xs text-slate-500">
            {overdueAmount > 0 ? 'Vencidas não pagas' : 'Nenhuma atrasada'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou observação..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="pago">Apenas Pagos</option>
            <option value="pendente">Apenas Pendentes</option>
            <option value="atrasado">Apenas Atrasados</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas Categorias</option>
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Nenhuma despesa encontrada
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tente alterar os filtros ou clique em "+ Nova Despesa" para cadastrar uma saída.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Despesa</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4 text-right w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredExpenses.map(item => {
                  const isPaid = item.status === 'pago';
                  const isOverdue = item.status === 'atrasado';
                  const isRecurring = !!item.recurrenceId;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group ${
                        isPaid ? 'opacity-85' : ''
                      }`}
                    >
                      {/* Checkbox / Quick Toggle Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleTransactionStatus(item.id)}
                          className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center transition ${
                            isPaid
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : isOverdue
                              ? 'border-rose-400 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                              : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                          }`}
                          title={isPaid ? 'Clique para desmarcar como pago' : 'Clique para marcar como pago'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Title & Recurring Tag & Description */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-slate-900 dark:text-white ${isPaid ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                            {item.title}
                          </span>
                          {isRecurring && (
                            <span
                              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-0.5"
                              title="Despesa recorrente"
                            >
                              <Repeat className="w-2.5 h-2.5" /> Recorrente
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {formatDate(item.dueDate)}
                      </td>

                      {/* Payment Date & Status Badge */}
                      <td className="py-3 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Pago {item.paymentDate ? `(${formatDate(item.paymentDate)})` : ''}
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" /> Atrasado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-black font-mono text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditExpenseModal(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Editar despesa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmModal({ open: true, transaction: item })}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Excluir despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
