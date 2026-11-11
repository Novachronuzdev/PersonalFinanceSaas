import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { CurrencyInput } from '../ui/CurrencyInput.js';
import { useFinance } from '../../context/FinanceContext.js';
import { MONTH_NAMES } from '../../utils/formatters.js';
import { RevenueStatus } from '../../types/finance.js';
import {
  TrendingUp,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const RevenueModal: React.FC = () => {
  const {
    isRevenueModalOpen,
    setIsRevenueModalOpen,
    editingTransaction,
    selectedMonth,
    selectedYear,
    years,
    categories,
    createTransaction,
    updateTransaction
  } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [month, setMonth] = useState(selectedMonth);
  const [year, setYear] = useState(selectedYear);
  const [status, setStatus] = useState<RevenueStatus>('recebido');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revenueCategories = categories.filter(c => c.type === 'receita');

  useEffect(() => {
    if (editingTransaction && editingTransaction.type === 'receita') {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount);
      setCategory(editingTransaction.category);
      setReceiptDate(editingTransaction.dueDate || editingTransaction.paymentDate || '');
      setMonth(editingTransaction.month);
      setYear(editingTransaction.year);
      setStatus(editingTransaction.status as RevenueStatus);
      setDescription(editingTransaction.description || '');
    } else {
      const mStr = selectedMonth.toString().padStart(2, '0');
      const defaultDate = `${selectedYear}-${mStr}-05`;

      setTitle('');
      setAmount(0);
      setCategory(revenueCategories[0]?.name || 'Salário');
      setReceiptDate(defaultDate);
      setMonth(selectedMonth);
      setYear(selectedYear);
      setStatus('recebido');
      setDescription('');
    }
    setError(null);
  }, [editingTransaction, isRevenueModalOpen, selectedMonth, selectedYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Informe o nome da receita.');
      return;
    }
    if (amount <= 0) {
      setError('Informe um valor válido em reais (R$).');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          title: title.trim(),
          amount,
          category,
          dueDate: receiptDate,
          paymentDate: status === 'recebido' ? receiptDate : null,
          month,
          year,
          status,
          description: description.trim()
        });
      } else {
        await createTransaction({
          title: title.trim(),
          amount,
          type: 'receita',
          category,
          dueDate: receiptDate,
          paymentDate: status === 'recebido' ? receiptDate : null,
          month,
          year,
          status,
          description: description.trim(),
          isRecurring: false
        });
      }

      setIsRevenueModalOpen(false);
    } catch (err) {
      setError('Erro ao salvar a receita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isRevenueModalOpen}
      onClose={() => setIsRevenueModalOpen(false)}
      title={editingTransaction ? 'Editar Receita' : 'Nova Receita'}
      subtitle={editingTransaction ? 'Modifique os detalhes da entrada financeira' : 'Adicione um novo recebimento ou renda'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Nome da Receita */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Nome da Receita <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Salário mensal, Freelance website, Rendimentos..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Valor e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput
            label="Valor Recebido (R$)"
            required
            value={amount}
            onChange={setAmount}
          />

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Categoria <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {revenueCategories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data de Recebimento */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Data de Recebimento <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={receiptDate}
            onChange={e => {
              setReceiptDate(e.target.value);
              if (e.target.value) {
                const parts = e.target.value.split('-');
                if (parts.length === 3) {
                  setYear(parseInt(parts[0]));
                  setMonth(parseInt(parts[1]));
                }
              }
            }}
            className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          />
        </div>

        {/* Mês e Ano de Referência */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mês de Referência
            </label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ano de Referência
            </label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {years.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Status do Recebimento
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('recebido')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                status === 'recebido'
                  ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Recebido (na conta)
            </button>

            <button
              type="button"
              onClick={() => setStatus('a_receber')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                status === 'a_receber'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> A Receber (previsto)
            </button>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Descrição ou Observações
          </label>
          <textarea
            rows={2}
            placeholder="Origem dos recursos, cliente, comprovante..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsRevenueModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-600/25 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : (editingTransaction ? 'Salvar Alterações' : 'Cadastrar Receita')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
