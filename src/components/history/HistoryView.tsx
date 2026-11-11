import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext.js';
import { api } from '../../services/api.js';
import { Transaction } from '../../types/finance.js';
import { formatCurrency, formatDate, getMonthName, MONTH_NAMES } from '../../utils/formatters.js';
import {
  History,
  Search,
  Filter,
  Download,
  Printer,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Repeat
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { years, categories } = useFinance();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions({
        year: selectedYear !== 'all' ? Number(selectedYear) : undefined,
        month: selectedMonth !== 'all' ? Number(selectedMonth) : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined
      });
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedYear, selectedMonth, typeFilter, categoryFilter, statusFilter, search]);

  // Sort local results
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = a.dueDate || a.createdAt;
      const dateB = b.dueDate || b.createdAt;
      return sortOrder === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    } else if (sortField === 'amount') {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    } else if (sortField === 'title') {
      return sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
    }
    return 0;
  });

  const toggleSort = (field: 'date' | 'amount' | 'title') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Nome', 'Categoria', 'Valor (R$)', 'Vencimento', 'Pagamento', 'Mês', 'Ano', 'Status', 'Descrição'];
    const rows = sortedTransactions.map(t => [
      t.type === 'despesa' ? 'Despesa' : 'Receita',
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount.toFixed(2).replace('.', ','),
      t.dueDate,
      t.paymentDate || '',
      t.month,
      t.year,
      t.status,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `extrato_fincontrol_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary counts
  const totalIn = sortedTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = sortedTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            Histórico & Extrato Geral
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Consulte, filtre e exporte todas as movimentações financeiras cadastradas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 dark:text-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 rounded-xl transition shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 dark:text-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 rounded-xl transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-cyan-500" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por título ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Year */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ano</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Anos</option>
              {years.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mês</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Meses</option>
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Tipos</option>
              <option value="despesa">Apenas Despesas</option>
              <option value="receita">Apenas Receitas</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Categoria</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todas</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.type === 'despesa' ? 'Desp' : 'Rec'})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="atrasado">Atrasado</option>
              <option value="recebido">Recebido</option>
              <option value="a_receber">A Receber</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary totals for current filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 text-xs">
        <span className="text-slate-500 font-medium">
          {sortedTransactions.length} registros encontrados
        </span>

        <div className="flex items-center gap-4 font-mono font-bold">
          <span className="text-teal-600 dark:text-teal-400">
            Total Entradas: +{formatCurrency(totalIn)}
          </span>
          <span className="text-rose-600 dark:text-rose-400">
            Total Saídas: -{formatCurrency(totalOut)}
          </span>
          <span className={`px-2 py-0.5 rounded-md ${totalIn - totalOut >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            Resultado: {formatCurrency(totalIn - totalOut)}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {sortedTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Nenhum registro corresponde aos filtros selecionados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      <span>Descrição / Título</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-1.5">
                      <span>Vencimento / Data</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Período</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Valor (R$)</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sortedTransactions.map(item => {
                  const isExpense = item.type === 'despesa';
                  const isPaid = item.status === 'pago' || item.status === 'recebido';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isExpense ? 'bg-rose-500' : 'bg-teal-500'}`} />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          {item.isRecurring && (
                            <Repeat className="w-3 h-3 text-indigo-400" title="Recorrente" />
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 ml-4 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {formatDate(item.dueDate || item.paymentDate)}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500">
                        {getMonthName(item.month)} / {item.year}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            item.status === 'pago' || item.status === 'recebido'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : item.status === 'atrasado'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {item.status === 'pago' || item.status === 'recebido' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : item.status === 'atrasado' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span className="capitalize">{item.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className={`py-3 px-4 text-right font-black font-mono ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
                        {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
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
