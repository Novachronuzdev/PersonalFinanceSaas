import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters.js';
import {
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Wallet,
  ArrowUpRight
} from 'lucide-react';

export const RevenueListView: React.FC = () => {
  const {
    transactions,
    selectedMonth,
    selectedYear,
    categories,
    openCreateRevenueModal,
    openEditRevenueModal,
    setDeleteConfirmModal,
    toggleTransactionStatus
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const allRevenues = transactions.filter(t => t.type === 'receita');

  const filteredRevenues = allRevenues.filter(item => {
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

  const totalRevenues = allRevenues.reduce((sum, r) => sum + r.amount, 0);
  const receivedAmount = allRevenues.filter(r => r.status === 'recebido').reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = allRevenues.filter(r => r.status === 'a_receber').reduce((sum, r) => sum + r.amount, 0);

  const revenueCategories = categories.filter(c => c.type === 'receita');

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            Controle de Receitas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Entradas financeiras em {getMonthName(selectedMonth)} de {selectedYear}
          </p>
        </div>

        <button
          onClick={openCreateRevenueModal}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-600/25 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* Mini Summary Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total de Entradas</span>
          <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalRevenues)}
          </p>
          <span className="text-xs text-slate-500">{allRevenues.length} recebimentos previstos</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-teal-500">Recebido na Conta</span>
          <p className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
            {formatCurrency(receivedAmount)}
          </p>
          <span className="text-xs text-slate-500">
            {totalRevenues > 0 ? `${Math.round((receivedAmount / totalRevenues) * 100)}% já liquidado` : '0%'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-amber-500">A Receber (Previsto)</span>
          <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(pendingAmount)}
          </p>
          <span className="text-xs text-slate-500">Aguardando entrada</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição ou fonte..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="all">Todas Categorias</option>
          {revenueCategories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {filteredRevenues.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Nenhuma receita registrada
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Cadastre suas fontes de renda como salário, freelances e dividendos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Receita</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data Recebimento</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4 text-right w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredRevenues.map(item => {
                  const isReceived = item.status === 'recebido';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {formatDate(item.dueDate || item.paymentDate)}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleTransactionStatus(item.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md transition ${
                            isReceived
                              ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
                          }`}
                        >
                          {isReceived ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Recebido
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> A Receber
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right font-black font-mono text-teal-600 dark:text-teal-400">
                        +{formatCurrency(item.amount)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditRevenueModal(item)}
                            className="p-1.5 text-slate-400 hover:text-teal-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Editar receita"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmModal({ open: true, transaction: item })}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Excluir receita"
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
