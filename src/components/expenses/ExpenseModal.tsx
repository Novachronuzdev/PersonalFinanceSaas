import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { CurrencyInput } from '../ui/CurrencyInput.js';
import { useFinance } from '../../context/FinanceContext.js';
import { MONTH_NAMES } from '../../utils/formatters.js';
import {
  ExpenseStatus,
  RecurrenceFrequency
} from '../../types/finance.js';
import {
  Calendar,
  Tag,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Repeat,
  Save,
  HelpCircle
} from 'lucide-react';

export const ExpenseModal: React.FC = () => {
  const {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    editingTransaction,
    selectedMonth,
    selectedYear,
    years,
    categories,
    createTransaction,
    updateTransaction,
    createRecurringRule
  } = useFinance();

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [month, setMonth] = useState(selectedMonth);
  const [year, setYear] = useState(selectedYear);
  const [status, setStatus] = useState<ExpenseStatus>('pendente');
  const [description, setDescription] = useState('');

  // Recurrence states for new expenses
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('mensal');
  const [intervalMonths, setIntervalMonths] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Edit recurrence scope option
  const [applyToFuture, setApplyToFuture] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter(c => c.type === 'despesa');

  useEffect(() => {
    if (editingTransaction && editingTransaction.type === 'despesa') {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount);
      setCategory(editingTransaction.category);
      setDueDate(editingTransaction.dueDate);
      setPaymentDate(editingTransaction.paymentDate || '');
      setMonth(editingTransaction.month);
      setYear(editingTransaction.year);
      setStatus(editingTransaction.status as ExpenseStatus);
      setDescription(editingTransaction.description || '');
      setIsRecurring(!!editingTransaction.isRecurring);
      setApplyToFuture(false);
    } else {
      // Default new expense state
      const mStr = selectedMonth.toString().padStart(2, '0');
      const defaultDate = `${selectedYear}-${mStr}-10`;

      setTitle('');
      setAmount(0);
      setCategory(expenseCategories[0]?.name || 'Alimentação');
      setDueDate(defaultDate);
      setPaymentDate('');
      setMonth(selectedMonth);
      setYear(selectedYear);
      setStatus('pendente');
      setDescription('');
      setIsRecurring(false);
      setFrequency('mensal');
      setIntervalMonths(1);
      setStartDate(defaultDate);
      setEndDate('');
      setApplyToFuture(false);
    }
    setError(null);
  }, [editingTransaction, isExpenseModalOpen, selectedMonth, selectedYear]);

  // Auto-sync status and paymentDate
  const handleStatusChange = (newStatus: ExpenseStatus) => {
    setStatus(newStatus);
    const today = new Date().toISOString().split('T')[0];
    if (newStatus === 'pago' && !paymentDate) {
      setPaymentDate(today);
    } else if (newStatus !== 'pago') {
      setPaymentDate('');
    }
  };

  const handleDueDateChange = (newDueDate: string) => {
    setDueDate(newDueDate);
    // Parse month and year from dueDate
    if (newDueDate) {
      const parts = newDueDate.split('-');
      if (parts.length === 3) {
        setYear(parseInt(parts[0]));
        setMonth(parseInt(parts[1]));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o nome da despesa.');
      return;
    }
    if (amount <= 0) {
      setError('Por favor, informe um valor válido em reais (R$).');
      return;
    }
    if (!dueDate) {
      setError('Informe a data de vencimento.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingTransaction) {
        await updateTransaction(
          editingTransaction.id,
          {
            title: title.trim(),
            amount,
            category,
            dueDate,
            paymentDate: status === 'pago' ? (paymentDate || dueDate) : null,
            month,
            year,
            status,
            description: description.trim()
          },
          applyToFuture
        );
      } else {
        if (isRecurring) {
          // Create recurring rule (which also auto-generates instances across months)
          await createRecurringRule({
            title: title.trim(),
            amount,
            type: 'despesa',
            category,
            frequency,
            intervalMonths: frequency === 'anual' ? 12 : intervalMonths,
            startDate: startDate || dueDate,
            endDate: endDate || null,
            dueDay: parseInt(dueDate.split('-')[2]) || 10,
            description: description.trim(),
            active: true
          });
        } else {
          // Single transaction
          await createTransaction({
            title: title.trim(),
            amount,
            type: 'despesa',
            category,
            dueDate,
            paymentDate: status === 'pago' ? (paymentDate || dueDate) : null,
            month,
            year,
            status,
            description: description.trim(),
            isRecurring: false
          });
        }
      }

      setIsExpenseModalOpen(false);
    } catch (err) {
      setError('Ocorreu um erro ao salvar a despesa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isExpenseModalOpen}
      onClose={() => setIsExpenseModalOpen(false)}
      title={editingTransaction ? 'Editar Despesa' : 'Nova Despesa'}
      subtitle={editingTransaction ? 'Modifique os dados da despesa cadastrada' : 'Adicione uma nova saída financeira'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Row 1: Nome da Despesa */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Nome da Despesa <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Supermercado, Aluguel, Conta de Luz..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Row 2: Valor (R$) e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput
            label="Valor em Reais (R$)"
            required
            value={amount}
            onChange={setAmount}
          />

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Categoria <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-1">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 3: Data de Vencimento e Data de Pagamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Data de Vencimento <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => handleDueDateChange(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Data de Pagamento
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={e => {
                setPaymentDate(e.target.value);
                if (e.target.value) setStatus('pago');
              }}
              className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Row 4: Mês e Ano de Referência */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mês de Referência
            </label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
              className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {years.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: Status */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Status do Pagamento
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange('pago')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                status === 'pago'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Pago
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('pendente')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                status === 'pendente'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Pendente
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('atrasado')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                status === 'atrasado'
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Atrasado
            </button>
          </div>
        </div>

        {/* Row 6: Descrição ou Observações */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Descrição ou Observações
          </label>
          <textarea
            rows={2}
            placeholder="Detalhes adicionais, nota fiscal, número do boleto..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* EDITING SCOPE (if recurring transaction) */}
        {editingTransaction && editingTransaction.recurrenceId && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Repeat className="w-4 h-4" /> Despesa Recorrente
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={applyToFuture}
                onChange={e => setApplyToFuture(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Aplicar alterações também nos meses futuros desta série</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Se desmarcado, as alterações serão salvas <strong>apenas</strong> neste mês selecionado.
            </p>
          </div>
        )}

        {/* RECURRING CONFIGURATION (When creating new expense) */}
        {!editingTransaction && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-emerald-500" /> Tornar despesa recorrente
              </span>
            </label>

            {isRecurring && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Frequência
                    </label>
                    <select
                      value={frequency}
                      onChange={e => setFrequency(e.target.value as RecurrenceFrequency)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="mensal">Mensal (todos os meses)</option>
                      <option value="anual">Anual (uma vez ao ano)</option>
                      <option value="personalizada">Personalizada</option>
                    </select>
                  </div>

                  {frequency === 'personalizada' && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">
                        A cada X meses
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={intervalMonths}
                        onChange={e => setIntervalMonths(parseInt(e.target.value) || 1)}
                        className="w-full mt-1 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={startDate || dueDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Data de Término (Opcional)
                    </label>
                    <input
                      type="date"
                      placeholder="Sem término"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ✨ O FinControl lançará esta despesa automaticamente nos meses correspondentes sem duplicar registros.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : (editingTransaction ? 'Salvar Alterações' : 'Cadastrar Despesa')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
